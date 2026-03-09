import React from "react";
import { Layers, Mail, Phone, MapPin } from "lucide-react";

const linkGroups = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "#dashboard" },
      { label: "AI Tutor", href: "#ai-tutor" },
      { label: "Practice", href: "#practice" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Notes", href: "#notes" },
      { label: "Planner", href: "#planner" },
      { label: "Progress Analytics", href: "#analytics" },
      { label: "Help Center", href: "#help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "System Architecture", href: "#architecture" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
      {/* Max-width container to perfectly align with Navbar and Sections */}
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr] mb-16">
          
          {/* Left Column: Brand & Contact */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-white">
              <Layers size={28} className="text-slate-300" />
              <span className="text-2xl font-bold tracking-tight">LearnSaathi</span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Plan smarter, revise faster, and track your growth with one professional study workspace engineered for serious learners.
            </p>

            <div className="space-y-3 text-sm text-slate-400 pt-2">
              <p className="inline-flex items-center gap-3 hover:text-slate-200 transition-colors cursor-default">
                <Mail size={16} /> support@learnsaathi.app
              </p>
              <p className="inline-flex items-center gap-3 hover:text-slate-200 transition-colors cursor-default">
                <Phone size={16} /> +91 90000 00000
              </p>
              <p className="inline-flex items-center gap-3 hover:text-slate-200 transition-colors cursor-default">
                <MapPin size={16} /> India
              </p>
            </div>
          </div>

          {/* Right Column: Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-sm text-slate-500 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LearnSaathi Inc. All rights reserved.</p>
          <p className="font-medium">Built for students preparing with consistency.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;