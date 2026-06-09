/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Calculator, Calendar, Activity, Percent, Layers3, Binary,
  TrendingDown, TrendingUp, RefreshCw, Sparkles, Clock, ChevronRight
} from "lucide-react";
import { ToolItem } from "../types";

export default function CalculatorsComponent({ tool, onAddHistory }: { tool: ToolItem; onAddHistory: (id: string, name: string, desc: string) => void }) {
  
  // --- MODULE 1: AGE TRACKER CALCULATIONS ---
  const [birthdate, setBirthdate] = useState("1998-05-18");
  const [ageResults, setAgeResults] = useState<any>(null);

  const calculateAge = () => {
    if (!birthdate) return;
    const dob = new Date(birthdate);
    const now = new Date();
    
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      // Days in birth month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Birthday countdown
    let nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (now > nextBday) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const diffMs = nextBday.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Stats
    const totalDays = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    const heartbeats = totalDays * 24 * 60 * 80; // average 80bpm
    const breaths = totalDays * 24 * 60 * 16; // average 16 breaths per min

    setAgeResults({
      years, months, days, daysLeft, heartbeats, breaths, totalDays
    });
  };

  useEffect(() => {
    calculateAge();
    // Refresh for countdown
    const t = setInterval(calculateAge, 60000);
    return () => clearInterval(t);
  }, [birthdate]);


  // --- MODULE 2: BMI CALCULATIONS ---
  const [weight, setWeight] = useState(70); // kg
  const [height, setHeight] = useState(175); // cm
  const [bmiGender, setBmiGender] = useState<"male" | "female">("male");
  const [bmiResult, setBmiResult] = useState<any>(null);

  const calculateBMI = () => {
    const hMeters = height / 100;
    const value = weight / (hMeters * hMeters);
    let category = "Healthy Weight";
    let color = "text-emerald-400";
    let tips = "";

    if (value < 18.5) {
      category = "Underweight Status";
      color = "text-amber-400";
      tips = "Improve complex protein intakes, include daily nutrition maps, and check guidelines.";
    } else if (value >= 18.5 && value < 24.9) {
      category = "Balanced Healthy Weight";
      color = "text-emerald-400";
      tips = "Exceptional condition. Support with progressive resistance exercises and pure dynamic hydration.";
    } else if (value >= 25 && value < 29.9) {
      category = "Overweight Status";
      color = "text-orange-400";
      tips = "Introduce core HIIT elements, adjust weekly carbohydrate intakes, and evaluate metabolic indexes.";
    } else {
      category = "Obesity Range";
      color = "text-red-400";
      tips = "Evaluate lifestyle stressors, limit refined sugar models, and check clinical wellness consultations.";
    }

    setBmiResult({
      value: value.toFixed(1),
      category,
      color,
      tips
    });
  };

  useEffect(() => {
    calculateBMI();
  }, [weight, height]);


  // --- MODULE 3: EMI MORTGAGE CALCULATIONS ---
  const [loanAmount, setLoanAmount] = useState(50000); // 50K USD
  const [interestRate, setInterestRate] = useState(7.5); // %
  const [tenorMonths, setTenorMonths] = useState(12); // months
  const [emiResult, setEmiResult] = useState<any>(null);

  const calculateEMI = () => {
    const p = loanAmount;
    const r = (interestRate / 12) / 100;
    const n = tenorMonths;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    setEmiResult({
      monthly: emi.toFixed(0),
      totalPayable: totalPayment.toFixed(0),
      interestPayable: totalInterest.toFixed(0),
      percentInterest: ((totalInterest / totalPayment) * 100).toFixed(0)
    });
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenorMonths]);


  // --- MODULE 4: GST TAX BREAKDOWNS ---
  const [gstAmount, setGstAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18); // %
  const [gstMode, setGstMode] = useState<"inclusive" | "exclusive">("exclusive");
  const [gstResult, setGstResult] = useState<any>(null);

  const calculateGST = () => {
    let splitTax = 0;
    let netPayable = 0;
    if (gstMode === "exclusive") {
      splitTax = (gstAmount * gstRate) / 100;
      netPayable = gstAmount + splitTax;
    } else {
      splitTax = gstAmount - (gstAmount * (100 / (100 + gstRate)));
      netPayable = gstAmount;
    }

    setGstResult({
      cgst: (splitTax / 2).toFixed(2),
      sgst: (splitTax / 2).toFixed(2),
      totalTax: splitTax.toFixed(2),
      baseAmount: (netPayable - splitTax).toFixed(2),
      netAmount: netPayable.toFixed(2)
    });
  };

  useEffect(() => {
    calculateGST();
  }, [gstAmount, gstRate, gstMode]);


  // --- MODULE 5: PERCENTAGE MODES ---
  const [pctNum1, setPctNum1] = useState(25);
  const [pctNum2, setPctNum2] = useState(200);
  const [pctIncrease1, setPctIncrease1] = useState(15);
  const [pctIncrease2, setPctIncrease2] = useState(120);

  // --- MODULE 6: SCIENTIFIC WORKER STATES ---
  const [sciDisplay, setSciDisplay] = useState("");
  const [sciHistory, setSciHistory] = useState<string[]>([]);

  const handleSciPress = (char: string) => {
    if (char === "C") {
      setSciDisplay("");
    } else if (char === "DEL") {
      setSciDisplay(prev => prev.slice(0, -1));
    } else if (char === "=") {
      try {
        // Safe evaluation pattern
        const sanitized = sciDisplay
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/π/g, "Math.PI")
          .replace(/log\(/g, "Math.log10(")
          .replace(/√\(/g, "Math.sqrt(");
        
        const res = eval(sanitized);
        setSciHistory(prev => [sciDisplay + " = " + res, ...prev.slice(0, 4)]);
        setSciDisplay(String(res));
      } catch {
        setSciDisplay("Error");
        setTimeout(() => setSciDisplay(""), 1500);
      }
    } else {
      setSciDisplay(prev => prev + char);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto rounded-3xl" id={`tool-panel-${tool.id}`}>
      
      {/* LEFT INPUT CONTROLS */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl glow-indigo text-left relative">
          
          <div className="flex items-center gap-3 mb-4 leading-none">
            <span className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              {tool.id === "calc-age" ? <Calendar size={22} /> :
               tool.id === "calc-bmi" ? <Activity size={22} /> :
               tool.id === "calc-percent" ? <Percent size={22} /> :
               tool.id === "calc-emi" ? <Calculator size={22} /> :
               tool.id === "calc-gst" ? <Layers3 size={22} /> :
               <Binary size={22} />}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{tool.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Instant Precision Calculation Engine</p>
            </div>
          </div>

          {/* 1. INPUT PANELS BASED ON TOOL ID */}

          {/* AGE */}
          {tool.id === "calc-age" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Select DOB (Date of Birth)</label>
                <input 
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-indigo-500 font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* BMI */}
          {tool.id === "calc-bmi" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => setBmiGender("male")}
                  className={`text-xs p-2.5 rounded-lg border text-center transition-all ${
                    bmiGender === "male" ? "bg-indigo-600 border-indigo-400 text-white font-semibold" : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Male Profile
                </button>
                <button
                  onClick={() => setBmiGender("female")}
                  className={`text-xs p-2.5 rounded-lg border text-center transition-all ${
                    bmiGender === "female" ? "bg-indigo-600 border-indigo-400 text-white font-semibold" : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Female Profile
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 block mb-1">
                  <span>Body Mass Weight</span>
                  <span className="text-indigo-400 font-mono font-bold">{weight} kg</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full h-2 accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 block mb-1">
                  <span>Standard Height</span>
                  <span className="text-indigo-400 font-mono font-bold">{height} cm</span>
                </div>
                <input 
                  type="range"
                  min="100"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full h-2 accent-indigo-500"
                />
              </div>
            </div>
          )}

          {/* EMI */}
          {tool.id === "calc-emi" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Asset Value (Loan Principal)</label>
                <input 
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Rate % (Yearly)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Tenor (Months)</label>
                  <input 
                    type="number"
                    value={tenorMonths}
                    onChange={(e) => setTenorMonths(parseInt(e.target.value) || 0)}
                    className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GST */}
          {tool.id === "calc-gst" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => setGstMode("exclusive")}
                  className={`text-xs p-2.5 rounded-lg border text-center transition-all ${
                    gstMode === "exclusive" ? "bg-indigo-600 border-indigo-400 text-white font-semibold" : "bg-slate-900 border-white/10 text-slate-400"
                  }`}
                >
                  GST Exclusive
                </button>
                <button
                  onClick={() => setGstMode("inclusive")}
                  className={`text-xs p-2.5 rounded-lg border text-center transition-all ${
                    gstMode === "inclusive" ? "bg-indigo-600 border-indigo-400 text-white font-semibold" : "bg-slate-900 border-white/10 text-slate-400"
                  }`}
                >
                  GST Inclusive
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Initial Amount</label>
                <input 
                  type="number"
                  value={gstAmount}
                  onChange={(e) => setGstAmount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Tax Slab Rate (%)</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(parseInt(e.target.value))}
                  className="w-full text-xs bg-slate-950 border border-white/10 p-3 rounded-lg text-white font-mono"
                >
                  <option value="5">5% (Essential Items)</option>
                  <option value="12">12% (Standard)</option>
                  <option value="18">18% (Services/Tech)</option>
                  <option value="28">28% (Luxury Goods)</option>
                </select>
              </div>
            </div>
          )}

          {/* PERCENTAGE */}
          {tool.id === "calc-percent" && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3">
                <span className="text-[10px] font-mono font-bold text-indigo-400 block uppercase">Mode A: Simple Ratio</span>
                <div className="flex items-center gap-2 text-xs text-slate-350">
                  <span>What is</span>
                  <input 
                    type="number"
                    value={pctNum1}
                    onChange={(e) => setPctNum1(parseInt(e.target.value) || 0)}
                    className="w-16 bg-slate-950 text-white border border-white/10 text-center p-1.5 rounded font-mono"
                  />
                  <span>% of</span>
                  <input 
                    type="number"
                    value={pctNum2}
                    onChange={(e) => setPctNum2(parseInt(e.target.value) || 0)}
                    className="w-20 bg-slate-950 text-white border border-white/10 text-center p-1.5 rounded font-mono"
                  />
                  <span>?</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold font-mono">
                  Result: {((pctNum1 / 100) * pctNum2).toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3">
                <span className="text-[10px] font-mono font-bold text-indigo-400 block uppercase">Mode B: Increment Shift</span>
                <div className="flex items-center gap-2 text-xs text-slate-250">
                  <span>Scale</span>
                  <input 
                    type="number"
                    value={pctIncrease2}
                    onChange={(e) => setPctIncrease2(parseInt(e.target.value) || 0)}
                    className="w-20 bg-slate-950 text-white border border-white/10 text-center p-1.5 rounded font-mono"
                  />
                  <span>by</span>
                  <input 
                    type="number"
                    value={pctIncrease1}
                    onChange={(e) => setPctIncrease1(parseInt(e.target.value) || 0)}
                    className="w-16 bg-slate-950 text-white border border-white/10 text-center p-1.5 rounded font-mono"
                  />
                  <span>% increase</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold font-mono">
                  Result: {(pctIncrease2 * (1 + pctIncrease1 / 100)).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* SCIENTIFIC PANEL */}
          {tool.id === "calc-science" && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-white/10 text-right space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 block h-4 truncate">
                  {sciHistory[0] || "No memory states"}
                </span>
                <span className="text-2xl font-bold font-mono text-white block truncate h-8">
                  {sciDisplay || "0"}
                </span>
              </div>

              {/* Grid of keys */}
              <div className="grid grid-cols-4 gap-2 font-mono">
                {["sin(", "cos(", "tan(", "DEL", "log(", "√(", "π", "C", "7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "(", "+", ")", "="].map(char => (
                  <button
                    key={char}
                    onClick={() => handleSciPress(char)}
                    className={`p-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      char === "=" ? "bg-emerald-600 border-emerald-400 text-white col-span-2" :
                      char === "C" || char === "DEL" ? "bg-red-950/50 border-red-500/20 text-red-400" :
                      ["/", "*", "-", "+"].includes(char) ? "bg-indigo-950/50 border-indigo-500/20 text-indigo-300" :
                      "bg-slate-900 border-white/5 text-slate-350 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT AMORTIZATION & GAUGES VISUALS */}
      <div className="lg:col-span-7 flex flex-col min-h-[440px]">
        <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden glow-purple bg-slate-950/80">
          
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60 leading-none">
            <span className="text-xs text-slate-400 font-mono">active-analytical-matrix.yaml</span>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2.5 py-1 rounded-full font-sans">MATH_ACCURACY: HIGHEST</span>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-left">
            
            {/* 1. AGE RESULTS VIEW */}
            {tool.id === "calc-age" && ageResults && (
              <div className="w-full space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl text-center leading-none">
                    <span className="text-[10.5px] text-slate-400 font-sans block">Years active</span>
                    <span className="text-xl font-bold font-mono text-white block mt-2">{ageResults.years}</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl text-center leading-none">
                    <span className="text-[10.5px] text-slate-400 font-sans block">Months</span>
                    <span className="text-xl font-bold font-mono text-white block mt-2">{ageResults.months}</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl text-center leading-none">
                    <span className="text-[10.5px] text-slate-400 font-sans block">Days</span>
                    <span className="text-xl font-bold font-mono text-white block mt-2">{ageResults.days}</span>
                  </div>
                </div>

                {/* Sub countdown block */}
                <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] text-indigo-300 uppercase font-bold tracking-wider font-mono block">Birthday countdown</span>
                    <p className="text-xs text-slate-200 mt-1 max-w-[200px] leading-normal font-sans">
                      Only <strong>{ageResults.daysLeft}</strong> days left before your next age progression!
                    </p>
                  </div>
                  <span className="text-3xl font-extrabold text-indigo-400 font-mono shrink-0 animate-pulse">#{ageResults.daysLeft} d</span>
                </div>

                {/* Bio Lifetime Statistics */}
                <div className="space-y-2 pb-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider font-mono">Dynamic Lifetime Stats</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
                      <span className="text-slate-400 font-sans block">Aggregate days lived</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">{ageResults.totalDays.toLocaleString()} days</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
                      <span className="text-slate-400 font-sans block">Estimated heartbeats</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">{ageResults.heartbeats.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BMI RESULTS VIEW */}
            {tool.id === "calc-bmi" && bmiResult && (
              <div className="w-full space-y-6">
                
                {/* Big dial look */}
                <div className="text-center space-y-1.5 leading-none">
                  <span className="text-5xl font-black text-white font-mono">{bmiResult.value}</span>
                  <span className={`text-md font-bold block ${bmiResult.color} tracking-tight`}>{bmiResult.category}</span>
                </div>

                {/* Meter graphic scale */}
                <div className="h-2 w-full rounded-full bg-slate-900 border border-white/5 overflow-hidden flex">
                  <span className="h-full bg-amber-400" style={{ width: "20%" }} />
                  <span className="h-full bg-emerald-400" style={{ width: "30%" }} />
                  <span className="h-full bg-orange-400" style={{ width: "25%" }} />
                  <span className="h-full bg-red-400" style={{ width: "25%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono leading-none">
                  <span>Under 18.5</span>
                  <span>18.5 - 24.9</span>
                  <span>25 - 29.9</span>
                  <span>30+ Obese</span>
                </div>

                {/* Dietary advice */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-slate-350 leading-relaxed font-sans">
                  <h4 className="text-white font-bold mb-1">Tailored Dietary Guidelines:</h4>
                  {bmiResult.tips}
                </div>

              </div>
            )}

            {/* 3. EMI RESULTS WITH SVG DONUT GRAPHIC */}
            {tool.id === "calc-emi" && emiResult && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Details list */}
                <div className="space-y-3 text-xs leading-normal">
                  <div>
                    <span className="text-slate-400 block font-sans">Monthly EMI Payable</span>
                    <span className="text-2xl font-black text-white font-mono mt-1 block">${Number(emiResult.monthly).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2">
                    <span className="text-slate-500 block font-sans">Total Principal amount</span>
                    <span className="text-sm font-bold text-slate-300 font-mono block mt-0.5">${loanAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">Total Interest Payable</span>
                    <span className="text-sm font-bold text-violet-400 font-mono block mt-0.5">${Number(emiResult.interestPayable).toLocaleString()}</span>
                  </div>
                </div>

                {/* SVG Pizza chart representing principal vs interest */}
                <div className="flex flex-col items-center justify-center">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                    {/* SVG segment math */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      fill="transparent" 
                      stroke="#4f46e5" 
                      strokeWidth="16" 
                      strokeDasharray="440"
                      strokeDashoffset={(440 * Number(emiResult.percentInterest) / 100).toFixed(0)} 
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-3 font-semibold text-center">
                    {emiResult.percentInterest}% Interest Margin
                  </span>
                </div>

              </div>
            )}

            {/* 4. GST TAX BREAKDOWNS VIEW */}
            {tool.id === "calc-gst" && gstResult && (
              <div className="w-full space-y-4">
                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-2xl text-center space-y-1">
                  <span className="text-xs text-slate-400 font-sans block">Net Amount (Final invoice)</span>
                  <span className="text-3xl font-extrabold text-white font-mono block">${Number(gstResult.netAmount).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
                    <span className="text-slate-500 block font-sans">CGST Split (Central)</span>
                    <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">${gstResult.cgst}</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
                    <span className="text-slate-500 block font-sans">SGST Split (State)</span>
                    <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">${gstResult.sgst}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 font-mono border-t border-white/5 pt-3">
                  <span>Base untaxed cost</span>
                  <span className="font-bold text-white">${gstResult.baseAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Total tax component ({gstRate}%)</span>
                  <span className="font-bold text-red-400">${gstResult.totalTax}</span>
                </div>
              </div>
            )}

            {/* 5. PERCENTAGE DEFAULT WORKER */}
            {tool.id === "calc-percent" && (
              <div className="text-center space-y-4 p-6 bg-white/5 border border-white/5 rounded-2xl max-w-xs">
                <Percent size={36} className="text-violet-400 animate-float mx-auto" strokeWidth={1.5} />
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Dynamic Math logs</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Enter fields in the sidebar cards. Results are formulated in real-time.
                </p>
              </div>
            )}

            {/* 6. SCIENTIFIC HISTORY MEMORIES */}
            {tool.id === "calc-science" && (
              <div className="w-full text-left space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">Calculation logs</span>
                <div className="space-y-2">
                  {sciHistory.length > 0 ? (
                    sciHistory.map((val, i) => (
                      <div key={i} className="bg-slate-950/40 border border-white/5 p-3 rounded-xl font-mono text-xs text-slate-300 flex justify-between items-center bg-transparent">
                        <span>Line #{i+1}</span>
                        <span className="text-white font-bold">{val}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">History heap is empty. Evaluate some expressions above.</span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
