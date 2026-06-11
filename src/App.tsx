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
    const defaultState: UserState = {
      credits: 999999,
      isPro: true,
      favorites: ["ai-text", "prod-pomo", "dev-qr"],
      history: [],
      achievements: []
    };

    try {
      const saved = localStorage.getItem("toolverse_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            ...defaultState,
            ...parsed,
            isPro: true,
            credits: 999999
          };
        }
      }
    } catch {
      // Silently reset and cleanse the corrupted localStorage item to prevent future issues
      try {
        localStorage.removeItem("toolverse_user_profile");
      } catch (err) {
        // Fallback for isolated contexts or non-cookie environments
      }
    }
    return defaultState;
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

  // Synchronize history/back-button navigation with activeToolId state
  useEffect(() => {
    const handleHashAndStateSync = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/tool\/(.+)$/);
      if (match) {
        const urlToolId = match[1];
        if (TOOL_CATALOG.some(t => t.id === urlToolId)) {
          setActiveToolId(urlToolId);
        } else {
          setActiveToolId(null);
        }
      } else {
        setActiveToolId(null);
      }
    };

    handleHashAndStateSync();

    window.addEventListener("hashchange", handleHashAndStateSync);
    window.addEventListener("popstate", handleHashAndStateSync);

    return () => {
      window.removeEventListener("hashchange", handleHashAndStateSync);
      window.removeEventListener("popstate", handleHashAndStateSync);
    };
  }, []);

  const handleSelectTool = (toolId: string | null) => {
    if (toolId) {
      window.location.hash = `#/tool/${toolId}`;
    } else {
      if (window.history.pushState) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }
    setActiveToolId(toolId);
  };

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

  // Category Color Scheme Helper (Rebuilt with ultra-polished premium light pastel shades)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai": return { bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600" };
      case "image": return { bg: "bg-sky-50 border-sky-100", text: "text-sky-600" };
      case "productivity": return { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" };
      case "calculator": return { bg: "bg-amber-50 border-amber-100", text: "text-amber-700" };
      case "converter": return { bg: "bg-purple-50 border-purple-100", text: "text-purple-600" };
      case "developer": return { bg: "bg-zinc-100 border-zinc-200", text: "text-zinc-800" };
      default: return { bg: "bg-zinc-50 border-zinc-150", text: "text-zinc-700" };
    }
  };

  // Icon Matcher Helper
  const getDynamicIconComponent = (name: string, className = "text-indigo-600 shrink-0", size = 18) => {
    const IconC = (Icons as any)[name] || Icons.HelpCircle;
    return <IconC className={className} size={size} />;
  };

  return (
    <div className="min-h-screen premium-gradient text-zinc-800 font-sans flex flex-col items-center relative overflow-x-hidden">
      
      {/* 1. SOFT GRADIENT BACKGROUND DECORATIONS */}
      <div className="fixed top-[-10%] left-[-15%] h-[400px] w-[400px] bg-indigo-600/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-15%] h-[400px] w-[400px] bg-sky-600/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />

      {/* 2. PREMIUM NAVIGATION BAR */}
      <nav className="w-full sticky top-0 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Title */}
          <div 
            onClick={() => handleSelectTool(null)}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-102 transition-all shadow-md shadow-zinc-900/10">
              V
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 select-none">
              ToolVerse <span className="text-indigo-600 font-extrabold uppercase text-sm">Workspace</span>
            </span>
          </div>

          {/* User Status and Menu Indicators */}
          <div className="flex items-center gap-3">
            
            <div className="hidden sm:flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3.5 py-1.5 rounded-full text-xs text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="font-medium">All Models Unlocked</span>
            </div>

            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full font-sans">
              <Crown size={11} className="text-amber-600 fill-current" /> Pro Member
            </span>

            {/* Profile Avatar Button */}
            <button 
              onClick={() => setAuthModal(true)}
              className="flex items-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 px-3.5 py-1.5 rounded-full transition-all cursor-pointer outline-none text-left shadow-sm"
            >
              <span className="h-5 w-5 bg-zinc-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {currentProfileName.charAt(0).toUpperCase()}
              </span>
              <span className="text-[11px] font-semibold text-zinc-700 max-w-[95px] truncate hidden sm:inline">
                {currentProfileName}
              </span>
            </button>

          </div>

        </div>
      </nav>

      {/* 3. CORE APPMARK WORKSPACE CONTAINER */}
      <main className="w-full flex-1 max-w-7xl px-6 py-10 z-10 flex flex-col gap-10">

        {activeTool ? (
          
          // --- WORKSPACE IN ACTIVE VIEW STATE ---
          <div className="space-y-6 text-left">
            
            {/* Breadcrumb Workspace Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-zinc-200/60">
              <button
                onClick={() => handleSelectTool(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer leading-none"
              >
                <ArrowLeft size={13} /> Back to Toolkit Catalog
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-sans">Category / {activeTool.category} /</span>
                <span className="text-xs font-bold text-zinc-800">{activeTool.name}</span>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] border border-emerald-200 font-bold px-1.5 py-0.5 rounded uppercase">Fully Equipped</span>
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
          
          // --- DIRECTORY HOME & TOOL SELECTION ---
          <div className="space-y-10">

            {/* Welcome Hero Landing */}
            <div className="text-center space-y-5 max-w-3xl mx-auto py-4">
              
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 px-3.5 py-1.5 border border-indigo-100 rounded-full text-[11px] text-indigo-700 font-bold uppercase tracking-wider">
                <Sparkles size={11} className="text-indigo-600" /> Professional Multi-Engine Workspace
              </div>

              <div className="space-y-3 text-center leading-tight max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  One Unified Workspace.<br />
                  <span className="accent-text font-extrabold select-none">Powerful Tools & AI Utilities.</span>
                </h1>
                <p className="text-xs md:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
                  Access professional AI calculators, image processors, and smart text processors in one modern tabbed interface.
                </p>
              </div>

              {/* Dynamic responsive Search widget */}
              <div className="relative max-w-lg mx-auto pt-2">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search tools (e.g. Image Upscaler, JSON Formatter, Unit Converter...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white py-3 pl-11 pr-4 rounded-xl border border-zinc-250 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-zinc-300 transition-all font-sans shadow-sm"
                />
              </div>

            </div>

            {/* Responsive Categories filter bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto py-1">
              {[
                { id: "all", label: "All Utilities", sym: <LayoutGrid size={11} /> },
                { id: "favorites", label: "Favorites Star", sym: <Heart size={11} /> },
                { id: "ai", label: "AI Engines", sym: <Sparkles size={11} /> },
                { id: "image", label: "Image Studio", sym: <Laptop size={11} /> },
                { id: "productivity", label: "Productivity", sym: <CheckSquare size={11} /> },
                { id: "calculator", label: "Calculators", sym: <Coins size={11} /> },
                { id: "converter", label: "Converters", sym: <Timer size={11} /> },
                { id: "developer", label: "Developer Tools", sym: <Code size={11} /> }
              ].map(cat => {
                let text = cat.label;
                if (cat.id === "favorites") {
                  text = `Favorites (${user.favorites.length})`;
                }
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full border transition-all cursor-pointer font-semibold select-none ${
                      isActive 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-sm" 
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {cat.sym} {text}
                  </button>
                );
              })}
            </div>

            {/* Main grid of cards catalog */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
              {filteredTools.map(tool => {
                const isFav = user.favorites.includes(tool.id);
                const colorScheme = getCategoryColor(tool.category);
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.id)}
                    className="bg-white border border-zinc-200/85 p-5 rounded-xl card-hover flex flex-col justify-between gap-5 transition-all text-left group relative overflow-hidden h-full shadow-sm"
                  >
                    <div className="space-y-4">
                      {/* Top Header Row of card */}
                      <div className="flex items-start justify-between">
                        <span className={`p-2.5 rounded-lg border ${colorScheme.bg} ${colorScheme.text}`}>
                          {getDynamicIconComponent(tool.iconName, `${colorScheme.text} shrink-0`, 18)}
                        </span>
                        
                        {/* Favorites button */}
                        <button
                          onClick={(e) => handleToggleFavorite(tool.id, e)}
                          className={`p-1.5 rounded-md hover:bg-zinc-50 transition-all cursor-pointer outline-none shrink-0 ${
                            isFav ? "text-amber-500" : "text-zinc-300 hover:text-zinc-550"
                          }`}
                        >
                          <Star size={14} className={isFav ? "fill-current" : ""} />
                        </button>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-1.5">
                        <h4 className="text-[14.5px] font-bold text-zinc-900 tracking-tight group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 leading-snug">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 select-none">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3.5 w-full">
                      <span className="text-[10px] font-semibold text-zinc-400 tracking-wider font-sans uppercase">
                        {tool.usageCount.toLocaleString()}+ Uses
                      </span>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tool.hot && (
                          <span className="pill pill-pro">HOT</span>
                        )}
                        <span className="pill pill-free">UTILITY</span>
                        <span className="p-1 px-2.5 bg-zinc-50 border border-zinc-250 rounded-md text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100 group-hover:border-zinc-300 transition-all font-semibold text-[10px] text-center">
                          &rarr;
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Section: Workspace Activity Log and Help Info */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 text-left max-w-7xl mx-auto pt-6 border-t border-zinc-250">
              
              {/* Pure human Workspace Action Logs */}
              <div className="w-full rounded-xl bg-white border border-zinc-200 p-5 flex flex-col text-xs text-zinc-600 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-3 leading-none">
                  <span className="text-[10px] font-bold uppercase text-zinc-800 tracking-wider">Workspace Event & History Log</span>
                  <span className="text-[10px] bg-zinc-50 text-zinc-600 border border-zinc-200 px-2.5 py-0.5 rounded-full">{user.history.length || 0} Events Registered</span>
                </div>
                
                <div className="space-y-2 max-h-[160px] overflow-auto custom-scrollbar pr-1">
                  {user.history.length > 0 ? (
                    user.history.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start text-[11.5px] border-b border-zinc-50 pb-2">
                        <span className="text-zinc-400 shrink-0 font-mono">
                          [{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <div className="flex-1 text-zinc-700">
                          <strong className="text-zinc-900 font-semibold">{log.toolName}</strong> &mdash; <span>{log.details}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-6 text-zinc-400 italic">
                      No events registered in this work session. Perform an action to populate this history index.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-200 bg-white py-6 px-8 flex items-center justify-between text-[11px] text-zinc-500 shadow-inner">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-6 items-center">
            <span>&copy; 2026 ToolVerse Workspace</span>
            <span className="h-4 w-[1px] bg-zinc-200 hidden sm:inline" />
            <span className="hidden sm:inline">Certified Sandboxed Application Environment</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              All Engines Connected
            </span>
            <span className="h-4 w-[1px] bg-zinc-200 hidden sm:inline" />
            <span>Developer Support: <strong className="text-zinc-700 font-mono">varadmanwelikar45@gmail.com</strong></span>
          </div>
        </div>
      </footer>


      {/* AUTHENTICATION PROFILE MODAL MODES */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full p-6 text-left border border-zinc-200 shadow-xl relative rounded-xl">
            
            <button 
              onClick={() => setAuthModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all outline-none cursor-pointer"
            >
              <X size={14} />
            </button>

            <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase font-sans block mb-1">Account Dashboard</span>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5 leading-none">Simulation Profiles</h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
              Dynamically switch test personas to preview isolated history lists and configured pro access states.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleLoginSimulation("Varad Manwelikar", "varadmanwelikar45@gmail.com")}
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all outline-none cursor-pointer shadow-sm"
              >
                <UserCheck size={14} /> Persona: Varad Manwelikar
              </button>
              
              <button
                onClick={() => handleLoginSimulation("Guest Beta Tester", "beta@sandwich.io")}
                className="w-full p-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-lg text-xs flex items-center gap-2 border border-zinc-250 transition-all outline-none cursor-pointer"
              >
                <UserCheck size={14} /> Persona: Guest Tester
              </button>

              {isLogged && (
                <button
                  onClick={handleLogout}
                  className="w-full p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-lg text-xs transition-all mt-3 cursor-pointer"
                >
                  Sign Out from Workspace Session
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
