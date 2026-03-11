import React, { useState } from 'react';
import { 
  Highlighter, Plus, GripVertical, MessageSquare, 
  Trash2, FileText, Share2, MoreHorizontal 
} from 'lucide-react';

const Workspace = () => {
  // Mock State: Represents the notes the user has "saved" from the text
  const [savedNotes, setSavedNotes] = useState([
    {
      id: 1,
      quote: "The First Law of Thermodynamics states that energy cannot be created or destroyed, only transformed from one form to another.",
      userComment: "Crucial for the Q4 exam. Remember the pendulum example.",
      color: "blue"
    }
  ]);

  // Mock State: Simulates a user highlighting text
  const [isHighlighting, setIsHighlighting] = useState(true);

  const handleSaveSnippet = () => {
    const newNote = {
      id: Date.now(),
      quote: "In an isolated system, the total energy remains constant. This is the fundamental principle of conservation of energy.",
      userComment: "", // Blank initially, waiting for user to type
      color: "emerald"
    };
    setSavedNotes([...savedNotes, newNote]);
    setIsHighlighting(false); // Hide tooltip after saving
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      
      {/* Workspace Toolbar */}
      <div className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-slate-400" />
          <span className="font-semibold text-sm text-slate-800">Chapter 4: Thermodynamics.pdf</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Export PDF</button>
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition-colors">
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Split Pane: Document (Left) & Notebook (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* =========================================
            LEFT HALF: THE SOURCE DOCUMENT
        ========================================= */}
        <div className="flex-1 lg:w-1/2 h-full overflow-y-auto border-r border-slate-200 bg-slate-50 p-6 lg:p-12 relative">
          
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Conservation of Energy</h1>
            
            <p className="text-slate-700 leading-loose mb-6 text-lg">
              Classical thermodynamics is based on the four laws of thermodynamics. In thermodynamics, interactions between large ensembles of objects are studied and categorized.
            </p>

            {/* Simulating a highlighted paragraph with a floating tooltip */}
            <div className="relative mb-6">
              
              {/* Floating "Save to Notes" Tooltip */}
              {isHighlighting && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white shadow-xl rounded-lg flex items-center overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-10">
                  <button 
                    onClick={handleSaveSnippet}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-800 transition-colors text-sm font-medium border-r border-slate-700"
                  >
                    <Highlighter size={16} className="text-amber-400" />
                    <span>Save to Notes</span>
                  </button>
                  <button className="px-3 py-2 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                    <MoreHorizontal size={16} />
                  </button>
                  {/* Tooltip Triangle */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 -z-10"></div>
                </div>
              )}

              {/* The "Selected" Text */}
              <p className={`text-slate-700 leading-loose text-lg rounded md transition-colors ${isHighlighting ? 'bg-amber-100 text-amber-900 selection:bg-amber-200 cursor-text' : ''}`}>
                In an isolated system, the total energy remains constant. This is the fundamental principle of conservation of energy. It implies that energy can neither be created nor destroyed, but can be change from one form to another.
              </p>
            </div>

            <p className="text-slate-700 leading-loose mb-6 text-lg">
              For example, chemical energy is converted to kinetic energy when a stick of dynamite explodes. If one adds up all forms of energy that were released in the explosion, it will equal the chemical energy in the unexploded dynamite.
            </p>
          </div>
        </div>

        {/* =========================================
            RIGHT HALF: THE "SPOTIFY PLAYLIST" NOTEBOOK
        ========================================= */}
        <div className="flex-1 lg:w-1/2 h-full overflow-y-auto bg-white p-6 lg:p-8">
          
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">My Snippets</h2>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                {savedNotes.length} Saved
              </span>
            </div>

            {/* The List of Snippets */}
            <div className="space-y-4">
              {savedNotes.map((note) => (
                <SnippetCard key={note.id} note={note} />
              ))}
            </div>

            {/* Empty State / Add Manual Note */}
            <button className="mt-6 w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 font-medium">
              <Plus size={18} />
              <span>Add a manual thought...</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

// =========================================
// THE "SPOTIFY TRACK" SNIPPET CARD UI
// =========================================
const SnippetCard = ({ note }) => {
  // Border colors based on the tag color
  const colorMap = {
    blue: "border-l-blue-500",
    emerald: "border-l-emerald-500",
    rose: "border-l-rose-500",
    amber: "border-l-amber-500",
  };

  return (
    <div className={`group relative bg-white border border-slate-200 border-l-4 rounded-r-xl rounded-l-sm shadow-sm hover:shadow-md transition-all duration-200 ${colorMap[note.color] || colorMap.blue}`}>
      
      {/* Drag Grip Handle (Visible on hover) */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab hover:text-slate-500 transition-opacity hidden md:block">
        <GripVertical size={18} />
      </div>

      <div className="p-4 sm:p-5">
        
        {/* The Exact Quote / Snippet */}
        <div className="relative pl-4 mb-4">
          {/* Subtle Quote Mark Graphic */}
          <span className="absolute -left-1 top-0 text-4xl font-serif text-slate-200 leading-none select-none">"</span>
          <p className="text-sm font-medium text-slate-700 italic relative z-10 leading-relaxed">
            {note.quote}
          </p>
        </div>

        {/* User's Context / Comments */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-start space-x-3">
          <MessageSquare size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          
          {note.userComment ? (
            <p className="text-xs text-slate-600 font-medium">{note.userComment}</p>
          ) : (
            <input 
              type="text" 
              placeholder="Why did you save this? Add context..." 
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          )}
        </div>

      </div>

      {/* Action Bar (Hidden by default, shows on hover) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
          <MoreHorizontal size={14} />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

    </div>
  );
};

export default Workspace;