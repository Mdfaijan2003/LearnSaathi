import { useState, useEffect } from "react";

const TOTAL_DAYS = 14;
const ACTIVE_DAYS = 12;

export default function StudyStreak() {
  const [visible, setVisible] = useState(false);
  const [animatedBars, setAnimatedBars] = useState(0);
  const [countNum, setCountNum] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Animate count up
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1000;
    const step = Math.ceil(ACTIVE_DAYS / (duration / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= ACTIVE_DAYS) {
        setCountNum(ACTIVE_DAYS);
        clearInterval(interval);
      } else {
        setCountNum(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [visible]);

  // Stagger bars in one by one
  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAnimatedBars(i);
      if (i >= TOTAL_DAYS) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div >
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col items-center px-8 pt-8 pb-7 w-[360px] hover:shadow-[0_0_0_1px_rgba(255,140,0,0.08),_0_20px_60px_rgba(0,0,0,0.55)] transition-shadow duration-300 ease-out"
        style={{
          background: "linear-gradient(160deg, #1e1b18 0%, #1a1714 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 0 1px rgba(255,140,0,0.08), 0 20px 60px rgba(0,0,0,0.55)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Ambient orange glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(255,140,0,0.18) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />

        {/* Fire icon */}
        <div
          className="mb-4 relative z-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.5) translateY(10px)",
            transition: "opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
            filter: "drop-shadow(0 0 12px rgba(255,140,0,0.7))",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C12 2 7 7 7 13C7 15.76 9.24 18 12 18C14.76 18 17 15.76 17 13C17 10.5 15.5 8.5 14 7C14 7 14 9 12 9C12 9 10 7 12 2Z"
              fill="#f97316"
            />
            <path
              d="M12 18C10.5 18 9.5 17 9 16C9 16 10 16.5 11 15.5C11 15.5 11.5 17 13 16.5C13.5 17.2 13 18 12 18Z"
              fill="#fbbf24"
            />
          </svg>
        </div>

        {/* Day count */}
        <p
          className="text-white font-extrabold text-[38px] tracking-tight leading-none mb-1 relative z-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s",
          }}
        >
          {countNum} Days
        </p>

        {/* Subtitle */}
        <p
          className="text-gray-400 text-[14px] mb-6 relative z-10"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.25s",
          }}
        >
          Study Streak 🔥
        </p>

        {/* Streak bars - double pill per segment */}
        <div className="flex gap-1.5 w-full relative z-10">
          {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
            const isActive = i < ACTIVE_DAYS;
            const isAnimated = i < animatedBars;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col gap-[3px]"
                style={{
                  opacity: isAnimated ? 1 : 0,
                  transform: isAnimated ? "scaleY(1)" : "scaleY(0.3)",
                  transformOrigin: "bottom",
                  transition: `opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)`,
                }}
              >
                {/* Top pill */}
                <div
                  className="w-full h-[7px] rounded-full"
                  style={{
                    background: isActive
                      ? "linear-gradient(90deg, #c2410c, #f97316)"
                      : "#2a2a2a",
                    boxShadow: isActive && isAnimated ? "0 0 5px rgba(249,115,22,0.45)" : "none",
                  }}
                />
                {/* Bottom pill */}
                <div
                  className="w-full h-[7px] rounded-full"
                  style={{
                    background: isActive
                      ? "linear-gradient(90deg, #ea580c, #fb923c)"
                      : "#232323",
                    boxShadow: isActive && isAnimated ? "0 0 5px rgba(249,115,22,0.35)" : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}