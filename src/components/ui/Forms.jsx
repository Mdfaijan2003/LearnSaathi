import React from 'react';

export const Input = ({ className = '', ...props }) => (
  <input 
    className={`px-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full ${className}`} 
    {...props} 
  />
);

export const Select = ({ options, className = '', ...props }) => (
  <select className={`px-4 py-3 bg-transparent text-slate-600 focus:outline-none w-full appearance-none ${className}`} {...props}>
    <option value="" disabled selected>Select an option...</option>
    {options.map((opt, i) => (
      <option key={i} value={opt}>{opt}</option>
    ))}
  </select>
);