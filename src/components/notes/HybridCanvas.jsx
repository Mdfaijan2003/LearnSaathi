import React, { useState } from "react";
import { Type, PenTool, Sparkles, CloudUpload, CheckCircle2 } from "lucide-react";
import { Excalidraw } from "@excalidraw/excalidraw";

const HybridCanvas = () => {
  const [mode, setMode] = useState("text");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveToCloud = () => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">

      {/* ==============================
          HEADER
      =============================== */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 flex-shrink-0">

        {/* Last Edited */}
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Last edited 2 mins ago</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">

          <button
            onClick={() => setMode("text")}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === "text"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Type size={16} />
            <span>Type</span>
          </button>

          <button
            onClick={() => setMode("draw")}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === "draw"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <PenTool size={16} />
            <span>Draw</span>
          </button>
        </div>

        {/* Context Button */}
        {mode === "draw" ? (
          <button
            onClick={handleSaveToCloud}
            disabled={isSaving || saved}
            className={`flex items-center space-x-2 text-sm font-bold px-4 py-1.5 rounded-md transition-colors ${
              saved
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? <CheckCircle2 size={16} /> : <CloudUpload size={16} />}
            <span className="hidden sm:inline-block">
              {isSaving ? "Saving..." : saved ? "Saved to Cloud" : "Save Diagram"}
            </span>
          </button>
        ) : (
          <button className="flex items-center space-x-2 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors">
            <Sparkles size={16} />
            <span className="hidden sm:inline-block">Ask AI Copilot</span>
          </button>
        )}
      </div>

      {/* ==============================
          WORKSPACE
      =============================== */}
      <div className="flex-1 relative overflow-hidden flex flex-col transition-all duration-300">

        {/* ==============================
            TEXT MODE
        =============================== */}
        {mode === "text" && (
          <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto px-8 py-12 animate-in fade-in duration-300">

              <input
                type="text"
                defaultValue="Conservation of Energy & Thermodynamics"
                className="w-full text-4xl sm:text-5xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none mb-8 bg-transparent"
                placeholder="Untitled Document"
              />

              <div className="space-y-6 text-lg text-slate-700 leading-relaxed">

                <p>
                  The First Law of Thermodynamics states that energy cannot be created or destroyed, only transformed from one form to another.
                </p>

                {/* AI Suggestion */}
                <div className="relative border-l-4 border-amber-400 bg-amber-50 pl-4 py-3 pr-4 rounded-r-md group">
                  <span className="absolute -left-3 -top-3 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles size={12} />
                  </span>

                  <p className="text-amber-900 text-base">
                    <span className="line-through opacity-50 mr-2">
                      It implies that energy is infinite.
                    </span>
                    <span className="font-bold">
                      It implies that the total energy of an isolated system is constant.
                    </span>
                  </p>

                  <div className="mt-3 flex space-x-2">
                    <button className="text-xs bg-white border border-amber-200 px-3 py-1.5 rounded-md text-amber-700 hover:bg-amber-100 font-bold transition-colors shadow-sm">
                      Accept Fix
                    </button>

                    <button className="text-xs bg-transparent px-3 py-1.5 rounded-md text-amber-700 hover:bg-amber-100 transition-colors font-medium">
                      Ignore
                    </button>
                  </div>
                </div>

                <p>
                  For example, chemical energy is converted to kinetic energy when a stick of dynamite explodes.
                </p>

              </div>
            </div>
          </div>
        )}

        {/* ==============================
            DRAW MODE
        =============================== */}
        {mode === "draw" && (
          <div className="flex-1 relative bg-slate-50 animate-in fade-in duration-300">

            {/* Drawing Hint */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm text-slate-500">
              Use the toolbar to draw diagrams ✏️
            </div>

            {/* Canvas */}
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            >
              <Excalidraw
                UIOptions={{
                  canvasActions: {
                    loadScene: false,
                    export: false,
                    saveAsImage: false
                  }
                }}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default HybridCanvas;