import { useState, useEffect } from "react";

const subjects = [
  {
    id: 1,
    subject: "Physics",
    topic: "Thermodynamics",
    progress: 68,
    iconBg: "from-sky-400 to-blue-500",
    delay: 0.1,
  },
  {
    id: 2,
    subject: "Chemistry",
    topic: "Chemical Bonding",
    progress: 82,
    iconBg: "from-green-400 to-green-500",
    delay: 0.2,
  },
  {
    id: 3,
    subject: "Mathematics",
    topic: "Probability",
    progress: 45,
    iconBg: "from-fuchsia-500 to-purple-600",
    delay: 0.3,
  },
  {
    id: 4,
    subject: "Biology",
    topic: "Genetics",
    progress: 90,
    iconBg: "from-orange-400 to-orange-500",
    delay: 0.4,
  },
];

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function AnimatedBar({ target, started }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setWidth(target), 200);
    return () => clearTimeout(t);
  }, [started, target]);

  return (
    <div className="w-full h-[5px] bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full"
        style={{
          width: `${width}%`,
          transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 0 6px rgba(255,255,255,0.4)",
        }}
      />
    </div>
  );
}

function SubjectCard({ item, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-5 cursor-pointer overflow-hidden"
      style={{
        background: hovered ? "#2c2c3d" : "#252535",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)"}`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? "translateY(-4px) scale(1.02)"
            : "translateY(0px) scale(1)"
          : "translateY(28px) scale(0.97)",
        transition: `opacity 0.6s ease ${item.delay}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease`,
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
        <BookIcon />
      </div>

      {/* Subject name */}
      <p className="text-white font-extrabold text-[17px] tracking-tight mb-1">{item.subject}</p>

      {/* Topic */}
      <p className="text-gray-400 text-[13.5px] mb-6">{item.topic}</p>

      {/* Progress label + % */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 text-[12.5px]">Progress</span>
        <span className="text-gray-300 text-[13px] font-semibold">{item.progress}%</span>
      </div>

      {/* Bar */}
      <AnimatedBar target={item.progress} started={visible} />
    </div>
  );
}

export default function ContinueLearning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="glass-card w-full p-3 sm:p-4">
      <div
        className="w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Section title */}
        <h2
          className="text-white text-lg sm:text-xl font-extrabold tracking-tighter px-1 sm:px-2 py-3 sm:py-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-12px)",
            transition: "opacity 0.5s ease 0.06s, transform 0.5s ease 0.06s",
          }}
        >
          Continue Learning
        </h2>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {subjects.map((item) => (
            <SubjectCard key={item.id} item={item} visible={visible} />
          ))}
        </div>
      </div>
    </div>
  );
}