/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, FileText, Code, MessageSquare, Files, SpellCheck, 
  Send, Bot, User, Copy, Check, RefreshCw, Zap, ArrowRight, Download, Eye
} from "lucide-react";
import { ToolItem, UserState } from "../types";

interface AiToolsProps {
  tool: ToolItem;
  userState: UserState;
  updateUserState: (updater: (prev: UserState) => UserState) => void;
  onAddHistory: (toolId: string, toolName: string, desc: string) => void;
}

// Highly robust custom markdown & code highlighting parser
export function SimpleMarkdownRenderer({ content }: { content: string }) {
  if (!content) return <span className="text-zinc-400 font-sans">Awaiting instructions...</span>;

  // Split content by code blocks
  const parts = content.split("```");
  
  return (
    <div className="space-y-4 font-sans text-sm leading-relaxed text-zinc-700">
      {parts.map((part, index) => {
        // Even indices are standard markdown text, odd indices are code blocks
        if (index % 2 === 1) {
          const lines = part.split("\n");
          const language = lines[0]?.trim() || "typescript";
          const code = lines.slice(1).join("\n").trim();
          
          return <CodeSnippet key={index} code={code} language={language} />;
        }

        // Parse lists, headers, bold, and paragraphs
        const textLines = part.split("\n");
        return (
          <div key={index} className="space-y-2">
            {textLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Bullet points
              if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-4">
                    <span className="text-indigo-600 mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <span className="text-zinc-700">{parseInlineMarkdown(trimmed.substring(2))}</span>
                  </div>
                );
              }

              // Numbered lists
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s(.*)/);
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-4">
                    <span className="text-indigo-600 font-mono text-xs shrink-0 mt-0.5">{match ? match[1] : lIdx}.</span>
                    <span className="text-zinc-700">{parseInlineMarkdown(match ? match[2] : trimmed)}</span>
                  </div>
                );
              }

              // Headers
              if (trimmed.startsWith("### ")) {
                return <h4 key={lIdx} className="text-sm font-bold text-zinc-900 mt-4">{parseInlineMarkdown(trimmed.substring(4))}</h4>;
              }
              if (trimmed.startsWith("## ")) {
                return <h3 key={lIdx} className="text-base font-extrabold text-zinc-900 mt-6 border-b border-zinc-100 pb-1">{parseInlineMarkdown(trimmed.substring(3))}</h3>;
              }
              if (trimmed.startsWith("# ")) {
                return <h2 key={lIdx} className="text-lg font-black text-zinc-900 mt-8">{parseInlineMarkdown(trimmed.substring(2))}</h2>;
              }

              return <p key={lIdx} className="text-zinc-750 leading-relaxed">{parseInlineMarkdown(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-zinc-900">{part.slice(2, -2)}</strong>;
    }
    // Handle inline code `code`
    const codeParts = part.split(/(`.*?`)/g);
    if (codeParts.length > 1) {
      return codeParts.map((sub, sIdx) => {
        if (sub.startsWith("`") && sub.endsWith("`")) {
          return <code key={sIdx} className="font-mono text-xs bg-zinc-105 border border-zinc-200 text-pink-650 font-medium px-1.5 py-0.5 rounded">{sub.slice(1, -1)}</code>;
        }
        return sub;
      });
    }
    return part;
  });
}

interface CodeSnippetProps {
  code: string;
  language: string;
  key?: unknown;
}

function CodeSnippet({ code, language }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 font-mono text-xs shadow-md my-4">
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-4 py-2">
        <span className="text-indigo-400 text-[10px] uppercase font-bold tracking-wider">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-350 text-left leading-relaxed max-h-96 custom-scrollbar"><code>{code}</code></pre>
    </div>
  );
}

export default function AiToolsComponent({ tool, userState, updateUserState, onAddHistory }: AiToolsProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Generic states
  const [textPrompt, setTextPrompt] = useState("");
  
  // Sub-app specific values
  // AI Image States
  const [imageStyle, setImageStyle] = useState<"vector" | "logo" | "avatar" | "realistic" | "anime">("vector");
  const [generatedImg, setGeneratedImg] = useState<string>("");
  const [generatedSvgCode, setGeneratedSvgCode] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual");

  // AI Text States
  const [textSubtype, setTextSubtype] = useState<"blog" | "email" | "social" | "resume">("blog");
  const [textTone, setTextTone] = useState<"creative" | "professional" | "casual">("creative");

  // AI Code States
  const [codeAction, setCodeAction] = useState<"write" | "debug" | "explain" | "convert">("write");
  const [codeLanguage, setCodeLanguage] = useState<string>("TypeScript");

  // AI Summarizer States
  const [summarizeLength, setSummarizeLength] = useState<"bullets" | "elevator" | "detailed">("bullets");

  // AI Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { role: "model", text: "Hello! I am your ToolVerse AI Companion. Ask me anything, or give me a task to complete. I can write prose, review complex algorithms, or plan projects for you." }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const triggerSearchGroundingUI = () => {
    // Optionally trigger AI Studio UI components here if requested in flow
  };

  const handleRunAiTool = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Clear old errors
    setErrorMsg("");
    
    // Check Prompt
    const mainPromptString = tool.id === "ai-chat" ? chatInput : textPrompt;
    if (!mainPromptString.trim() && tool.id !== "ai-chat") {
      setErrorMsg("Please provide a prompt or description to begin.");
      return;
    }

    setLoading(true);

    try {
      if (tool.id === "ai-chat") {
        const currentInputValue = chatInput;
        setChatMessages(prev => [...prev, { role: "user", text: currentInputValue }]);
        setChatInput("");

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: currentInputValue,
            history: chatMessages
          })
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        setChatMessages(prev => [...prev, { role: "model", text: data.text }]);
        onAddHistory(tool.id, tool.name, `Conversation: "${currentInputValue.slice(0, 30)}..."`);
      } 
      
      else if (tool.id === "ai-text" || tool.id === "ai-grammar") {
        const endpoint = tool.id === "ai-text" ? "/api/ai/text" : "/api/ai/grammar";
        const bodyObj = tool.id === "ai-text" 
          ? { prompt: textPrompt, toolType: textSubtype, options: { tone: textTone } }
          : { text: textPrompt, tone: textTone };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyObj)
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);
        setResponse(data.text);
        onAddHistory(tool.id, tool.name, `Generated text for prompt: "${textPrompt.slice(0, 35)}..."`);
      } 
      
      else if (tool.id === "ai-code") {
        const res = await fetch("/api/ai/code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textPrompt, action: codeAction, language: codeLanguage })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);
        setResponse(data.text);
        onAddHistory(tool.id, tool.name, `Code assistance task [${codeAction}]: "${textPrompt.slice(0, 35)}..."`);
      } 
      
      else if (tool.id === "ai-summarizer") {
        const res = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textPrompt, length: summarizeLength })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);
        setResponse(data.text);
        onAddHistory(tool.id, tool.name, `Summarized content: "${textPrompt.slice(0, 40)}..."`);
      } 
      
      else if (tool.id === "ai-image") {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textPrompt, style: imageStyle })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        if (data.type === "svg") {
          setGeneratedSvgCode(data.data);
          setGeneratedImg("");
        } else {
          setGeneratedImg(data.data);
          setGeneratedSvgCode("");
        }

        onAddHistory(tool.id, tool.name, `Created digital graphic: "${textPrompt.slice(0, 35)}..."`);
      }

      // Credits are not decremented as this workspace is fully Pro unlocked
      updateUserState(prev => ({
        ...prev,
        credits: 999999
      }));

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "A network failure or API key error occurred. Please verify your GEMINI_API_KEY in Secrets.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSVG = () => {
    if (!generatedSvgCode) return;
    const blob = new Blob([generatedSvgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${textPrompt.toLowerCase().replace(/\s+/g, "_") || "vector"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    if (!generatedImg) return;
    const link = document.createElement("a");
    link.href = generatedImg;
    link.download = `${textPrompt.toLowerCase().replace(/\s+/g, "_") || "ai_photo"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto rounded-3xl" id={`tool-panel-${tool.id}`}>
      
      {/* LEFT: Inputs & Control Settings */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl text-left relative overflow-hidden shadow-sm">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <span className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl">
              {tool.id === "ai-image" ? <Sparkles size={20} /> :
               tool.id === "ai-text" ? <FileText size={20} /> :
               tool.id === "ai-code" ? <Code size={20} /> :
               tool.id === "ai-chat" ? <MessageSquare size={20} /> :
               tool.id === "ai-summarizer" ? <Files size={20} /> :
               <SpellCheck size={20} />}
            </span>
            <div>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">{tool.name}</h3>
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">Gemini Processor Engine</p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-150 mb-6 font-sans">
            {tool.description}
          </p>

          {/* Sub-Configurations based on Active Tool */}

          {/* AI IMAGE CONTROLS */}
          {tool.id === "ai-image" && (
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-bold text-zinc-750 block mb-2 font-sans uppercase tracking-wider text-[10px]">Creative Format & Engine</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "vector", label: "Scalable Vector (SVG)" },
                    { val: "logo", label: "Minimalist Logo" },
                    { val: "avatar", label: "Custom Avatar" },
                    { val: "realistic", label: "Realistic Digital Art" }
                  ].map(styleOpt => (
                    <button
                      key={styleOpt.val}
                      onClick={() => setImageStyle(styleOpt.val as any)}
                      className={`text-xs p-2.5 rounded-lg border text-base text-center transition-all cursor-pointer font-semibold ${
                        imageStyle === styleOpt.val 
                          ? "bg-zinc-900 border-zinc-900 text-white" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI TEXT CONTROLS */}
          {tool.id === "ai-text" && (
            <div className="space-y-4 mb-5">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "blog", name: "SEO Blog Post" },
                  { id: "email", name: "High-impact Email" },
                  { id: "social", name: "Social Caption" },
                  { id: "resume", name: "CV / Cover Letter" }
                ].map(subtype => (
                  <button
                    key={subtype.id}
                    onClick={() => setTextSubtype(subtype.id as any)}
                    className={`text-xs p-2.5 rounded-lg border text-center transition-all cursor-pointer font-semibold ${
                      textSubtype === subtype.id
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                        : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {subtype.name}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-750 block mb-2 font-sans uppercase tracking-wider text-[10px]">Adjust Tone Matrix</label>
                <div className="flex gap-2">
                  {["creative", "professional", "casual"].map(tone => (
                    <button
                      key={tone}
                      onClick={() => setTextTone(tone as any)}
                      className={`text-[11px] py-1.5 rounded-full capitalize border transition-all flex-1 cursor-pointer font-bold ${
                        textTone === tone 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                          : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI CODE CONTROLS */}
          {tool.id === "ai-code" && (
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-bold text-zinc-750 block mb-2 font-sans uppercase tracking-wider text-[10px]">Select Code Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "write", label: "Write Boilerplate" },
                    { id: "debug", label: "Locate Bugs" },
                    { id: "explain", label: "Explain Step-by-Step" },
                    { id: "convert", label: "Convert Language" }
                  ].map(action => (
                    <button
                      key={action.id}
                      onClick={() => setCodeAction(action.id as any)}
                      className={`text-xs p-2.5 rounded-lg border text-center transition-all cursor-pointer font-semibold ${
                        codeAction === action.id
                          ? "bg-zinc-900 border-zinc-900 text-white font-semibold"
                          : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {codeAction === "convert" && (
                <div>
                  <label className="text-xs font-bold text-zinc-75s block mb-1.5 font-sans uppercase tracking-wider text-[10px]">Target Language</label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-800 p-2.5 rounded-lg outline-none focus:border-zinc-400 font-sans cursor-pointer font-semibold"
                  >
                    <option>TypeScript/React</option>
                    <option>Python</option>
                    <option>Go Lang</option>
                    <option>SQL (Postgres)</option>
                    <option>Java</option>
                    <option>C++</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* AI SUMMARIZER CONTROLS */}
          {tool.id === "ai-summarizer" && (
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-bold text-zinc-750 block mb-2 font-sans uppercase tracking-wider text-[10px]">Target Summary Length</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "bullets", val: "Key Bullets" },
                    { id: "elevator", val: "Elevator Pitch" },
                    { id: "detailed", val: "Full Breakdown" }
                  ].map(len => (
                    <button
                      key={len.id}
                      onClick={() => setSummarizeLength(len.id as any)}
                      className={`text-[11px] p-2 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                        summarizeLength === len.id
                          ? "bg-zinc-900 border-zinc-900 text-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {len.val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main prompt input box */}
          {tool.id !== "ai-chat" && (
            <div className="mt-4">
              <label className="text-xs font-bold text-zinc-750 block mb-2 uppercase tracking-wide text-[10px]">
                {tool.id === "ai-image" ? "What would you like to design?" : "Enter Prompt / Context Input"}
              </label>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder={
                  tool.id === "ai-image" ? 'e.g., "Minimalist rocket launching from laptop, vibrant gradient background, flat style vector"' :
                  tool.id === "ai-text" ? 'e.g., "Write a blog about the benefits of local storage in single page apps"' :
                  tool.id === "ai-code" ? 'e.g., "Write an Express endpoint proxying custom WebSockets with node..."' :
                  tool.id === "ai-summarizer" ? "Paste a long text here to extract beautiful structural bullet summaries..." :
                  'e.g., "Enter text that needs spelling and structural flow checks..."'
                }
                rows={6}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 text-zinc-850 placeholder-zinc-400 p-3.5 rounded-xl focus:border-zinc-400 focus:bg-white outline-none transition-all leading-relaxed custom-scrollbar font-sans"
              />
            </div>
          )}

          {errorMsg && (
            <div className="text-xs bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg leading-relaxed mt-4 font-sans text-left">
              {errorMsg}
            </div>
          )}

          {tool.id !== "ai-chat" && (
            <button
              onClick={() => handleRunAiTool()}
              disabled={loading}
              className="w-full mt-5 bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} className="fill-current" />}
              {loading ? "Generating Core Models..." : "Process AI Tool"}
            </button>
          )}
        </div>

        {/* Dynamic usage tips widget */}
        <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl text-left shadow-sm">
          <h4 className="text-[10px] font-bold text-zinc-755 uppercase tracking-wider mb-1">Sandbox Guidelines</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
            Your ToolVerse workspace is fully upgraded to PRO. All tools, model processes, and generators are completely unlocked with unlimited credits!
          </p>
        </div>
      </div>

      {/* RIGHT: Results & Terminals */}
      <div className="lg:col-span-7 flex flex-col min-h-[480px]">
        {/* Terminals space */}
        <div className="bg-white border border-zinc-150 rounded-2xl flex-1 flex flex-col overflow-hidden text-left shadow-sm">
          
          {/* Header bar of Result */}
          <div className="flex items-center justify-between border-b border-zinc-150 px-6 py-4 bg-zinc-50 leading-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-zinc-700 font-sans flex items-center gap-1.5">
                <Bot size={14} className="text-zinc-500 shrink-0" /> Unified Output Terminal
              </span>
            </div>
            
            {loading && (
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold flex items-center gap-1.5 animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> MODEL_RUNNING
              </span>
            )}
          </div>

          {/* SCREEN PANEL DYNAMIC LOAD */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[640px] custom-scrollbar">
            
            {/* 1. CHAT MESSAGES DISPLAY */}
            {tool.id === "ai-chat" ? (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className="flex-1 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div className={`p-2.5 rounded-full ${
                        msg.role === "user" ? "bg-indigo-100 text-indigo-750 border border-indigo-200" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      } h-9 w-9 shrink-0 flex items-center justify-center`}>
                        {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-left border ${
                        msg.role === "user" 
                          ? "bg-indigo-50 border-indigo-100/50 text-zinc-800" 
                          : "bg-zinc-50 border-zinc-150 text-zinc-850"
                      }`}>
                        <SimpleMarkdownRenderer content={msg.text} />
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Inline chat form */}
                <form onSubmit={handleRunAiTool} className="mt-8 pt-4 border-t border-zinc-200 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask ToolVerse anything..."
                    disabled={loading}
                    className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-805 placeholder-zinc-400 rounded-lg px-4 py-3 text-xs outline-none focus:border-zinc-400 focus:bg-white transition-all font-sans shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={loading || !chatInput.trim()}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-4 py-3 transition-all cursor-pointer font-semibold text-xs flex items-center justify-center shrink-0"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            ) : 

            // 2. IMAGE VECTOR ART DISPLAY
            tool.id === "ai-image" ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                {generatedSvgCode || generatedImg ? (
                  <div className="w-full space-y-6 flex flex-col items-center">
                    
                    {/* Mode Toggle Code vs Render */}
                    {generatedSvgCode && (
                      <div className="flex gap-1 bg-zinc-50 border border-zinc-200 p-1 rounded-lg">
                        <button
                          onClick={() => setPreviewMode("visual")}
                          className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            previewMode === "visual" ? "bg-white border border-zinc-200 text-zinc-850 font-bold shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                          }`}
                        >
                          <Eye size={12} /> Render Canvas
                        </button>
                        <button
                          onClick={() => setPreviewMode("code")}
                          className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            previewMode === "code" ? "bg-white border border-zinc-200 text-zinc-850 font-bold font-mono shadow-sm" : "text-zinc-500 hover:text-zinc-800 font-mono"
                          }`}
                        >
                          <Code size={12} /> Source Code
                        </button>
                      </div>
                    )}

                    <div className="w-full max-w-sm aspect-square bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-250 shadow-inner flex items-center justify-center p-6 relative">
                      {previewMode === "visual" && generatedSvgCode ? (
                        <div 
                          className="w-full h-full flex items-center justify-center svg-container [&>svg]:max-w-full [&>svg]:max-h-full"
                          dangerouslySetInnerHTML={{ __html: generatedSvgCode }}
                        />
                      ) : previewMode === "code" && generatedSvgCode ? (
                        <textarea
                          readOnly
                          value={generatedSvgCode}
                          className="w-full h-full bg-zinc-950 text-[10px] font-mono text-zinc-300 p-4 rounded-xl border border-zinc-850 resize-none custom-scrollbar"
                        />
                      ) : (
                        <img 
                          src={generatedImg} 
                          alt="AI Crafted Art" 
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={generatedSvgCode ? handleDownloadSVG : handleDownloadImage}
                        className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Download size={13} /> {generatedSvgCode ? "Download Vector SVG" : "Download PNG Graphic"}
                      </button>
                      <button
                        onClick={() => { setGeneratedSvgCode(""); setGeneratedImg(""); }}
                        className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-650 text-xs px-4 py-2.5 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Refresh Canvas
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-xs p-6 border border-zinc-200 rounded-xl bg-zinc-50 mx-auto">
                    <Sparkles size={32} className="text-zinc-400 mx-auto" />
                    <p className="text-xs text-zinc-505 leading-relaxed font-sans">
                      Submit a creative description to invoke our multi-agent model logic. It will deliver robust high fidelity vectors or deep digital canvas illustrations.
                    </p>
                  </div>
                )}
              </div>
            ) : 

            // 3. TEXT/CODE STANDARD MARKDOWN RENDERERS
            (
              <div className="font-sans">
                {response ? (
                  <div className="relative">
                    <div className="absolute top-0 right-0 z-10">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(response);
                        }}
                        className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer font-semibold"
                      >
                        <Copy size={12} /> Copy Output
                      </button>
                    </div>
                    <div className="pt-10">
                      <SimpleMarkdownRenderer content={response} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-20 text-zinc-400 gap-3">
                    <Bot size={36} className="text-zinc-350" />
                    <div>
                      <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-sans">
                        Configure options on the left and hit 'Process AI Tool' to stream instant outputs.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
