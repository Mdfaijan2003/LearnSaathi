import { useState, useEffect } from "react";

const studyItems = [
  {
    id: 1,
    label: "2 Topics to Review",
    duration: "45 min",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M4 6C4 4.89543 4.89543 4 6 4H13V9C13 9.55228 13.4477 10 14 10H19V20C19 21.1046 18.1046 22 17 22H6C4.89543 22 4 21.1046 4 20V6Z" />
        <path d="M15 4.5L18.5 8H15V4.5Z" />
      </svg>
    ),
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    delay: 0.15,
  },
  {
    id: 2,
    label: "15 Practice Problems",
    duration: "30 min",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    iconBg: "bg-gradient-to-br from-pink-500 to-purple-600",
    delay: 0.25,
  },
  {
    id: 3,
    label: "1 Weak Concept",
    duration: "20 min",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-600",
    delay: 0.35,
  },
];

function StudyCard({ item, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-1 min-w-0 rounded-2xl p-4 sm:p-5 cursor-pointer overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: hovered
          ? "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? "translateY(-3px) scale(1.02)" : "translateY(0px) scale(1)"
          : "translateY(28px) scale(0.97)",
        transition: `opacity 0.6s ease ${item.delay}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: hovered
            ? "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)"
            : "none",
          transition: "background 0.4s ease",
        }}
      />

      {/* Icon */}
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-4 sm:mb-6 ${item.iconBg} shadow-lg`}>
        {item.icon}
      </div>

      {/* Text */}
      <p className="text-white font-bold text-[15px] sm:text-[16px] leading-snug tracking-tight mb-1">
        {item.label}
      </p>
      <p className="text-gray-400 text-[13px]">{item.duration}</p>
    </div>
  );
}

export default function AIStudyPlan() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div >
      {/* Outer card */}
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1c1824 0%, #181622 50%, #1a1528 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Ambient glow blobs */}
        <div className="absolute top-0 left-1/4 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)", filter: "blur(24px)" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)", filter: "blur(20px)" }} />

        <div className="relative z-10 p-4 sm:p-6">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            {/* Left: icon + title */}
            <div
              className="flex items-center gap-3.5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-16px)",
                transition: "opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s",
              }}
            >
              {/* Star icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.4)] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.4)" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-extrabold text-base sm:text-[18px] tracking-tight leading-tight">
                  Today's AI Study Plan
                </h2>
                <p className="text-gray-400 text-xs sm:text-[13px] mt-0.5">Personalized for your exam goals</p>
              </div>
            </div>

            {/* Generate button */}
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold text-[13px] sm:text-[14px] px-4 sm:px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_6px_28px_rgba(249,115,22,0.55)] hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.8)",
                transition: "opacity 0.45s ease 0.12s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.12s, box-shadow 0.2s ease, filter 0.2s ease",
              }}
            >
              Generate New Plan
            </button>
          </div>

          {/* Study cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {studyItems.map((item) => (
              <StudyCard key={item.id} item={item} visible={visible} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}