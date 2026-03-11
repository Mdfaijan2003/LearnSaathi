import React, { useState } from 'react';
import NotesHeader from '../components/notes/NotesHeader';
import HybridCanvas from '../components/notes/HybridCanvas';

const NotesDashboard = () => {
  // Master State for Sidebar visibility
  // By default, we keep the AI closed to give maximum whiteboard/typing space
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  return (
    // App Shell: Locks the screen height to prevent standard web scrolling
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden font-sans">
      
      {/* 1. The Top Navigation Bar */}
      <NotesHeader 
        isLeftOpen={isLeftSidebarOpen} 
        setIsLeftOpen={setIsLeftSidebarOpen}
        isRightOpen={isRightSidebarOpen}
        setIsRightOpen={setIsRightSidebarOpen}
      />

      {/* 2. The 3-Column Sliding Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* =========================================
            LEFT PANEL: Library (Folders & Files)
        ========================================= */}
        {/* Desktop: Pushes content. Mobile: Absolute overlay */}
        <aside 
          className={`
            h-full bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20
            absolute md:relative top-0 left-0
            ${isLeftSidebarOpen ? 'w-3/4 md:w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 overflow-hidden border-transparent'}
          `}
        >
          {/* Temporary Placeholder until we build LibrarySidebar.jsx */}
          <div className="p-4 w-64">
            <h3 className="font-bold text-slate-700 mb-4">Library</h3>
            <p className="text-sm text-slate-500">Folders and files will go here.</p>
          </div>
        </aside>

        {/* =========================================
            CENTER PANEL: Hybrid Canvas (Text + Whiteboard)
        ========================================= */}
        {/* This always flexes to fill whatever space is left over! */}
       <main className="flex-1 h-full bg-white relative flex flex-col min-w-0 z-0">
  <div 
    className={`md:hidden absolute inset-0 bg-slate-900/20 z-10 transition-opacity duration-300 ...`}
  />
  
  {/* Inject the real component here! */}
  <HybridCanvas />

</main>

        {/* =========================================
            RIGHT PANEL: AI Copilot
        ========================================= */}
        <aside 
          className={`
            h-full bg-slate-50 border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20
            absolute md:relative top-0 right-0
            ${isRightSidebarOpen ? 'w-3/4 md:w-80 translate-x-0' : 'w-0 translate-x-full md:translate-x-0 overflow-hidden border-transparent'}
          `}
        >
          {/* Temporary Placeholder until we build AICopilot.jsx */}
          <div className="p-4 w-80">
            <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              ✨ AI Tutor
            </h3>
            <p className="text-sm text-slate-500">I will monitor your notes and whiteboard drawings here in real-time.</p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default NotesDashboard;