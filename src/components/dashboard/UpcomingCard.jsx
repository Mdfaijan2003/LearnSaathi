import { useState, useEffect } from "react";

const tasks = [
  {
    id: 1,
    title: "Mock Test - Mathematics",
    time: "10:00 AM",
    tag: "Test",
    barColor: "bg-orange-500",
    tagClass: "bg-orange-700 hover:bg-orange-600 text-orange-100",
  },
  {
    id: 2,
    title: "Revision - Organic Chemistry",
    time: "02:30 PM",
    tag: "Revision",
    barColor: "bg-indigo-400",
    tagClass: "bg-indigo-700/80 hover:bg-indigo-600 text-indigo-100",
  },
  {
    id: 3,
    title: "Practice Session - Physics",
    time: "05:00 PM",
    tag: "Practice",
    barColor: "bg-purple-500",
    tagClass: "bg-purple-800/80 hover:bg-purple-700 text-purple-100",
  },
];

function TaskCard({ task, index, visible }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#1e1e2e] border border-white/[0.06] rounded-2xl px-4 sm:px-5 py-4 cursor-pointer hover:scale-[1.01] sm:hover:scale-[1.02] hover:bg-[#23233a] hover:border-white/10 hover:shadow-xl transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity 0.55s ease ${index * 0.12}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s, box-shadow 0.3s ease, background 0.3s ease`,
      }}
    >
      {/* Left: accent bar + text */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className={`w-[3px] h-10 rounded-full shrink-0 ${task.barColor}`} />
        <div>
          <p className="text-white font-bold text-sm sm:text-[15px] tracking-tight leading-snug">
            {task.title}
          </p>
          <p className="text-gray-500 text-xs sm:text-[13px] mt-0.5">{task.time}</p>
        </div>
      </div>

      {/* Tag badge */}
      <span
        className={`text-[13px] font-semibold px-4 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer ${task.tagClass}`}
      >
        {task.tag}
      </span>
    </div>
  );
}

export default function UpcomingTasks() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div >
      <div
        className="bg-[#16162a] rounded-2xl p-4 sm:p-6 w-full shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-white text-lg sm:text-xl font-extrabold tracking-tight"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-12px)",
              transition: "opacity 0.5s ease 0.06s, transform 0.5s ease 0.06s",
            }}
          >
            Upcoming Tasks
          </h2>
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.6)",
              transition: "opacity 0.4s ease 0.15s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.15s",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4b5563"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        {/* Task cards */}
        <div className="flex flex-col gap-3">
          {tasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </div>
  );
}