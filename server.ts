import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Create application
const app = express();
app.use(express.json({ limit: "20mb" }));
const PORT = 3000;

// Helper to check for configured Gemini API Key
function isApiKeyConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key !== "" && key !== "MY_GEMINI_API_KEY";
}

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!isApiKeyConfigured()) {
    throw new Error("GEMINI_API_KEY is missing. Please configure your API key in the 'Settings > Secrets' panel of AI Studio.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// REST endpoints for AI operations

// 1. Diagnostics / API Availability check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    apiKeyConfigured: isApiKeyConfigured(),
    time: new Date().toISOString()
  });
});

// 2. Chat Assistant Proxy (Multi-turn conversation flow)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const ai = getGenAI();
    
    // Parse input history to formatted SDK Content array structure
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.text) {
          formattedHistory.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }
    }

    // Structure chat with preloaded history list and system instruction
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction: "You are the ToolVerse Advanced AI Companion. You help the user write, brainstorm, study, code, and solve problems with absolute precision. Use clean Markdown for all outputs.",
      },
    });

    // Send multi-turn message
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with Gemini AI." });
  }
});

// 3. AI Text Tool Proxy (Blog write, resume draft, social captions, essays)
app.post("/api/ai/text", async (req, res) => {
  try {
    const { prompt, toolType, options } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    let systemPrompt = "You are an expert copywriter, author, and content architect.";
    
    if (toolType === "blog") {
      systemPrompt = "You write highly engaging, ATS-optimized, SEO-friendly blogs and essays with beautiful formatting, sections, and callouts.";
    } else if (toolType === "email") {
      systemPrompt = "You write persuasive, professional, and high-impact emails. Provide subject lines and variable placeholders.";
    } else if (toolType === "social") {
      systemPrompt = "You write viral, catchy social media captions, hashtags, and hooks tailored for Twitter, LinkedIn, and Instagram.";
    } else if (toolType === "resume") {
      systemPrompt = "You are a professional resume writer and career expert. Create elegant ATS-optimized resume sections or cover letters.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Text Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with Gemini AI." });
  }
});

// 4. AI Code Companion Proxy (Write, debug, convert languages)
app.post("/api/ai/code", async (req, res) => {
  try {
    const { prompt, action, language } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Code prompt or snippet is required" });
    }

    const ai = getGenAI();
    let systemPrompt = "You are a senior principal software developer and coding expert. Provide clean, well-commented, production-ready code with explainers.";

    if (action === "debug") {
      systemPrompt = "You are an expert debugger. Locate runtime, syntax, or logic errors in the code snippet, rewrite the clean production version, and output a summary of fixes.";
    } else if (action === "convert") {
      systemPrompt = `You translation system. Translate the given code into ${language || "TypeScript"}. Preserve all functionality, logic, and optimize for target-language best practices.`;
    } else if (action === "explain") {
      systemPrompt = "Analyze the provided code and explain what it does in clear step-by-step bullet points, noting any performance or security improvements.";
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview", // Primary complex coding task model
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Low temperature for high precision code tasks
        }
      });
    } catch (modelErr: any) {
      console.warn("Retrying code endpoint with gemini-3.5-flash fallback:", modelErr.message);
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash", // Fast, highly capable free fallback model
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        }
      });
    }

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Code Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with Gemini AI." });
  }
});

// 5. AI Summarizer Proxy (PDF, raw text, or document content summarize)
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { text, type, length } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text content to summarize is required" });
    }

    const ai = getGenAI();
    let lengthGuide = "brief summaries under 3 paragraphs";
    if (length === "bullets") lengthGuide = "bulleted key takeaways and essential list of concepts only";
    if (length === "elevator") lengthGuide = "a sharp, single-sentence high impact pitch statement";
    if (length === "detailed") lengthGuide = "a complete structured breakdown with executive summaries and sections";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: text,
      config: {
        systemInstruction: `You are an elite research summarizer. Take any input document and provide ${lengthGuide}. Avoid jargon, refine logic, and keep spacing pristine.`,
        temperature: 0.5,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Summarize Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with Gemini AI." });
  }
});

// 6. AI Grammar, Spelling & Style Rephrase
app.post("/api/ai/grammar", async (req, res) => {
  try {
    const { text, tone } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getGenAI();
    let systemPrompt = "Fix all grammar, spelling, punctuation, and structural issues. Keep the original meaning but elevate fluency.";
    
    if (tone === "casual") {
      systemPrompt = "Draft a warm, friendly, casual, and highly accessible rephrase of the text while ensuring flawless grammar and modern vernacular.";
    } else if (tone === "professional") {
      systemPrompt = "Elevate the text into formal executive corporate communication. Sound persuasive, smart, respectful, and authoritative.";
    } else if (tone === "creative") {
      systemPrompt = "Add poetic style, unique descriptors, and beautiful styling hooks to draft an imaginative prose translation of the provided text.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Grammar Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with Gemini AI." });
  }
});

// 7. AI Dual-Mode Logo / Vector / Creative Graphic Maker
app.post("/api/ai/image", async (req, res) => {
  try {
    const { prompt, style, resolution } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required" });
    }

    // Since graphic design / logos / widgets are high value, we offer a dual mode:
    // If the style is 'vector' or 'logo', we can generate a gorgeous, fully scalable 
    // vector SVG drawing locally using Gemini 3.5-flash to output SVG source code!
    // If the style is 'photo' or 'wallpaper', we can attempt using gemini-2.5-flash-image 
    // or return standard custom themed procedural assets. Let's build both beautifully!
    
    if (style === "vector" || style === "logo" || style === "avatar" || style === "drawing") {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a gorgeous, professional vector graphic SVG representing this user prompt: "${prompt}".
        The design matches the style request "${style}".
        
        CRITICAL TECHNICAL REQUIRED SPECIFICATIONS:
        1. Output ONLY valid, raw, beautifully formed SVG markup.
        2. Must start with "<svg" and end with "</svg>".
        3. No conversational intros, no markdown code blocks (e.g. do not wrap in \`\`\`xml or \`\`\`svg), just pure raw SVG code directly.
        4. Use wonderful modern colors, gradients (<linearGradient>), lovely paths, shapes, and stylish shadows.
        5. Must have a clean viewBox="0 0 500 500" and specify xmlns="http://www.w3.org/2000/svg".
        6. Keep it responsive, clean, and incredibly beautiful.`,
        config: {
          temperature: 0.7,
        }
      });

      let svgCode = response.text || "";
      // Clean up any accidental markdown blocks that Gemini sometimes outputs despite instructions
      svgCode = svgCode.replace(/```(xml|svg|html)?/gi, "").trim();
      const firstSvgTag = svgCode.indexOf("<svg");
      const lastSvgTag = svgCode.lastIndexOf("</svg>");
      if (firstSvgTag !== -1 && lastSvgTag !== -1) {
        svgCode = svgCode.substring(firstSvgTag, lastSvgTag + 6);
      }

      return res.json({ type: "svg", data: svgCode });
    } else {
      // Photo/Art requested. Let's try gemini-2.5-flash-image if the user has active setup, otherwise fallback to SVG.
      try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `${prompt}, beautiful digital art, highly detailed, masterfully styled, high resolution, ${style || "realistic"}` }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });

        let base64Data = "";
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }

        if (base64Data) {
          return res.json({ type: "image", data: `data:image/png;base64,${base64Data}` });
        } else {
          throw new Error("No image data returned from Gemini.");
        }
      } catch (imageErr: any) {
        console.warn("Gemini Image generation failed or API is free-tier only. Falling back to magnificent procedural generative SVG art.", imageErr);
        // Generative art fallback that writes the visual structure beautifully
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `We are running in standard high-performance mode. Generate an extremely stylish, complex aesthetic modern art composition SVG based on: "${prompt}". 
          Use rich abstract elements, glowing neon gradients, futuristic vectors, smooth coordinates, overlapping shapes, and atmospheric background layers.
          Outputs: ONLY raw, beautifully structured SVG markup starting with <svg and ending with </svg>. No markdown wraps, no talk.`,
          config: { temperature: 0.8 }
        });

        let svgCode = response.text || "";
        svgCode = svgCode.replace(/```(xml|svg|html)?/gi, "").trim();
        const firstSvgTag = svgCode.indexOf("<svg");
        const lastSvgTag = svgCode.lastIndexOf("</svg>");
        if (firstSvgTag !== -1 && lastSvgTag !== -1) {
          svgCode = svgCode.substring(firstSvgTag, lastSvgTag + 6);
        }
        return res.json({ type: "svg", data: svgCode, fallbackUsed: true });
      }
    }
  } catch (err: any) {
    console.error("AI Image Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with Gemini AI." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Started in development mode with active Vite middlewares.");
  } else {
    // Production static serve
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Started in production mode serving compiled static directory.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ToolVerse AI full-stack backend running successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
