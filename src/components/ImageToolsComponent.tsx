/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, ImageIcon, Crop, Compass, ArrowLeftRight, Layers, ShieldAlert,
  Smile, Download, RefreshCw, Sliders, Check, Layout, Text, Eye, Type
} from "lucide-react";
import { ToolItem } from "../types";

export default function ImageToolsComponent({ tool, onAddHistory }: { tool: ToolItem; onAddHistory: (id: string, name: string, desc: string) => void }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [processedSrc, setProcessedSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Resizer Controls
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [originalAspect, setOriginalAspect] = useState<number>(1);
  const [resizePreset, setResizePreset] = useState("custom");

  // Compressor Controls
  const [quality, setQuality] = useState<number>(75);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // Converter Controls
  const [targetFormat, setTargetFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/webp");

  // Background Remover Controls
  const [chromaColor, setChromaColor] = useState("#ffffff");
  const [tolerance, setTolerance] = useState(30);

  // Watermark Controls
  const [watermarkText, setWatermarkText] = useState("ToolVerse Secure");
  const [watermarkColor, setWatermarkColor] = useState("#ffffff");
  const [watermarkOpacity, setWatermarkOpacity] = useState(40);
  const [watermarkSize, setWatermarkSize] = useState(24);
  const [watermarkPos, setWatermarkPos] = useState<"center" | "bottom-right" | "top-left">("bottom-right");

  // Meme Controls
  const [topText, setTopText] = useState("WHEN THE CODE");
  const [bottomText, setBottomText] = useState("WORKS ON FIRST TRY");
  const [memePresetInput, setMemePresetInput] = useState<string>("");

  const originalImgRef = useRef<HTMLImageElement | null>(null);

  // Preset sizes mapping
  const PRESET_SIZES = [
    { id: "custom", label: "Custom Scope" },
    { id: "youtube", label: "YouTube Thumbnail (1280x720)", w: 1280, h: 720 },
    { id: "insta_square", label: "Instagram Square (1080x1080)", w: 1080, h: 1080 },
    { id: "twitter_post", label: "Twitter Banner (1500x500)", w: 1500, h: 500 },
    { id: "linkedin_post", label: "LinkedIn Share (1200x627)", w: 1200, h: 627 }
  ];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLoadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLoadFile(e.target.files[0]);
    }
  };

  const handleLoadFile = (file: File) => {
    setImageFile(file);
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setProcessedSrc("");
        setCompressedSize(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOriginalAspect(img.naturalWidth / img.naturalHeight);
    setWidth(img.naturalWidth);
    setHeight(img.naturalHeight);
  };

  // 1. Process Resizer Flow
  const processResizer = () => {
    if (!imageSrc || !originalImgRef.current) return;
    setLoading(true);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImgRef.current, 0, 0, width, height);
      const output = canvas.toDataURL(imageFile?.type || "image/png");
      setProcessedSrc(output);
      onAddHistory(tool.id, tool.name, `Resized file to ${width}x${height}px`);
    }
    setLoading(false);
  };

  // 2. Process Compressor Flow
  const processCompressor = () => {
    if (!imageSrc || !originalImgRef.current) return;
    setLoading(true);
    const canvas = document.createElement("canvas");
    canvas.width = originalImgRef.current.naturalWidth;
    canvas.height = originalImgRef.current.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImgRef.current, 0, 0);
      const qualityFactor = quality / 100;
      const output = canvas.toDataURL("image/jpeg", qualityFactor);
      setProcessedSrc(output);
      
      // Calculate fake compressed size beautifully
      const roughLen = (output.length - 22) * 3 / 4;
      setCompressedSize(roughLen);
      onAddHistory(tool.id, tool.name, `Compressed file image with ${quality}% quality factor`);
    }
    setLoading(false);
  };

  // 3. Process Format Transcoder
  const processConverter = () => {
    if (!imageSrc || !originalImgRef.current) return;
    setLoading(true);
    const canvas = document.createElement("canvas");
    canvas.width = originalImgRef.current.naturalWidth;
    canvas.height = originalImgRef.current.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImgRef.current, 0, 0);
      const output = canvas.toDataURL(targetFormat);
      setProcessedSrc(output);
      onAddHistory(tool.id, tool.name, `Converted layout format to ${targetFormat.split("/")[1]}`);
    }
    setLoading(false);
  };

  // 4. Chroma Key Backdrop Remover
  const processBackdropRemoval = () => {
    if (!imageSrc || !originalImgRef.current) return;
    setLoading(true);
    const canvas = document.createElement("canvas");
    const w = originalImgRef.current.naturalWidth;
    const h = originalImgRef.current.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImgRef.current, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Hex to RGB parser
      const r_target = parseInt(chromaColor.slice(1, 3), 16);
      const g_target = parseInt(chromaColor.slice(3, 5), 16);
      const b_target = parseInt(chromaColor.slice(5, 7), 16);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color difference check
        const dist = Math.sqrt(
          Math.pow(r - r_target, 2) +
          Math.pow(g - g_target, 2) +
          Math.pow(b - b_target, 2)
        );

        if (dist < tolerance) {
          data[i + 3] = 0; // Set transparency fully
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL("image/png"));
      onAddHistory(tool.id, tool.name, `Removed backdrop background matching: ${chromaColor}`);
    }
    setLoading(false);
  };

  // 5. Watermark Signer
  const processWatermark = () => {
    if (!imageSrc || !originalImgRef.current) return;
    setLoading(true);
    const canvas = document.createElement("canvas");
    const w = originalImgRef.current.naturalWidth;
    const h = originalImgRef.current.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImgRef.current, 0, 0);
      
      ctx.font = `bold ${watermarkSize}px Inter, sans-serif`;
      ctx.fillStyle = watermarkColor;
      ctx.globalAlpha = watermarkOpacity / 100;
      
      const textWidth = ctx.measureText(watermarkText).width;
      let x = w - textWidth - 30;
      let y = h - 30;

      if (watermarkPos === "center") {
        x = (w - textWidth) / 2;
        y = h / 2;
      } else if (watermarkPos === "top-left") {
        x = 30;
        y = watermarkSize + 30;
      }

      ctx.fillText(watermarkText, x, y);
      setProcessedSrc(canvas.toDataURL(imageFile?.type || "image/png"));
      onAddHistory(tool.id, tool.name, "Signed file watermark banner onto canvas");
    }
    setLoading(false);
  };

  // 6. Meme Overlay Canvas
  const processMeme = () => {
    if (!imageSrc || !originalImgRef.current) return;
    setLoading(true);
    const canvas = document.createElement("canvas");
    const w = originalImgRef.current.naturalWidth;
    const h = originalImgRef.current.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImgRef.current, 0, 0);

      // Setup heavy meme typography specs (Impact look)
      const dynamicFontSize = Math.floor(w / 12);
      ctx.font = `${dynamicFontSize}px Impact, Oswald, Arial Black, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.max(3, dynamicFontSize / 10);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Draw Top Text
      if (topText) {
        ctx.strokeText(topText.toUpperCase(), w / 2, 20);
        ctx.fillText(topText.toUpperCase(), w / 2, 20);
      }

      // Draw Bottom Text
      if (bottomText) {
        ctx.textBaseline = "bottom";
        ctx.strokeText(bottomText.toUpperCase(), w / 2, h - 20);
        ctx.fillText(bottomText.toUpperCase(), w / 2, h - 20);
      }

      setProcessedSrc(canvas.toDataURL("image/jpeg"));
      onAddHistory(tool.id, tool.name, "Constructed meme design layouts");
    }
    setLoading(false);
  };

  const executeImageTool = () => {
    if (tool.id === "img-resizer") processResizer();
    else if (tool.id === "img-compressor") processCompressor();
    else if (tool.id === "img-converter") processConverter();
    else if (tool.id === "img-bgremover") processBackdropRemoval();
    else if (tool.id === "img-watermark") processWatermark();
    else if (tool.id === "img-meme") processMeme();
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (keepAspect) {
      setHeight(Math.round(val / originalAspect));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (keepAspect) {
      setWidth(Math.round(val * originalAspect));
    }
  };

  const applyPreset = (presetId: string) => {
    setResizePreset(presetId);
    if (presetId === "custom") return;
    const target = PRESET_SIZES.find(o => o.id === presetId);
    if (target && target.w && target.h) {
      setWidth(target.w);
      setHeight(target.h);
    }
  };

  const downloadFile = () => {
    if (!processedSrc) return;
    const link = document.createElement("a");
    link.href = processedSrc;
    const ext = tool.id === "img-converter" ? targetFormat.split("/")[1] : "png";
    link.download = `toolverse_${tool.id}_output.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadDemoMemePhoto = () => {
    // Generate a cute procedurally styled canvas as template
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw lovely retro digital background
      const grad = ctx.createLinearGradient(0, 0, 600, 450);
      grad.addColorStop(0, "#4f46e5");
      grad.addColorStop(1, "#a855f7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 450);

      // Draw shiny sun
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "#fb117a";
      ctx.beginPath();
      ctx.arc(300, 225, 90, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal lines retro grid
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      for (let y = 0; y < 450; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(600, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("[ ToolVerse Dev Sandbox Canvas ]", 300, 230);

      const dataUrl = canvas.toDataURL();
      setImageSrc(dataUrl);
      setOriginalSize(120000);
      setOriginalAspect(4/3);
    }
  };

  const helperRefReset = () => {
    setImageFile(null);
    setImageSrc("");
    setProcessedSrc("");
    setCompressedSize(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto rounded-3xl" id={`tool-panel-${tool.id}`}>
      
      {/* Hidden tags element to pre-render the loaded asset */}
      {imageSrc && (
        <img 
          ref={originalImgRef}
          src={imageSrc} 
          alt="Original Pre-render source" 
          onLoad={handleImageLoad}
          className="hidden"
          referrerPolicy="no-referrer"
        />
      )}

      {/* LEFT: Inputs & Controls */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl glow-indigo text-left relative">
          
          <div className="flex items-center gap-3 mb-4">
            <span className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              {tool.id === "img-resizer" ? <Crop size={22} /> :
               tool.id === "img-compressor" ? <Compass size={22} /> :
               tool.id === "img-converter" ? <ArrowLeftRight size={22} /> :
               tool.id === "img-bgremover" ? <Layers size={22} /> :
               tool.id === "img-watermark" ? <ShieldAlert size={22} /> :
               <Smile size={22} />}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{tool.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">High Performance Browser Engine</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 mb-6">
            Keep sensitive client graphic assets 100% private. All graphics are structured and calculated client-side in safety.
          </p>

          {/* Loader drag-and-drop widget */}
          {!imageSrc ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-slate-950/50 p-8 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[220px]"
              onClick={() => document.getElementById("uploader-file-selector")?.click()}
            >
              <Upload size={32} className="text-indigo-400 animate-float" />
              <div>
                <p className="text-xs font-semibold text-white">Drag & drop your file here</p>
                <p className="text-[11px] text-slate-400 mt-1">Accepts standard PNG, JPEG, SVG or WebP formats</p>
              </div>
              <button className="mt-2 bg-indigo-600/30 text-indigo-300 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-600/45 transition-all">
                Select File Manually
              </button>
              <input 
                id="uploader-file-selector"
                type="file" 
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden" 
              />
              
              {tool.id === "img-meme" && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadDemoMemePhoto(); }}
                  className="mt-2 bg-purple-600/30 text-purple-300 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-purple-600/45 transition-all"
                >
                  Or Load Sandbox Demo Canvas
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg text-xs">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <ImageIcon size={14} className="text-indigo-400 shrink-0" />
                  <span className="text-slate-300 truncate">{imageFile?.name || "sandbox_canvas.png"}</span>
                </div>
                <button 
                  onClick={helperRefReset}
                  className="text-red-400 hover:text-red-300 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* DYNAMIC FORM PARTICULARS BASED ON COMPONENT TOOL */}

              {/* 1. RESIZER PRESETS */}
              {tool.id === "img-resizer" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-2">Preset Aspect Proportions</label>
                    <select
                      value={resizePreset}
                      onChange={(e) => applyPreset(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white"
                    >
                      {PRESET_SIZES.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Width (px)</label>
                      <input 
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Height (px)</label>
                      <input 
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input 
                      type="checkbox"
                      checked={keepAspect}
                      onChange={(e) => setKeepAspect(e.target.checked)}
                      className="rounded accent-indigo-500 scale-95"
                    />
                    <span className="text-xs text-slate-300">Preserve original aspect ratio</span>
                  </label>
                </div>
              )}

              {/* 2. COMPRESSOR */}
              {tool.id === "img-compressor" && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 leading-none">
                    <span>JPEG Quality Focus</span>
                    <span className="text-indigo-400 font-mono">{quality}%</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer py-2"
                  />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Reducing quality reduces file weight drastically without noticeable loss in pixels on typical screens.
                  </p>
                </div>
              )}

              {/* 3. CONVERTER */}
              {tool.id === "img-converter" && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Select Target Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "image/webp", name: "WebP" },
                      { id: "image/png", name: "PNG Logo" },
                      { id: "image/jpeg", name: "JPEG Standard" }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTargetFormat(f.id as any)}
                        className={`text-xs p-2.5 rounded-lg border text-center transition-all ${
                          targetFormat === f.id
                            ? "bg-indigo-600 border-indigo-400 text-white font-medium shadow"
                            : "bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-850 hover:text-white"
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. BACKGROUND CHROMA KEY */}
              {tool.id === "img-bgremover" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Target BG Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={chromaColor}
                          onChange={(e) => setChromaColor(e.target.value)}
                          className="h-9 w-10 rounded border border-white/10 bg-slate-950 p-0 cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={chromaColor}
                          onChange={(e) => setChromaColor(e.target.value)}
                          className="flex-1 text-xs bg-slate-950 border border-white/10 p-2 rounded text-white font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Color Tolerance</label>
                      <input 
                        type="number"
                        min="5"
                        max="120"
                        value={tolerance}
                        onChange={(e) => setTolerance(parseInt(e.target.value) || 30)}
                        className="w-full text-xs bg-slate-950 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Colors close to the target color within the tolerance range are rendered transparent. Great for extracting white graphics.
                  </p>
                </div>
              )}

              {/* 5. WATERMARK */}
              {tool.id === "img-watermark" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Watermark Text Banner</label>
                    <input 
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Size (px)</label>
                      <input 
                        type="number"
                        min="10"
                        max="100"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(parseInt(e.target.value) || 24)}
                        className="w-full text-xs bg-slate-950 border border-white/10 p-2 rounded text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Opacity (%)</label>
                      <input 
                        type="number"
                        min="10"
                        max="100"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseInt(e.target.value) || 40)}
                        className="w-full text-xs bg-slate-950 border border-white/10 p-2 rounded text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Placement</label>
                      <select
                        value={watermarkPos}
                        onChange={(e) => setWatermarkPos(e.target.value as any)}
                        className="w-full text-xs bg-slate-950 border border-white/10 p-2 rounded text-white block"
                      >
                        <option value="bottom-right">Bottom-Right</option>
                        <option value="center">Center</option>
                        <option value="top-left">Top-Left</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. MEME DESIGNER */}
              {tool.id === "img-meme" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Top text (Oswald format)</label>
                    <input 
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white outline-none font-sans uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Bottom text</label>
                    <input 
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/10 p-2.5 rounded-lg text-white outline-none font-sans uppercase"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={executeImageTool}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sliders size={14} />}
                Generate Changes
              </button>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT: Visual Side-By-Side Dashboard */}
      <div className="lg:col-span-7 flex flex-col min-h-[440px]">
        <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden glow-purple bg-slate-950/80">
          
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60 leading-none">
            <span className="text-xs text-slate-400 font-mono">active-render-canvas.env</span>
            {imageSrc && (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-sans font-medium flex items-center gap-1">
                <Check size={10} /> CANVAS_READY
              </span>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            {imageSrc ? (
              <div className="w-full space-y-6 flex flex-col items-center">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Left: Input Image Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-left">Original Asset</span>
                    <div className="aspect-video bg-slate-900 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center p-3">
                      <img src={imageSrc} alt="Pre-render" className="max-h-full max-w-full object-contain rounded" referrerPolicy="no-referrer" />
                    </div>
                    {originalSize > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 block text-left">
                        Size: {(originalSize / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  {/* Right: Output Image Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block text-left">Processed output</span>
                    <div className="aspect-video bg-slate-900 border border-emerald-500/10 rounded-xl overflow-hidden flex items-center justify-center p-3 relative">
                      {processedSrc ? (
                        <img src={processedSrc} alt="Processed product" className="max-h-full max-w-full object-contain rounded" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs text-slate-500 animate-pulse">Awaiting generation...</span>
                      )}
                    </div>
                    {compressedSize > 0 && tool.id === "img-compressor" && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block text-left">
                        Compressed size: {(compressedSize / 1024).toFixed(1)} KB ({(100 - (compressedSize / originalSize * 100)).toFixed(0)}% space saved!)
                      </span>
                    )}
                  </div>
                </div>

                {processedSrc && (
                  <button
                    onClick={downloadFile}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-6 py-3 rounded-xl font-bold transition-all shadow-md mt-6 shadow-emerald-900/30"
                  >
                    <Download size={13} /> Download Processed Output
                  </button>
                )}

              </div>
            ) : (
              <div className="text-center space-y-4 max-w-xs bg-white/5 p-6 border border-white/5 rounded-2xl">
                <ImageIcon size={36} className="text-violet-400 rotate-6 mx-auto animate-float" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Workspace Canvas</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Upload an image from your device or load the Sandbox demo to activate interactive filters on this workspace!
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
