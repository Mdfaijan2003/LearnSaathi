import React from 'react';

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white border border-slate-200 rounded-lg p-6 
      ${hover ? 'hover:shadow-sm hover:border-slate-300 transition-all' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export const CardIcon = ({ icon, className = '' }) => (
  <div className={`w-10 h-10 bg-slate-50 border border-slate-100 text-slate-700 rounded-md flex items-center justify-center mb-4 ${className}`}>
    {icon}
  </div>
);