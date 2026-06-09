/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Coins, TrendingUp, Clock, RefreshCw, LayoutGrid, Globe, Globe2, ChevronRight
} from "lucide-react";
import { ToolItem } from "../types";

export default function ConvertersComponent({ tool, onAddHistory }: { tool: ToolItem; onAddHistory: (id: string, name: string, desc: string) => void }) {
  
  // --- MODULE 1: UNIT CONVERTER STATES ---
  const [unitCategory, setUnitCategory] = useState<"weight" | "length" | "temperature" | "storage">("weight");
  const [unitVal, setUnitVal] = useState(1);
  const [fromUnit, setFromUnit] = useState("kg");
  const [toUnit, setToUnit] = useState("lbs");
  const [convertedUnitVal, setConvertedUnitVal] = useState<number>(2.20462);

  const UNIT_UNITS: Record<string, string[]> = {
    weight: ["kg", "lbs", "oz", "g"],
    length: ["m", "ft", "cm", "inch", "km", "mile"],
    temperature: ["C", "F", "K"],
    storage: ["GB", "MB", "KB", "TB", "Bytes"]
  };

  const processUnitConversion = () => {
    let result = unitVal;
    
    if (unitCategory === "weight") {
      // Base: kg
      let kg = unitVal;
      if (fromUnit === "lbs") kg = unitVal * 0.453592;
      if (fromUnit === "oz") kg = unitVal * 0.0283495;
      if (fromUnit === "g") kg = unitVal * 0.001;

      result = kg;
      if (toUnit === "lbs") result = kg / 0.453592;
      if (toUnit === "oz") result = kg / 0.0283495;
      if (toUnit === "g") result = kg / 0.001;
    } 
    
    else if (unitCategory === "length") {
      // Base: m
      let m = unitVal;
      if (fromUnit === "ft") m = unitVal * 0.3048;
      if (fromUnit === "cm") m = unitVal * 0.01;
      if (fromUnit === "inch") m = unitVal * 0.0254;
      if (fromUnit === "km") m = unitVal * 1000;
      if (fromUnit === "mile") m = unitVal * 1609.34;

      result = m;
      if (toUnit === "ft") result = m / 0.3048;
      if (toUnit === "cm") result = m / 0.01;
      if (toUnit === "inch") result = m / 0.0254;
      if (toUnit === "km") result = m / 1000;
      if (toUnit === "mile") result = m / 1609.34;
    } 
    
    else if (unitCategory === "temperature") {
      // Base: C
      let c = unitVal;
      if (fromUnit === "F") c = (unitVal - 32) * 5/9;
      if (fromUnit === "K") c = unitVal - 273.15;

      result = c;
      if (toUnit === "F") result = (c * 9/5) + 32;
      if (toUnit === "K") result = c + 273.15;
    } 
    
    else if (unitCategory === "storage") {
      // Base: Bytes
      let b = unitVal;
      if (fromUnit === "KB") b = unitVal * 1024;
      if (fromUnit === "MB") b = unitVal * 1024 * 1024;
      if (fromUnit === "GB") b = unitVal * 1024 * 1024 * 1024;
      if (fromUnit === "TB") b = unitVal * 1024 * 1024 * 1024 * 1024;

      result = b;
      if (toUnit === "KB") result = b / 1024;
      if (toUnit === "MB") result = b / (1024 * 1024);
      if (toUnit === "GB") result = b / (1024 * 1024 * 1024);
      if (toUnit === "TB") result = b / (1024 * 1024 * 1024 * 1024);
    }

    setConvertedUnitVal(Number(result.toFixed(4)));
  };

  useEffect(() => {
    // Sync default from/to units when category changes
    const list = UNIT_UNITS[unitCategory];
    setFromUnit(list[0]);
    setToUnit(list[1]);
  }, [unitCategory]);

  useEffect(() => {
    processUnitConversion();
  }, [unitVal, fromUnit, toUnit, unitCategory]);


  // --- MODULE 2: CURRENCY CONVERTER STATES ---
  const [currVal, setCurrVal] = useState(100);
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("EUR");
  const [currOutput, setCurrOutput] = useState<number>(92);

  const CURRENCY_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    INR: 83.45,
    JPY: 156.20,
    AUD: 1.51
  };

  const processCurrencyExchange = () => {
    const usd = currVal / CURRENCY_RATES[fromCurr];
    const out = usd * CURRENCY_RATES[toCurr];
    setCurrOutput(Number(out.toFixed(2)));
  };

  useEffect(() => {
    processCurrencyExchange();
  }, [currVal, fromCurr, toCurr]);


  // --- MODULE 3: TIME ZONE CONVERTER ---
  const [timeZoneInput, setTimeZoneInput] = useState<string>("09:00");
  const [targetClocks, setTargetClocks] = useState<any[]>([]);

  // Calculate World Clocks dynamically based on matching time
  const calculateWorldClocks = () => {
    const [h, m] = timeZoneInput.split(":").map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);

    const zones = [
      { city: "San Francisco", zone: "America/Los_Angeles", label: "PST Timezone" },
      { city: "New York City", zone: "America/New_York", label: "EST Timezone" },
      { city: "London City", zone: "Europe/London", label: "GMT Timezone" },
      { city: "Tokyo Capital", zone: "Asia/Tokyo", label: "JST Timezone" },
      { city: "Mumbai Metro", zone: "Asia/Kolkata", label: "IST Timezone" }
    ];

    const results = zones.map(z => {
      // Options format timezone matching
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: z.zone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      const formatted = formatter.format(date);
      return {
        ...z,
        time: formatted
      };
    });

    setTargetClocks(results);
  };

  useEffect(() => {
    calculateWorldClocks();
  }, [timeZoneInput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto rounded-3xl" id={`tool-panel-${tool.id}`}>
      
      {/* LEFT INPUT CONTROLS */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl glow-indigo text-left relative">
          
          <div className="flex items-center gap-3 mb-4 leading-none">
            <span className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              {tool.id === "conv-unit" ? <LayoutGrid size={22} /> :
               tool.id === "conv-currency" ? <Coins size={22} /> :
               <Globe size={22} />}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{tool.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Instant Converter Engine</p>
            </div>
          </div>

          {/* DYNAMIC FORMS BASED ON CONVERTER ID */}

          {/* 1. UNIT */}
          {tool.id === "conv-unit" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Select Category Matrix</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "weight", val: "⚖ Weight" },
                    { id: "length", val: "📏 Length" },
                    { id: "temperature", val: "🌡 Temp" },
                    { id: "storage", val: "💾 Storage" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setUnitCategory(cat.id as any)}
                      className={`text-xs p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        unitCategory === cat.id ? "bg-indigo-600 border-indigo-400 text-white font-bold" : "bg-slate-900 border-white/10 text-slate-400"
                      }`}
                    >
                      {cat.val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Source Value</label>
                <input 
                  type="number"
                  value={unitVal}
                  onChange={(e) => setUnitVal(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Convert From</label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white font-mono"
                  >
                    {UNIT_UNITS[unitCategory]?.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Convert To</label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white font-mono"
                  >
                    {UNIT_UNITS[unitCategory]?.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. CURRENCY */}
          {tool.id === "conv-currency" && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Simulated Forex Rates Cached</label>
                <div className="text-[10px] text-slate-400 mt-1 leading-normal pb-3 border-b border-white/5">
                  USD: 1.0 | EUR: 0.92 | GBP: 0.78 | INR: 83.45 | JPY: 156.20
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Enter Volume Value</label>
                <input 
                  type="number"
                  value={currVal}
                  onChange={(e) => setCurrVal(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Exchange From</label>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white font-mono"
                  >
                    {Object.keys(CURRENCY_RATES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Exchange To</label>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white font-mono"
                  >
                    {Object.keys(CURRENCY_RATES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. TIMEZONE */}
          {tool.id === "conv-timezone" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Select Input Time (24h clock)</label>
                <input 
                  type="time"
                  value={timeZoneInput}
                  onChange={(e) => setTimeZoneInput(e.target.value)}
                  className="w-full text-md font-mono bg-slate-950 border border-white/10 p-3 rounded-lg text-white outline-none text-center"
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT DISPLAY PANEL */}
      <div className="lg:col-span-7 flex flex-col min-h-[440px]">
        <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden glow-purple bg-slate-950/80">
          
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60 leading-none">
            <span className="text-xs text-slate-400 font-mono">active-converter-matrix.json</span>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2.5 py-1 rounded-full font-sans">MATH_PRECISION: FOUR_DECIMALS</span>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-left">
            
            {/* 1. UNIT DISPLAY */}
            {tool.id === "conv-unit" && (
              <div className="w-full max-w-sm space-y-5 text-center leading-none">
                <span className="text-5xl font-black text-white font-mono block">
                  {convertedUnitVal}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono block">
                  {toUnit} (Converted layout)
                </span>

                <div className="border-t border-white/5 pt-4 flex justify-between text-xs text-slate-400 font-mono">
                  <span>Source cost base</span>
                  <span>{unitVal} {fromUnit}</span>
                </div>
              </div>
            )}

            {/* 2. CURRENCY DISPLAY */}
            {tool.id === "conv-currency" && (
              <div className="w-full max-w-sm space-y-6">
                
                <div className="text-center leading-none">
                  <span className="text-5xl font-black text-emerald-400 font-mono block">
                    {currOutput.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mt-3 font-mono">
                    {toCurr} Forex conversion
                  </span>
                </div>

                {/* SVG simulated currency flow line */}
                <svg width="100%" height="80" viewBox="0 0 300 80">
                  <path d="M 0 60 Q 50 20 100 45 T 200 15 T 300 5" fill="transparent" stroke="#10b981" strokeWidth="2.5" />
                  <path d="M 0 60 Q 50 20 100 45 T 200 15 T 300 5 L 300 80 L 0 80 Z" fill="url(#forexGrad)" opacity="0.1" />
                  <defs>
                    <linearGradient id="forexGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="flex justify-between text-xs text-slate-400 font-mono border-t border-white/5 pt-2">
                  <span>Base untranslated cost</span>
                  <span>{currVal} {fromCurr}</span>
                </div>
              </div>
            )}

            {/* 3. TIMEZONE WORLD CLOCKS */}
            {tool.id === "conv-timezone" && (
              <div className="w-full space-y-3 font-sans">
                <span className="text-xs font-bold text-slate-450 block uppercase tracking-wider font-mono mb-2">Matched Global timezones</span>
                
                <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar">
                  {targetClocks.map((c, i) => (
                    <div 
                      key={i}
                      className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white tracking-wide block leading-none">{c.city}</span>
                        <span className="text-[10px] text-slate-500 font-mono leading-none">{c.label}</span>
                      </div>
                      <span className="text-lg font-bold font-mono text-indigo-400 shrink-0">{c.time}</span>
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
