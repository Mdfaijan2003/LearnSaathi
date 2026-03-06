import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';

const FloatingAITutor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Dragging State
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false); // Used to distinguish click vs drag
  
  const dragInfo = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const buttonSize = 56; // 56px = w-14

  // Set initial position (bottom right) when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - buttonSize - 24, // 24px padding from right
        y: window.innerHeight - buttonSize - 24 // 24px padding from bottom
      });
    }
  }, []);

  // Handle the drag movement
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;

      // Prevent scrolling while dragging on mobile
      if (e.type === 'touchmove') e.preventDefault();

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      // If moved more than 3px, consider it a drag, not a click
      const moveX = Math.abs(clientX - dragInfo.current.startX);
      const moveY = Math.abs(clientY - dragInfo.current.startY);
      if (moveX > 3 || moveY > 3) {
        setHasDragged(true);
      }

      let newX = dragInfo.current.initialX + (clientX - dragInfo.current.startX);
      let newY = dragInfo.current.initialY + (clientY - dragInfo.current.startY);

      // Keep the button within the screen boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - buttonSize));
      newY = Math.max(0, Math.min(newY, window.innerHeight - buttonSize));

      setPosition({ x: newX, y: newY });
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  // Start dragging
  const handleDown = (e) => {
    // Don't drag if clicking the chat window itself
    if (isOpen) return;

    setIsDragging(true);
    setHasDragged(false);

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    dragInfo.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  // Handle click to open/close chat
  const handleClick = () => {
    if (hasDragged) return; // Do not open if the user was just dragging the icon
    setIsOpen(!isOpen);
    setIsHovered(false); // Hide tooltip when opened
  };

  // Prevent rendering until client-side position is calculated
  if (position.x === null) return null;

  return (
    <div 
      className="fixed z-50 flex flex-col items-end"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        // Disable transition while dragging so it sticks perfectly to the mouse
        transition: isDragging ? 'none' : 'left 0.1s, top 0.1s' 
      }}
    >
      
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="absolute bottom-[70px] right-0 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col origin-bottom-right animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <span className="font-semibold text-sm tracking-wide">Synapse AI Tutor</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-80 bg-slate-50 p-4 flex items-center justify-center">
            <span className="text-sm text-slate-500">How can I help you today?</span>
          </div>
        </div>
      )}

      {/* The Floating Button */}
      <div 
        className="relative flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        {!isOpen && !isDragging && (
          <div 
            className={`absolute right-full mr-4 bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-md whitespace-nowrap transition-all duration-300 pointer-events-none ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            Ask AI Tutor
            <div className="absolute top-1/2 left-full -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-slate-800"></div>
          </div>
        )}

        {/* The Draggable Icon */}
        <button 
          onMouseDown={handleDown}
          onTouchStart={handleDown}
          onClick={handleClick}
          className={`relative flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-slate-300 select-none ${
            isOpen ? 'bg-slate-800 scale-95 cursor-default' : isDragging ? 'cursor-grabbing scale-95' : 'cursor-grab hover:-translate-y-1'
          }`}
        >
          {/* Main Bot Icon */}
          <Bot size={28} className={`${isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} transition-all duration-300 absolute pointer-events-none`} />
          
          {/* Close Icon (Transforms when opened) */}
          <X size={28} className={`${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all duration-300 absolute pointer-events-none`} />

          {/* Decorative Sparkle */}
          {!isOpen && (
            <Sparkles 
              size={12} 
              className="absolute top-3 right-3 text-amber-300 animate-pulse pointer-events-none" 
            />
          )}

          {/* Online Indicator Dot */}
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full pointer-events-none"></span>
        </button>
      </div>

    </div>
  );
};

export default FloatingAITutor;