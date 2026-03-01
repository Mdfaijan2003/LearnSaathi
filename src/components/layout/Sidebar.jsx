import { useState, useEffect } from "react";

const navItems = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "ai-tutor",
    label: "AI Tutor",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        <path d="M18 3l1.5 1.5L21 3l-1.5-1.5L18 3z" />
        <path d="M20 7l1 1 1.5-1.5" />
      </svg>
    ),
  },
  {
    id: "practice",
    label: "Practice",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Progress Analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: "notes",
    label: "Notes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M16 13h6" />
        <path d="M16 17h6" />
        <path d="M19 10v10" />
      </svg>
    ),
  },
  {
    id: "planner",
    label: "Planner",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "ai-features",
    label: "AI Features",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
        <path d="M5 17l.8 2.4L8 20l-2.2.6L5 23l-.8-2.4L2 20l2.2-.6L5 17z" />
      </svg>
    ),
  },
];

function NavItem({ item, index, active, visible, onClick }) {
  const [pressed, setPressed] = useState(false);
  const isActive = active === item.id;

  return (
    <button
      onClick={() => {
        setPressed(true);
        setTimeout(() => setPressed(false), 200);
        onClick(item.id);
      }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? pressed
            ? "scale(0.95)"
            : "scale(1)"
          : "translateX(-20px)",
        transition: `opacity 0.5s ease ${0.08 + index * 0.05}s, transform ${pressed ? "0.1s" : "0.45s"} ${pressed ? "ease" : `cubic-bezier(0.34,1.56,0.64,1) ${0.08 + index * 0.05}s`}`,
        background: isActive
          ? "linear-gradient(135deg, rgba(234,88,12,0.35) 0%, rgba(109,40,217,0.35) 100%)"
          : "transparent",
        color: isActive ? "#f97316" : "#9ca3af",
      }}
    >
      {/* Active left glow bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
          style={{ background: "#f97316", boxShadow: "0 0 8px #f97316" }}
        />
      )}

      {/* Icon */}
      <span
        className="shrink-0 transition-all duration-200"
        style={{
          color: isActive ? "#f97316" : "#6b7280",
          filter: isActive ? "drop-shadow(0 0 6px rgba(249,115,22,0.6))" : "none",
        }}
      >
        {item.icon}
      </span>

      {/* Label */}
      <span
        className="text-[14px] font-semibold tracking-tight transition-colors duration-200"
        style={{ color: isActive ? "#fff" : "#9ca3af" }}
      >
        {item.label}
      </span>

      {/* Hover bg */}
      {!isActive && (
        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.04] transition-all duration-200" />
      )}
    </button>
  );
}

export default function Sidebar() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div
        className="relative flex flex-col h-screen w-[240px] py-6 px-3"
        style={{
          background: "linear-gradient(180deg, #12121e 0%, #0f0f1a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-24px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-2 mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s",
          }}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.4)] shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
              <path d="M5 17l.6 2L7 20l-1.4.4L5 22l-.6-2L3 20l1.4-.4L5 17z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-extrabold text-[16px] leading-tight tracking-tight">LearnAI</p>
            <p className="text-gray-500 text-[11px] mt-0.5">AI Learning Platform</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((item, i) => (
            <NavItem
              key={item.id}
              item={item}
              index={i}
              active={active}
              visible={visible}
              onClick={setActive}
            />
          ))}
        </nav>

        {/* Divider */}
        <div
          className="my-4 border-t border-white/[0.07]"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.55s",
          }}
        />

        {/* User profile */}
        <div
          className="flex items-center gap-3 px-2"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s",
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 shrink-0 shadow-lg" />
          <div>
            <p className="text-white font-bold text-[14px] leading-tight">Student</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Class 12 • JEE</p>
          </div>
        </div>
      </div>
    </div>
  );
}