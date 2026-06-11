/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FolderOpen, Timer, CheckSquare, CalendarDays, Plus, Pin, Trash2, 
  Search, Check, Clock, Play, Pause, RotateCcw, Volume2, VolumeX,
  PlusCircle, Award, Sparkles, ChevronRight, Bookmark
} from "lucide-react";
import { ToolItem, Note, TodoItem, Habit } from "../types";

export default function ProductivityToolsComponent({ tool, onAddHistory }: { tool: ToolItem; onAddHistory: (id: string, name: string, desc: string) => void }) {
  
  // --- MODULE 1: NOTES APP STATES ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("toolverse_prod_notes");
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Syntax Error parsing notes", e);
    }
    return [
      { id: "note-1", title: "🚀 Product Launch checklist", content: "### ToolVerse Milestones\n* Design comprehensive React + Express proxies.\n* Create elegant Glassmorphism visual structures.\n* Fully integrate *Gemini models* for SVG vector engines.", tags: ["ideas", "work"], pinned: true, updatedAt: new Date().toISOString() },
      { id: "note-2", title: "💡 Startups ideas", content: "Create an offline-first premium local cache suite for developers to format JSON data structures.", tags: ["ideas"], pinned: false, updatedAt: new Date().toISOString() }
    ];
  });
  const [activeNoteId, setActiveNoteId] = useState<string>("note-1");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTagInput, setNoteTagInput] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Sync Notes to LocalStorage
  useEffect(() => {
    localStorage.setItem("toolverse_prod_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.title);
      setNoteContent(activeNote.content);
    }
  }, [activeNoteId]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Scratch Note",
      content: "Write something inspiring here...",
      tags: ["general"],
      pinned: false,
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    onAddHistory(tool.id, tool.name, "Created new local markdown Note");
  };

  const handleUpdateActiveNote = (updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, ...updates, updatedAt: new Date().toISOString() };
      }
      return n;
    }));
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id && filtered.length > 0) {
      setActiveNoteId(filtered[0].id);
    }
    onAddHistory(tool.id, tool.name, "Deleted markdown Note");
  };

  // --- MODULE 2: POMODORO TIMER STATES ---
  const [pomoMode, setPomoMode] = useState<"work" | "short" | "long">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [pomoCount, setPomoCount] = useState(0);
  const [focusAudio, setFocusAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodeRef = useRef<OscillatorNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const modeTimeMapping = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  const selectPomoMode = (mode: "work" | "short" | "long") => {
    setPomoMode(mode);
    setTimerActive(false);
    setTimeLeft(modeTimeMapping[mode]);
  };

  // Sound Synth Generator (No external file needed, procedural waves)
  const toggleFocusSound = () => {
    if (focusAudio) {
      // Turn Off
      if (synthNodeRef.current) {
        try { synthNodeRef.current.stop(); } catch{}
        synthNodeRef.current = null;
      }
      setFocusAudio(false);
    } else {
      // Turn On Focus Sound
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Low soothing sound (A2 note)
        
        // Softer gain to keep it gentle background
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        
        synthNodeRef.current = osc;
        setFocusAudio(true);
      } catch (e) {
        console.warn("AudioContext failed to boot", e);
      }
    }
  };

  // Main Ticker Loop
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            clearInterval(timerIntervalRef.current!);
            
            // Cycle Finished
            if (pomoMode === "work") {
              setPomoCount(p => p + 1);
              onAddHistory(tool.id, tool.name, "Completed a 25-minute Pomodoro Cycle");
              
              // Trigger procedurally styled beep
              beep();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, pomoMode]);

  const beep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // soothe D5 note beep
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      setTimeout(() => { osc.stop(); }, 500);
    } catch {}
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- MODULE 3: TO-DO LIST STATES ---
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem("toolverse_prod_todos");
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Syntax Error parsing todos", e);
    }
    return [
      { id: "todo-1", text: "Integrate Gemini model text generators", category: "work", priority: "high", completed: true },
      { id: "todo-2", text: "Audit local storage caches", category: "work", priority: "medium", completed: false },
      { id: "todo-3", text: "Create responsive retro visual UI layouts", category: "personal", priority: "low", completed: false }
    ];
  });
  const [todoInput, setTodoInput] = useState("");
  const [todoPriority, setTodoPriority] = useState<"low" | "medium" | "high">("medium");
  const [todoCategory, setTodoCategory] = useState<"work" | "personal" | "urgent">("work");

  useEffect(() => {
    localStorage.setItem("toolverse_prod_todos", JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim()) return;
    const item: TodoItem = {
      id: `todo-${Date.now()}`,
      text: todoInput.trim(),
      category: todoCategory as any,
      priority: todoPriority,
      completed: false
    };
    setTodos(prev => [...prev, item]);
    setTodoInput("");
    onAddHistory(tool.id, tool.name, `Added item: "${item.text.slice(0, 20)}..." to To-Do`);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // --- MODULE 4: HABIT TRACKER STATES ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("toolverse_prod_habits");
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Syntax Error parsing habits", e);
    }
    return [
      { id: "h-1", name: "Write clean TS code", streak: 5, history: ["2026-06-08", "2026-06-07", "2026-06-06", "2026-06-05", "2026-06-04"], frequency: "daily" },
      { id: "h-2", name: "Meditate 10 mins", streak: 2, history: ["2026-06-08", "2026-06-07"], frequency: "daily" }
    ];
  });
  const [newHabitName, setNewHabitName] = useState("");

  useEffect(() => {
    localStorage.setItem("toolverse_prod_habits", JSON.stringify(habits));
  }, [habits]);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const item: Habit = {
      id: `h-${Date.now()}`,
      name: newHabitName.trim(),
      streak: 0,
      history: [],
      frequency: "daily"
    };
    setHabits(prev => [...prev, item]);
    setNewHabitName("");
    onAddHistory(tool.id, tool.name, `Started habit line: "${item.name}"`);
  };

  const toggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const hasDate = h.history.includes(dateStr);
        let updatedHistory = [];
        if (hasDate) {
          updatedHistory = h.history.filter(d => d !== dateStr);
        } else {
          updatedHistory = [dateStr, ...h.history];
        }

        // Streak calculator algorithm (simplified for past 5 consecutive days)
        let streak = 0;
        let checkDate = new Date();
        for (let i = 0; i < 30; i++) {
          const checkStr = checkDate.toISOString().split("T")[0];
          if (updatedHistory.includes(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return { ...h, history: updatedHistory, streak };
      }
      return h;
    }));
  };

  // Quick helper dates list for habits row
  const getPast5Dates = () => {
    const dates = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        str: d.toISOString().split("T")[0],
        day: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        date: d.getDate()
      });
    }
    return dates;
  };

  const habitDatesList = getPast5Dates();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto rounded-3xl" id={`tool-panel-${tool.id}`}>
      
      {/* LEFT: Sidebars / Folders / Nav Lists */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Active Panel Profile Card */}
        <div className="glass-panel p-5 rounded-2xl text-left bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-white/5 relative overflow-hidden leading-none">
          <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-purple-500/15 text-purple-400 rounded-xl">
              {tool.id === "prod-notes" ? <FolderOpen size={20} /> :
               tool.id === "prod-pomo" ? <Timer size={20} /> :
               tool.id === "prod-todo" ? <CheckSquare size={20} /> :
               <CalendarDays size={20} />}
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">{tool.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1">Interactive Sandbox Workspace</p>
            </div>
          </div>
        </div>

        {/* --- 1. LEFT NOTES LIST DIRECTORY APP --- */}
        {tool.id === "prod-notes" && (
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 text-left border border-white/5">
            <div className="flex items-center justify-between leading-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Folders & Scratchlist</span>
              <button 
                onClick={handleCreateNote}
                className="p-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/10 rounded hover:bg-indigo-600/35 transition-all outline-none cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Quick Search bar */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search scratch notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full bg-slate-950 text-xs border border-white/5 py-2 pl-8 pr-3 rounded-lg text-slate-300 outline-none focus:border-indigo-500 transition-all font-sans"
              />
              <Search size={12} className="absolute left-2.5 top-3 text-slate-500" />
            </div>

            {/* List Notes items */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {notes
                .filter(n => n.title.toLowerCase().includes(noteSearch.toLowerCase()) || n.content.toLowerCase().includes(noteSearch.toLowerCase()))
                .map(note => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all relative flex flex-col gap-1 cursor-pointer ${
                      activeNoteId === note.id 
                        ? "bg-indigo-950/40 border-indigo-500/30 text-white" 
                        : "bg-slate-950/30 border-white/5 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 leading-normal pr-5">
                      <span className="text-xs font-semibold truncate text-white">{note.title || "Untitled Scratch Note"}</span>
                      {note.pinned && <Pin size={10} className="text-orange-400 fill-current shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1 truncate font-mono">
                      {note.content.replace(/[#*`]/g, "").slice(0, 35) || "Empty note contents..."}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono mt-1">
                      Updated: {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Delete note overlay button */}
                    <span 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                      className="absolute bottom-2.5 right-2.5 p-1 bg-white/5 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 cursor-pointer opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={10} />
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* --- 2. LEFT POMODORO OPTIONS --- */}
        {tool.id === "prod-pomo" && (
          <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">Pomodoro cycles info</span>
            <div className="space-y-3 leading-normal">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                <span className="text-indigo-400 font-bold block mb-1">How work sprints benefit you:</span>
                Work intensely for 25 minutes, then enjoy a refreshing 5-minute pause. Repeat 4 times to unlock a longer 15-minute relaxation milestone.
              </div>

              {/* Stats milestones */}
              <div className="flex justify-between items-center bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-yellow-400" />
                  <span className="text-xs text-slate-300 font-sans">Cycles Completed</span>
                </div>
                <span className="text-xs text-white font-bold font-mono bg-indigo-600/30 px-2 py-0.5 rounded border border-indigo-500/20">{pomoCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. LEFT TO-DO STATS --- */}
        {tool.id === "prod-todo" && (
          <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">Work breakdown metrics</span>
            <div className="grid grid-cols-2 gap-3 text-center leading-none">
              <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block font-sans">Active Tasks</span>
                <span className="text-lg font-bold text-white font-mono block mt-2">
                  {todos.filter(t => !t.completed).length}
                </span>
              </div>
              <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block font-sans">Done</span>
                <span className="text-lg font-bold text-emerald-400 font-mono block mt-2">
                  {todos.filter(t => t.completed).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. LEFT HABITS PROFILE STREAKS --- */}
        {tool.id === "prod-habit" && (
          <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">Streaks scorecard</span>
            <div className="space-y-3">
              {habits.map(h => (
                <div key={h.id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-300 truncate font-semibold">{h.name}</span>
                  <div className="flex items-center gap-1 shrink-0 text-orange-400 font-mono text-xs font-bold bg-orange-950/20 px-2 py-0.5 rounded border border-orange-500/10">
                    <Sparkles size={11} className="fill-current" /> {h.streak} Day streak
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Main App Work area */}
      <div className="lg:col-span-8 flex flex-col min-h-[480px]">
        <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden glow-purple bg-slate-950/80 text-left border border-white/10">
          
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60 leading-none">
            <span className="text-xs text-slate-400 font-mono">productivity-active-applet.py</span>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2 py-1 rounded font-mono">AUTOSAVE: LOCAL_CACHE</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto max-h-[580px] custom-scrollbar">
            
            {/* --- 1. RIGHT: NOTES WRITER APPS --- */}
            {tool.id === "prod-notes" && activeNote && (
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => { setNoteTitle(e.target.value); handleUpdateActiveNote({ title: e.target.value }); }}
                    placeholder="Enter scratch title..."
                    className="flex-1 text-md font-bold text-white bg-transparent outline-none focus:border-b focus:border-white/20 pb-1"
                  />
                  <button
                    onClick={() => handleUpdateActiveNote({ pinned: !activeNote.pinned })}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      activeNote.pinned ? "text-orange-400 bg-orange-500/10" : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <Pin size={14} className={activeNote.pinned ? "fill-current" : ""} />
                  </button>
                </div>

                <div className="flex gap-2 border-b border-white/5 pb-2">
                  {activeNote.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input 
                      type="text"
                      placeholder="Add tag..."
                      value={noteTagInput}
                      onChange={(e) => setNoteTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && noteTagInput.trim()) {
                          const updated = [...activeNote.tags, noteTagInput.trim()];
                          handleUpdateActiveNote({ tags: updated });
                          setNoteTagInput("");
                        }
                      }}
                      className="bg-transparent text-[10px] text-slate-400 border-none outline-none text-right max-w-[80px]"
                    />
                  </div>
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => { setNoteContent(e.target.value); handleUpdateActiveNote({ content: e.target.value }); }}
                  placeholder="Markdown editor. Direct support for markdown tags: # headers, * bullets etc."
                  className="w-full flex-1 min-h-[300px] bg-transparent text-xs text-slate-200 outline-none resize-none leading-relaxed custom-scrollbar font-mono"
                />
              </div>
            )}

            {/* --- 2. RIGHT: POMODORO TIMER WORKSPACE --- */}
            {tool.id === "prod-pomo" && (
              <div className="flex flex-col items-center justify-center text-center space-y-8 py-4">
                
                {/* Mode Selectors */}
                <div className="flex gap-1.5 bg-white/5 p-1 border border-white/10 rounded-xl">
                  {[
                    { id: "work", val: "Work (25m)" },
                    { id: "short", val: "Short break (5m)" },
                    { id: "long", val: "Long break (15m)" }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => selectPomoMode(mode.id as any)}
                      className={`text-xs px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                        pomoMode === mode.id
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode.val}
                    </button>
                  ))}
                </div>

                {/* Ticking Circle Dashboard */}
                <div className="h-60 w-60 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center p-6 bg-slate-900/60 relative glow-indigo">
                  {/* Glowing progress aura */}
                  <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin opacity-40" />
                  
                  <span className="text-5xl font-extrabold text-white tracking-widest font-mono">
                    {formatTimer(timeLeft)}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-3 font-mono">
                    {pomoMode === "work" ? "Active Focus session" : "Mellow relaxation"}
                  </span>
                </div>

                {/* Controls dashboard */}
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => selectPomoMode(pomoMode)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white border border-white/10 rounded-xl transition-all outline-none cursor-pointer"
                  >
                    <RotateCcw size={16} />
                  </button>
                  
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {timerActive ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
                    {timerActive ? "Pause sequence" : "Launch cycle"}
                  </button>

                  <button
                    onClick={toggleFocusSound}
                    className={`p-3 border rounded-xl transition-all cursor-pointer ${
                      focusAudio ? "bg-amber-600/20 text-amber-400 border-amber-500/20" : "bg-white/5 hover:bg-white/10 text-slate-400 border-white/10"
                    }`}
                  >
                    {focusAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* --- 3. RIGHT: TO-DO PLANNERS WORKSPACE --- */}
            {tool.id === "prod-todo" && (
              <div className="space-y-6 flex flex-col h-full">
                
                {/* Form to submit a new todo */}
                <form onSubmit={handleAddTodo} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <div className="md:col-span-6">
                    <input 
                      type="text"
                      placeholder="Add an actionable to-do..."
                      value={todoInput}
                      onChange={(e) => setTodoInput(e.target.value)}
                      className="w-full bg-slate-950 border border-white/15 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={todoPriority}
                      onChange={(e) => setTodoPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-slate-300"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <select
                      value={todoCategory}
                      onChange={(e) => setTodoCategory(e.target.value as any)}
                      className="flex-1 bg-slate-950 border border-white/15 rounded-lg p-2 text-xs text-slate-300"
                    >
                      <option value="work">Work Folder</option>
                      <option value="personal">Personal Log</option>
                      <option value="urgent">Urgent List</option>
                    </select>
                    <button
                      type="submit"
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </form>

                {/* To-Do Items List */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                  {todos.map(todo => (
                    <div 
                      key={todo.id}
                      className="flex items-center gap-3 bg-slate-950/20 p-3.5 rounded-xl border border-white/5 group"
                    >
                      <span 
                        onClick={() => toggleTodo(todo.id)}
                        className={`p-1 border rounded cursor-pointer shrink-0 transition-all ${
                          todo.completed 
                            ? "bg-indigo-600 border-indigo-400 text-white" 
                            : "border-white/20 text-transparent hover:border-indigo-500"
                        }`}
                      >
                        <Check size={10} />
                      </span>
                      
                      <span className={`text-xs flex-1 truncate text-left ${
                        todo.completed ? "line-through text-slate-500" : "text-slate-200"
                      }`}>
                        {todo.text}
                      </span>

                      {/* Display Badges */}
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded capitalize ${
                        todo.priority === "high" ? "bg-red-950 text-red-400 border border-red-500/10" :
                        todo.priority === "medium" ? "bg-amber-950 text-amber-400 border border-amber-500/10" :
                        "bg-slate-900 text-slate-400"
                      }`}>
                        {todo.priority}
                      </span>

                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-600 hover:text-red-400 cursor-pointer hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- 4. RIGHT: HABITS TRACKING CALENDARS --- */}
            {tool.id === "prod-habit" && (
              <div className="space-y-6 flex flex-col h-full text-left">
                
                {/* Habit Creation Row */}
                <form onSubmit={handleCreateHabit} className="flex gap-2 p-3 bg-slate-900/60 border border-white/5 rounded-xl">
                  <input
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="Describe a habit (e.g., Run 15 Mins, Code TypeScript)..."
                    className="flex-1 bg-slate-950 text-xs border border-white/10 rounded-lg px-3 py-2 text-slate-200 outline-none"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-semibold px-4 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Start Habit
                  </button>
                </form>

                <div className="space-y-3">
                  {habits.map(habit => (
                    <div key={habit.id} className="bg-slate-950/20 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white tracking-wide">{habit.name}</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> Checked in {habit.history.length} times total
                        </span>
                      </div>

                      {/* Spark past 5 dates blocks */}
                      <div className="flex gap-2 items-center">
                        {habitDatesList.map(dateObj => {
                          const isActive = habit.history.includes(dateObj.str);
                          return (
                            <div 
                              key={dateObj.str}
                              onClick={() => toggleHabitDate(habit.id, dateObj.str)}
                              className={`h-11 w-11 rounded-lg border flex flex-col items-center justify-center cursor-pointer select-none transition-all ${
                                isActive 
                                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 text-white" 
                                  : "bg-slate-950/80 border-white/10 text-slate-500 hover:bg-slate-900"
                              }`}
                            >
                              <span className="text-[9px] uppercase font-bold tracking-wider">{dateObj.day}</span>
                              <span className="text-xs font-mono font-bold mt-0.5">{dateObj.date}</span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
