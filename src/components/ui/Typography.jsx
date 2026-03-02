import React from "react";
import { Link } from "react-router-dom";

export const Heading = ({ children, level = 1, className = "" }) => {
  const styles = {
    1: "text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight",
    2: "text-2xl md:text-3xl font-bold text-slate-900",
    3: "text-lg font-bold text-slate-900",
    4: "text-base font-semibold text-slate-900",
  };
  const Tag = `h${level}`;

  return <Tag className={`${styles[level]} ${className}`}>{children}</Tag>;
};

export const Text = ({ children, variant = "body", className = "" }) => {
  const styles = {
    lead: "text-lg text-slate-600 leading-relaxed",
    body: "text-sm text-slate-600 leading-relaxed",
    caption: "text-xs text-slate-500",
  };

  return <p className={`${styles[variant]} ${className}`}>{children}</p>;
};

// Add this below your existing Heading and Text components
export const TextLink = ({
  to,
  children,
  href = "#",
  className = "",
  variant = "nav",
}) => {
  const variants = {
    nav: "text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors",
    footer: "text-sm text-slate-400 hover:text-white transition-colors",
    utility: "text-xs text-slate-300 hover:text-white transition-colors",
  };
  if (to) {
    return (
      <Link to={to} className={`${variants[variant]} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={`${variants[variant]} ${className}`}>
      {children}
    </a>
  );
};
