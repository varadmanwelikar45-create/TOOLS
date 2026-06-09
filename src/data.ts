/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolItem } from "./types";

export const TOOL_CATALOG: ToolItem[] = [
  // --- AI TOOLS ---
  {
    id: "ai-text",
    name: "AI Copier & Text Engine",
    description: "Write exceptional blog posts, emails, marketing copy, summaries, or stories with adjustable tone selectors.",
    category: "ai",
    hot: true,
    pro: false,
    iconName: "FileText",
    usageCount: 1420
  },
  {
    id: "ai-image",
    name: "AI Graphic & Vector Logo Generator",
    description: "Generate breathtaking procedural custom graphics or raw downloadable SVG logos using advanced dual-mode synthesis.",
    category: "ai",
    hot: true,
    pro: true,
    iconName: "Sparkles",
    usageCount: 3820
  },
  {
    id: "ai-code",
    name: "AI Code Companion & Helper",
    description: "Debug syntax, convert code to multiple languages, optimize routines, or ask structural software engineering questions.",
    category: "ai",
    hot: false,
    pro: true,
    iconName: "Code",
    usageCount: 2210
  },
  {
    id: "ai-chat",
    name: "AI Chat Intelligent Assistant",
    description: "Multi-turn assistant equipped with persistent instruction guidance to talk, learn, solve problems, or research.",
    category: "ai",
    hot: true,
    pro: false,
    iconName: "MessageSquare",
    usageCount: 5120
  },
  {
    id: "ai-summarizer",
    name: "AI Document Summarizer",
    description: "Paste extensive textbook contents, articles, or transcripts to extract bullet-pointers, takeaways, or short pitches.",
    category: "ai",
    hot: false,
    pro: false,
    iconName: "Files",
    usageCount: 950
  },
  {
    id: "ai-grammar",
    name: "AI Fluency & Grammar Reformer",
    description: "Check spelling errors and instant rephrase drafts to level up professional flow, wit, or focus.",
    category: "ai",
    hot: false,
    pro: false,
    iconName: "SpellCheck",
    usageCount: 1040
  },

  // --- IMAGE TOOLS ---
  {
    id: "img-resizer",
    name: "Visual Image Resizer & Presets",
    description: "Resize visual canvas instantly. Apply ready-to-go preset aspect crops for YouTube thumbnails, LinkedIn, and Twitter.",
    category: "image",
    hot: false,
    pro: false,
    iconName: "Crop",
    usageCount: 1820
  },
  {
    id: "img-compressor",
    name: "Lossless Image Compressor",
    description: "Compress standard JPEG, PNG or WebP image files directly in your browser, maintaining amazing visuals.",
    category: "image",
    hot: true,
    pro: false,
    iconName: "Compass",
    usageCount: 2470
  },
  {
    id: "img-converter",
    name: "Image Format Transcoder",
    description: "Transcode any file structure dynamically between standard JPEG, PNG, SVG and progressive Webp formats.",
    category: "image",
    hot: false,
    pro: false,
    iconName: "ArrowLeftRight",
    usageCount: 1910
  },
  {
    id: "img-bgremover",
    name: "Chroma Key Color Transparency Remover",
    description: "Make custom plain backdrops instantly transparent to extract profile logos, avatars, or product layouts.",
    category: "image",
    hot: false,
    pro: false,
    iconName: "Layers",
    usageCount: 780
  },
  {
    id: "img-watermark",
    name: "Secure Watermark Signer",
    description: "Sign images with robust custom text overlay, adjust size, opacity, and custom rotation prior to publishing.",
    category: "image",
    hot: false,
    pro: false,
    iconName: "ShieldAlert",
    usageCount: 520
  },
  {
    id: "img-meme",
    name: "Instant Meme Designer",
    description: "Load meme structures, apply impact fonts, customize top & bottom overlays, and share fully designed cards.",
    category: "image",
    hot: true,
    pro: false,
    iconName: "Smile",
    usageCount: 3100
  },

  // --- PRODUCTIVITY TOOLS ---
  {
    id: "prod-notes",
    name: "Markdown Workspace Notes App",
    description: "Capture, pin, and sync beautiful markdown notes, organized with quick tags and continuous browser autosave caches.",
    category: "productivity",
    hot: true,
    pro: false,
    iconName: "FolderOpen",
    usageCount: 4210
  },
  {
    id: "prod-pomo",
    name: "Ambient Pomodoro focus suite",
    description: "Supercharge work sprints with beautiful high-performance timer loops, focus playlists, checklists, and counters.",
    category: "productivity",
    hot: true,
    pro: false,
    iconName: "Timer",
    usageCount: 5810
  },
  {
    id: "prod-todo",
    name: "Dynamic Priority Task List",
    description: "Categorize to-dos by work or urgent tasks with visual priority markers and instant completion counters.",
    category: "productivity",
    hot: false,
    pro: false,
    iconName: "CheckSquare",
    usageCount: 3200
  },
  {
    id: "prod-habit",
    name: "Visual Habit Streak Tracker",
    description: "Map routine habit checklists, unlock daily streaks, and chart complete calendars with historical maps.",
    category: "productivity",
    hot: false,
    pro: true,
    iconName: "CalendarDays",
    usageCount: 1480
  },

  // --- CALCULATORS ---
  {
    id: "calc-age",
    name: "Age & Lifetime Milestone Analyst",
    description: "Unravel your complete age details in days, months, seconds, and display a ticking countdown to your next birthday.",
    category: "calculator",
    hot: false,
    pro: false,
    iconName: "Calendar",
    usageCount: 880
  },
  {
    id: "calc-bmi",
    name: "Smart BMI Fitness Analyst",
    description: "Understand Body Mass Index instantly with guidance profiles, target weights, metric structures, and tips.",
    category: "calculator",
    hot: false,
    pro: false,
    iconName: "Activity",
    usageCount: 1540
  },
  {
    id: "calc-percent",
    name: "Percentage & Discount Engine",
    description: "Calculate immediate invoice discounts, speed margins, markups, increases, and markup differences.",
    category: "calculator",
    hot: false,
    pro: false,
    iconName: "Percent",
    usageCount: 910
  },
  {
    id: "calc-emi",
    name: "Mortgage & Loan EMI Calculator",
    description: "Map out car/home monthly plans with visual interactive amortization charts detailing principal vs interest.",
    category: "calculator",
    hot: true,
    pro: false,
    iconName: "Calculator",
    usageCount: 2280
  },
  {
    id: "calc-gst",
    name: "VAT & Sales GST Tax Splitter",
    description: "Split inclusive/exclusive tax margins instantly based on custom % states with complete breakdowns.",
    category: "calculator",
    hot: false,
    pro: false,
    iconName: "Layers3",
    usageCount: 1120
  },
  {
    id: "calc-science",
    name: "Scientific Advanced Calculator",
    description: "Perform advanced logarithmic, trigonometric, parentheses, backspace, mathematical equations and recall states.",
    category: "calculator",
    hot: false,
    pro: false,
    iconName: "Binary",
    usageCount: 710
  },

  // --- CONVERTERS ---
  {
    id: "conv-unit",
    name: "Omni-Unit Standard Converter",
    description: "Perform instant unit conversion across Weight, length, Area, Speed, Temp, Data storage and volume grids.",
    category: "converter",
    hot: false,
    pro: false,
    iconName: "Coins",
    usageCount: 1950
  },
  {
    id: "conv-currency",
    name: "Simulated Live Currency Exchange",
    description: "Convert international Currencies using simulated live data, history curves, and fast cache lists.",
    category: "converter",
    hot: true,
    pro: true,
    iconName: "TrendingUp",
    usageCount: 3100
  },
  {
    id: "conv-timezone",
    name: "World Clock & Timezone Planner",
    description: "Track global clocks, search custom zones, and match exact meeting times safely without overlapping.",
    category: "converter",
    hot: false,
    pro: false,
    iconName: "Clock",
    usageCount: 840
  },

  // --- DEVELOPER TOOLS ---
  {
    id: "dev-json",
    name: "JSON Syntactic Formatter & Tree",
    description: "Beautify, compact, validate JSON datasets, locate syntax errors, and navigate collapsible interactive hierarchy trees.",
    category: "developer",
    hot: true,
    pro: false,
    iconName: "Braces",
    usageCount: 4890
  },
  {
    id: "dev-qr",
    name: "Vector QR Code Maker",
    description: "Generate QR codes for URLs, WiFi credentials, VCards or custom text with personalized colors, padding, and center logos.",
    category: "developer",
    hot: true,
    pro: false,
    iconName: "QrCode",
    usageCount: 5210
  },
  {
    id: "dev-password",
    name: "Symmetric Password Generator",
    description: "Draft highly secure passwords with length slides, character inclusions, copiers, and visual strength index checkers.",
    category: "developer",
    hot: false,
    pro: false,
    iconName: "Lock",
    usageCount: 2310
  },
  {
    id: "dev-encoders",
    name: "Base64 & URL Transformer",
    description: "Encode or decode strings using Base64 standards and clean URL escaping parameters in single clicks.",
    category: "developer",
    hot: false,
    pro: false,
    iconName: "Shuffle",
    usageCount: 1100
  },
  {
    id: "dev-jwt",
    name: "JSON Web Token Inspect Engine",
    description: "Parse JWT, instantly decode header, payload datasets, check signature integrity indicators.",
    category: "developer",
    hot: false,
    pro: false,
    iconName: "Key",
    usageCount: 1620
  },
  {
    id: "dev-uuid",
    name: "Bulk UUID & SHA Hash Maker",
    description: "Generate cryptographic bulk UUIDs and MD5/SHA256 checksum hashes for verification routines.",
    category: "developer",
    hot: false,
    pro: false,
    iconName: "Shield",
    usageCount: 1750
  },
  {
    id: "dev-color",
    name: "Color Palette & Hex Designer",
    description: "Explore color values, view HSL/RGB codes, generate random CSS backgrounds, and map beautiful gradients.",
    category: "developer",
    hot: true,
    pro: false,
    iconName: "Palette",
    usageCount: 3910
  }
];

export const GENERAL_BLOG_MOCK_PROMPTS = [
  { title: "ChatGPT Future", prompt: "Write an inspiring 600-word blog post of the role of AI tools in next-generation web platforms." },
  { title: "Career Advice", prompt: "Draft a solid cover letter applying for a Senior React Engineer role using a polite tone." },
  { title: "Coding Interview Advice", prompt: "Explain how to practice dynamic programming concepts in 10 simple bullet points." }
];
