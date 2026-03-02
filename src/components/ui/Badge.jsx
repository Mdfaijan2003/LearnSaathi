import React from 'react';

export const Badge = ({ children, className = '' }) => (
  <span className={`inline-block border border-slate-200 bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-widest ${className}`}>
    {children}
  </span>
);