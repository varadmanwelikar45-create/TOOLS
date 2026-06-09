/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { 
  Sparkles, Search, MessageSquare, ShieldCheck, Heart, Clock, Code,
  Coins, LayoutGrid, Timer, Laptop, CheckSquare, UserCheck, CreditCard,
  Crown, Cpu, HardDrive, Terminal, Star, ArrowLeft, ChevronRight, X
} from "lucide-react";
import { TOOL_CATALOG } from "./data";
import { ToolItem, UserState } from "./types";

// Import modules
import AiToolsComponent from "./components/AiToolsComponent";
import ImageToolsComponent from "./components/ImageToolsComponent";
import ProductivityToolsComponent from "./components/ProductivityToolsComponent";
import CalculatorsComponent from "./components/CalculatorsComponent";
import DeveloperToolsComponent from "./components/DeveloperToolsComponent";
import ConvertersComponent from "./components/ConvertersComponent";

export default function App() {
  
  // --- USER PERSISTENT PROFILE STATE ---
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem("toolverse_user_profile");
    const parsed = saved ? JSON.parse(saved) : {
      credits: 999999,
      isPro: true,
      favorites: ["ai-text", "prod-pomo", "dev-qr"],
      history: [],
      achievements: []
    };
    // Force active subscription and infinite credits on load
    parsed.isPro = true;
    parsed.credits = 999999;
    return parsed;
  });

  const [authModal, setAuthModal] = useState(false);
  const [currentProfileName, setCurrentProfileName] = useState<string>(() => {
    return localStorage.getItem("toolverse_username") || "Guest Sandbox User";
  });
  const [isLogged, setIsLogged] = useState<boolean>(() => {
    return localStorage.getItem("toolverse_islogged") === "true";
  });

  // Keep Profile Synced
  useEffect(() => {
    localStorage.setItem("toolverse_user_profile", JSON.stringify(user));
  }, [user]);

  // --- CATALOG LIST & FILTERS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // Filter Logic
  const filteredTools = TOOL_CATALOG.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "favorites") return matchesSearch && user.favorites.includes(tool.id);
    return matchesSearch && tool.category === selectedCategory;
  });

  const activeTool = TOOL_CATALOG.find(t => t.id === activeToolId);

  // History Tracker Pipeline
  const handleAddHistoryLog = (toolId: string, toolName: string, details: string) => {
    const logItem = {
      id: `log-${Date.now()}`,
      toolId,
      toolName,
      timestamp: new Date().toISOString(),
      details
    };
    setUser(prev => ({
      ...prev,
      credits: 999999,
      history: [logItem, ...prev.history.slice(0, 19)]
    }));
  };

  const handleToggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUser(prev => {
      const exists = prev.favorites.includes(toolId);
      const updated = exists 
        ? prev.favorites.filter(id => id !== toolId)
        : [...prev.favorites, toolId];
      return { ...prev, favorites: updated, isPro: true, credits: 999999 };
    });
  };

  const handleLoginSimulation = (name: string, email: string) => {
    setIsLogged(true);
    setCurrentProfileName(name);
    localStorage.setItem("toolverse_username", name);
    localStorage.setItem("toolverse_islogged", "true");
    setAuthModal(false);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setCurrentProfileName("Guest Sandbox User");
    localStorage.setItem("toolverse_username", "Guest Sandbox User");
    localStorage.setItem("toolverse_islogged", "false");
    setUser({
      credits: 999999,
      isPro: true,
      favorites: ["ai-text", "prod-pomo", "dev-qr"],
      history: [],
      achievements: []
    });
  };

  // Category Color Scheme Helper
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai": return { bg: "bg-indigo-500/10 border-indigo-500/15", text: "text-indigo-400" };
      case "image": return { bg: "bg-cyan-500/10 border-cyan-500/15", text: "text-cyan-400" };
      case "productivity": return { bg: "bg-emerald-500/10 border-emerald-500/15", text: "text-emerald-400" };
      case "calculator": return { bg: "bg-amber-500/10 border-amber-500/15", text: "text-amber-400" };
      case "converter": return { bg: "bg-purple-500/10 border-purple-500/15", text: "text-purple-400" };
      case "developer": return { bg: "bg-pink-500/10 border-pink-500/15", text: "text-pink-400" };
      default: return { bg: "bg-white/5 border-white/10", text: "text-white/80" };
    }
  };

  // Icon Matcher Helper
  const getDynamicIconComponent = (name: string, className = "text-indigo-400 shrink-0", size = 18) => {
    const IconC = (Icons as any)[name] || Icons.HelpCircle;
    return <IconC className={className} size={size} />;
  };

  return (
    <div className="min-h-screen premium-gradient text-zinc-50 font-sans flex flex-col items-center relative overflow-x-hidden">
      
      {/* 1. SOLID GRADIENT BACKGROUND FLUID DECORATION */}
      <div className="fixed top-[-10%] left-[-15%] h-[400px] w-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-15%] h-[400px] w-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 2. NAVIGATION BAR */}
      <nav className="w-full sticky top-0 border-b border-white/5 glass z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Title */}
          <div 
            onClick={() => setActiveToolId(null)}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-all shadow-lg shadow-indigo-600/20">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-white select-none">
              ToolVerse <span className="accent-text font-extrabold text-indigo-400">AI</span>
            </span>
          </div>

          {/* Quick Stats & User Status */}
          <div className="flex items-center gap-4">
            
            <div className="hidden sm:flex items-center gap-3 glass px-3.5 py-1.5 rounded-full border border-white/5 text-xs">
              <span className="text-white/60">Balance:</span>
              <span className="font-mono font-bold text-cyan-400">Unlimited Credits</span>
            </div>

            <span className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-500 border border-yellow-500/15 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
              <Crown size={11} className="fill-current animate-pulse" /> Pro Member
            </span>

            {/* Profile Avatar Trigger Button */}
            <button 
              onClick={() => setAuthModal(true)}
              className="flex items-center gap-2 glass hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all cursor-pointer outline-none text-left"
            >
              <span className="h-5 w-5 bg-indigo-500/20 text-indigo-400 text-xs font-extrabold rounded-full flex items-center justify-center">
                {currentProfileName.charAt(0).toUpperCase()}
              </span>
              <span className="text-[11px] font-semibold text-white/80 max-w-[90px] truncate hidden sm:inline">
                {currentProfileName}
              </span>
            </button>

          </div>

        </div>
      </nav>

      {/* 3. CORE LAYOUT FRAME */}
      <main className="w-full flex-1 max-w-7xl px-6 py-10 z-10 flex flex-col gap-10">

        {activeTool ? (
          
          // --- STAGE A: EXPANDED ACTIVE WORKSPACE WRAPPING STAGE ---
          <div className="space-y-6 text-left">
            
            {/* Breadcrumb row */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5">
              <button
                onClick={() => setActiveToolId(null)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer leading-none"
              >
                <ArrowLeft size={14} /> Back to Catalog Deck
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">Category / {activeTool.category} /</span>
                <span className="text-xs font-bold text-white">{activeTool.name}</span>
                <span className="bg-yellow-400/15 text-yellow-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">UNLOCKED</span>
              </div>
            </div>

            <div className="w-full animate-fade-in text-left">
              {activeTool.category === "ai" && <AiToolsComponent tool={activeTool} userState={user} updateUserState={setUser} onAddHistory={handleAddHistoryLog} />}
              {activeTool.category === "image" && <ImageToolsComponent tool={activeTool} onAddHistory={handleAddHistoryLog} />}
              {activeTool.category === "productivity" && <ProductivityToolsComponent tool={activeTool} onAddHistory={handleAddHistoryLog} />}
              {activeTool.category === "calculator" && <CalculatorsComponent tool={activeTool} onAddHistory={handleAddHistoryLog} />}
              {activeTool.category === "developer" && <DeveloperToolsComponent tool={activeTool} onAddHistory={handleAddHistoryLog} />}
              {activeTool.category === "converter" && <ConvertersComponent tool={activeTool} onAddHistory={handleAddHistoryLog} />}
            </div>

          </div>

        ) : (
          
          // --- STAGE B: CENTRAL DIRECTORY & HERO LAYOUT ---
          <div className="space-y-10">

            {/* Welcome Hero Landing */}
            <div className="text-center space-y-6 max-w-3xl mx-auto py-6">
              
              <div className="inline-flex items-center gap-1.5 glass bg-indigo-500/5 px-3 py-1.5 border border-indigo-500/10 rounded-full text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">
                <Sparkles size={11} className="animate-pulse" /> Sandbox Platform Workspace Active
              </div>

              <div className="space-y-4 text-center leading-tight max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  One Toolkit.<br />
                  <span className="accent-text font-extrabold select-none">Infinite AI Possibilities.</span>
                </h1>
                <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Access 100+ premium AI utilities, converters, and generators in a single workspace. Click any interface below to begin compiling results dynamically.
                </p>
              </div>

              {/* Dynamic responsive Search widget */}
              <div className="relative max-w-xl mx-auto">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text"
                  placeholder="Search for any tool (e.g. Image Upscaler, JSON Formatter, Unit Converter...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass bg-white/5 py-3.5 pl-12 pr-4 rounded-2xl border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans shadow-inner"
                />
              </div>

            </div>

            {/* Responsive Categories filter bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto py-2">
              {[
                { id: "all", label: "All Utilities", sym: <LayoutGrid size={11} /> },
                { id: "favorites", label: "Favorites Star", sym: <Heart size={11} /> },
                { id: "ai", label: "AI Engines", sym: <Sparkles size={11} /> },
                { id: "image", label: "Image Studio", sym: <Laptop size={11} /> },
                { id: "productivity", label: "Productivity", sym: <CheckSquare size={11} /> },
                { id: "calculator", label: "Calculators", sym: <Coins size={11} /> },
                { id: "converter", label: "Converters", sym: <Timer size={11} /> },
                { id: "developer", label: "Developer", sym: <Code size={11} /> }
              ].map(cat => {
                let text = cat.label;
                if (cat.id === "favorites") {
                  text = `Favorites (${user.favorites.length})`;
                }
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-full border transition-all cursor-pointer font-semibold select-none ${
                      selectedCategory === cat.id 
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/10" 
                        : "glass border-white/5 text-white/60 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {cat.sym} {text}
                  </button>
                );
              })}
            </div>

            {/* Main grid of cards catalog */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {filteredTools.map(tool => {
                const isFav = user.favorites.includes(tool.id);
                const colorScheme = getCategoryColor(tool.category);
                return (
                  <div
                    key={tool.id}
                    onClick={() => setActiveToolId(tool.id)}
                    className="glass p-5 rounded-2xl card-hover flex flex-col justify-between gap-5 transition-all text-left group relative overflow-hidden h-full"
                  >
                    <div className="space-y-4">
                      {/* Top Header Row of card */}
                      <div className="flex items-start justify-between">
                        <span className={`p-3 rounded-xl border ${colorScheme.bg} ${colorScheme.text}`}>
                          {getDynamicIconComponent(tool.iconName, `${colorScheme.text} shrink-0`, 20)}
                        </span>
                        
                        {/* Favorites button */}
                        <button
                          onClick={(e) => handleToggleFavorite(tool.id, e)}
                          className={`p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer outline-none shrink-0 ${
                            isFav ? "text-amber-400" : "text-white/30 hover:text-white"
                          }`}
                        >
                          <Star size={14} className={isFav ? "fill-current animate-pulse" : ""} />
                        </button>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors flex items-center gap-1.5 leading-snug">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 select-none">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3.5 w-full">
                      <span className="text-[10px] font-mono text-white/30 font-semibold tracking-wider uppercase">
                        {tool.usageCount.toLocaleString()}+ Uses
                      </span>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tool.hot && (
                          <span className="pill pill-pro">HOT</span>
                        )}
                        <span className="pill pill-free">UNLOCKED</span>
                        <span className="p-1 px-2.5 glass rounded-lg text-white/40 group-hover:text-white group-hover:border-white/20 transition-all font-semibold text-[10px] text-center border border-white/5">
                          &rarr;
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Section: Telemetry Sidebar Logs & Statistics in collapsible panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left max-w-7xl mx-auto pt-6 border-t border-white/5">
              
              {/* Telemetry diagnostics */}
              <div className="lg:col-span-5 h-[230px] rounded-2xl glass p-5 flex flex-col font-mono text-xs text-white/60 relative">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 leading-none">
                  <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">System Diagnostics</span>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-450 px-1.5 py-0.5 rounded">Port: 3000</span>
                </div>
                <div className="flex-1 space-y-2 overflow-auto scrollbar-none text-[11px] leading-relaxed">
                  <div className="flex justify-between"><span>Vite dynamic HMR server</span><span className="text-indigo-450">ONLINE</span></div>
                  <div className="flex justify-between"><span>Express backend proxy</span><span className="text-emerald-400">ACTIVE</span></div>
                  <div className="flex justify-between"><span>CPU thermal status</span><span className="text-emerald-400">32.2 °C</span></div>
                  <div className="flex justify-between"><span>Heap utilization</span><span>11.4 %</span></div>
                </div>
              </div>

              {/* Action logs history */}
              <div className="lg:col-span-7 h-[230px] rounded-2xl glass p-5 flex flex-col text-xs font-mono text-white/60">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 leading-none">
                  <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Activity timeline stream</span>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-405 px-1.5 py-0.5 rounded">{user.history.length || 0} Actions</span>
                </div>
                
                <div className="flex-1 space-y-2.5 overflow-auto custom-scrollbar pr-1">
                  {user.history.length > 0 ? (
                    user.history.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start text-[11.5px] border-b border-white/5 pb-2">
                        <span className="text-white/40 shrink-0 font-mono">
                          [{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <div className="flex-1 text-white/80">
                          <strong className="text-white font-semibold">{log.toolName}</strong>: <span>{log.details}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/30 italic">
                      No usage logs tracked in current sandboxed flow. Use some tools above.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 glass mt-16 py-6 px-8 flex items-center justify-between text-[11px] text-white/30">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-6 items-center">
            <span>&copy; 2026 ToolVerse AI</span>
            <span className="h-4 w-[1px] bg-white/10 hidden sm:inline" />
            <span className="hidden sm:inline">Premium sandbox platform workspace</span>
          </div>
          <div className="flex items-center gap-6">
            <span>System Status: <span className="text-emerald-400 font-semibold">Operational</span></span>
            <span className="h-4 w-[1px] bg-white/10 hidden sm:inline" />
            <span>Support: <strong className="text-white/50 font-mono">varadmanwelikar45@gmail.com</strong></span>
          </div>
        </div>
      </footer>


      {/* AUTHENTICATION PROFILE MODAL MODES */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm">
          <div className="glass max-w-sm w-full p-6 text-left border border-white/10 glow-purple shadow-2xl relative rounded-2xl">
            
            <button 
              onClick={() => setAuthModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer"
            >
              <X size={15} />
            </button>

            <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase font-mono block mb-2">Simulated Account Hub</span>
            <h3 className="text-md font-bold text-white mb-2 leading-none">Access sandbox profiles</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Login utilizing one of these simulation cards to try customized credits and profile synchronization maps.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleLoginSimulation("Varad Manwelikar", "varadmanwelikar45@gmail.com")}
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all outline-none cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <UserCheck size={14} /> Profile: Varad Manwelikar
              </button>
              
              <button
                onClick={() => handleLoginSimulation("Guest Beta Tester", "beta@sandwich.io")}
                className="w-full p-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-white/10 transition-all outline-none cursor-pointer"
              >
                <UserCheck size={14} /> Profile: Guest Beta Tester
              </button>

              {isLogged && (
                <button
                  onClick={handleLogout}
                  className="w-full p-2.5 bg-red-950/40 border border-red-500/15 text-red-500 font-bold rounded-xl text-xs transition-all mt-4 cursor-pointer hover:bg-red-950/60"
                >
                  Terminate session (Logout)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
