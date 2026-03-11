
import React from 'react';
import { PanelLeft, PanelRight, ChevronLeft, CloudCheck } from 'lucide-react';

const NotesHeader = ({ 
  isLeftOpen, 
  setIsLeftOpen, 
  isRightOpen, 
  setIsRightOpen 
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 flex-shrink-0 z-30">
      
      {/* Left Side: Navigation & Left Sidebar Toggle */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Toggle Left Sidebar (Library) */}
        <button 
          onClick={() => setIsLeftOpen(!isLeftOpen)}
          className={`p-1.5 rounded-md transition-colors focus:outline-none ${
            isLeftOpen 
              ? 'bg-slate-100 text-slate-900' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Toggle Library (Folders)"
        >
          <PanelLeft size={20} />
        </button>

        <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>

        {/* Exit & Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm">
          <button className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 transition-colors font-medium pr-2">
            <ChevronLeft size={16} />
            <span className="hidden sm:inline-block">Dashboard</span>
          </button>

          <span className="text-slate-300 hidden sm:inline-block">/</span>

          <span className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-xs">
            Thermodynamics
          </span>
        </div>
      </div>

      {/* Right Side: AI Toggle & Status */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Sync Status */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
          <CloudCheck size={14} className="text-emerald-500" />
          <span>Saved</span>
        </div>

        <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>

        {/* Toggle Right Sidebar (AI Copilot) */}
        <button 
          onClick={() => setIsRightOpen(!isRightOpen)}
          className={`p-1.5 rounded-md transition-colors focus:outline-none flex items-center space-x-2 ${
            isRightOpen 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Toggle AI Copilot"
        >
          <span className="hidden sm:inline-block text-xs font-bold tracking-wide uppercase">
            AI Tutor
          </span>
          <PanelRight size={20} />
        </button>
      </div>

    </header>
  );
};

export default NotesHeader;
