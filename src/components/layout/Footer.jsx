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
    <footer className="mt-8  border border-white/10 bg-slate-900/95 px-5 py-8 sm:px-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_2fr]">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
            <Layers size={20} className="text-slate-400" />
            <div>
              <p className="text-base font-semibold tracking-wide text-slate-200">LearnSaathi</p>
              <p className="text-xs text-slate-400">Focused learning, powered by AI</p>
            </div>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Plan smarter, revise faster, and track your growth with one professional study workspace.
          </p>

          <div className="space-y-2 text-sm text-slate-400">
            <p className="inline-flex items-center gap-2"><Mail size={14} /> support@learnsaathi.app</p>
            <p className="inline-flex items-center gap-2"><Phone size={14} /> +91 90000 00000</p>
            <p className="inline-flex items-center gap-2"><MapPin size={14} /> India</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-xs uppercase tracking-[0.2em] text-slate-500">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors duration-200 hover:text-orange-300"
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

      <div className="mt-7 border-t border-white/10 pt-4 text-xs text-slate-500 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} LearnSaathi. All rights reserved.</p>
        <p>Built for students preparing with consistency.</p>
      </div>
    </footer>
  );
};

export default Footer;