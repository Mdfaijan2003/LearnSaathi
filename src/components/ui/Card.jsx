import React from 'react';

// ==========================================
// OPTION 1: The Basic Container Card
// Use this when you need complete custom control over the layout inside.
// ==========================================
export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white border border-slate-200 rounded-lg p-6
      ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 ease-out' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

// ==========================================
// OPTION 2: The Structured Title & Content Card
// Use this for feature grids, pain points, or standard informational blocks.
// ==========================================
export const StructuredCard = ({ title, description, icon, children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col
      ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 ease-out' : ''} 
      ${className}
    `}>
      
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
        {icon && (
          <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <h3 className="text-base font-bold text-slate-900 tracking-tight m-0">
          {title}
        </h3>
      </div>
      
      
      <div className="p-6 flex-1 flex flex-col bg-white">
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed mb-4 z-10">
            {description}
          </p>
        )}
        
       
        <div className="mt-auto">
          {children}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// UTILITY: Reusable Icon Wrapper (For Option 1)
// ==========================================
export const CardIcon = ({ icon, className = '', variant = 'default' }) => {
  const variants = {
    default: "bg-slate-50 border-slate-100 text-slate-700",
    error: "bg-rose-50 border-rose-100 text-rose-600",
    success: "bg-emerald-50 border-emerald-100 text-emerald-600"
  };

  return (
    <div className={`w-10 h-10 border rounded-md flex items-center justify-center mb-4 ${variants[variant]} ${className}`}>
      {icon}
    </div>
  );
};