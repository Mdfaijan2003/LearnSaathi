import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── Data ────────────────────────────────────────────────────────────────────

const EXERCISES = [
  {
    id: 1, num: "01",
    title: "Concept Check: Kinematics 101",
    subject: "Physics", type: "Concept Check", meta: "30 Qs",
    difficulty: "Medium", tag: "MCQ", cta: "Start Practice",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>),
    iconColor: "text-blue-600", iconBg: "bg-blue-50 border-blue-100", progress: 58,
  },
  {
    id: 2, num: "02",
    title: "Coding Problem: Array Manipulation",
    subject: "Python", type: "Coding Challenge", meta: "15 Test Cases",
    difficulty: "Hard", tag: "Code", cta: "Solve Challenge",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>),
    iconColor: "text-violet-600", iconBg: "bg-violet-50 border-violet-100", progress: 0,
  },
  {
    id: 3, num: "03",
    title: "Lab Simulation: Organic Chemistry",
    subject: "Chemistry", type: "Lab Simulation", meta: "5 Steps",
    difficulty: "Advanced", tag: "Interactive", cta: "Launch Simulation",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11l-4 7h14l-4-7V3"/></svg>),
    iconColor: "text-rose-600", iconBg: "bg-rose-50 border-rose-100", progress: 22,
  },
  {
    id: 4, num: "04",
    title: "Problem Set: Integration Techniques",
    subject: "Mathematics", type: "Problem Set", meta: "20 Problems",
    difficulty: "Medium", tag: "Short Answer", cta: "Start Practice",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>),
    iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-100", progress: 75,
  },
  {
    id: 5, num: "05",
    title: "Quick Quiz: Human Digestive System",
    subject: "Biology", type: "Quick Quiz", meta: "10 Qs",
    difficulty: "Beginner", tag: "True/False", cta: "Start Practice",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>),
    iconColor: "text-amber-600", iconBg: "bg-amber-50 border-amber-100", progress: 100,
  },
  {
    id: 6, num: "06",
    title: "Mock Test: JEE Advanced Physics",
    subject: "Physics", type: "Mock Test", meta: "45 Qs · 90 min",
    difficulty: "Advanced", tag: "Full Test", cta: "Begin Mock Test",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    iconColor: "text-slate-600", iconBg: "bg-slate-50 border-slate-200", progress: 0,
  },
];

const SUBJECTS    = ["All Subjects","Physics","Mathematics","Chemistry","Biology","Python"];
const DIFFICULTIES = ["Beginner","Intermediate","Advanced"];
const TYPES        = ["All Types","Concept Check","Problem Set","Coding Challenge","Lab Simulation","Quick Quiz","Mock Test"];

const DIFF_STYLES = {
  Beginner:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Medium:       "bg-amber-50 text-amber-700 border border-amber-200",
  Intermediate: "bg-sky-50 text-sky-700 border border-sky-200",
  Hard:         "bg-rose-50 text-rose-700 border border-rose-200",
  Advanced:     "bg-red-50 text-red-700 border border-red-200",
};

const TAG_STYLES = {
  MCQ:            "bg-blue-50 text-blue-600 border border-blue-100",
  Code:           "bg-violet-50 text-violet-600 border border-violet-100",
  Interactive:    "bg-rose-50 text-rose-600 border border-rose-100",
  "Short Answer": "bg-emerald-50 text-emerald-600 border border-emerald-100",
  "True/False":   "bg-amber-50 text-amber-600 border border-amber-100",
  "Full Test":    "bg-slate-100 text-slate-600 border border-slate-200",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  return (
    <div className="flex-1 px-8 py-5 border-r border-slate-200 last:border-r-0">
      <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
      <p className="text-slate-500 text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

function ProgressBar({ value }) {
  if (value === 0) return null;
  return (
    <div className="mt-2.5 flex items-center gap-2.5">
      <div className="flex-1 h-[3px] bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: value === 100
              ? "linear-gradient(90deg,#10b981,#059669)"
              : "linear-gradient(90deg,#2563eb,#7c3aed)",
            transition: "width 0.7s ease",
          }}
        />
      </div>
      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
        {value === 100 ? "✓ Done" : `${value}%`}
      </span>
    </div>
  );
}

function ExerciseRow({ ex, index, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white border rounded-2xl px-5 py-4 flex items-center gap-4 cursor-pointer overflow-hidden"
      style={{
        borderColor: hovered ? "#cbd5e1" : "#e2e8f0",
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.5s ease ${0.05 + index * 0.07}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.05 + index * 0.07}s, box-shadow 0.2s ease, border-color 0.2s ease`,
      }}
    >
      {/* Decorative number — absolute, right side */}
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[60px] font-black leading-none select-none pointer-events-none"
        style={{ color: hovered ? "rgba(15,23,42,0.045)" : "rgba(15,23,42,0.025)", transition: "color 0.3s" }}
      >
        {ex.num}
      </span>

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 ${ex.iconBg} ${ex.iconColor} ${hovered ? "scale-105" : ""}`}>
        {ex.icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 pr-6">
        <h3 className="text-slate-900 font-bold text-sm lg:text-[15px] tracking-tight leading-snug truncate">
          {ex.title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-slate-500 text-[12px] font-medium">{ex.subject}</span>
          <span className="text-slate-300 text-[12px]">•</span>
          <span className="text-slate-400 text-[12px]">{ex.meta}</span>
          <span className="text-slate-300 text-[12px]">•</span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${DIFF_STYLES[ex.difficulty]}`}>
            {ex.difficulty}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${TAG_STYLES[ex.tag]}`}>
            {ex.tag}
          </span>
        </div>
        <ProgressBar value={ex.progress} />
      </div>

      {/* CTA button — always visible, fixed width */}
      <button className="shrink-0 w-36 text-center px-4 py-2.5 rounded-xl text-[13px] font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-150 shadow-sm active:scale-95">
        {ex.cta}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExerciseHubPage() {
  const [visible, setVisible]     = useState(false);
  const [subject, setSubject]     = useState("All Subjects");
  const [search, setSearch]       = useState("");
  const [activeDiff, setActiveDiff] = useState([]);
  const [activeType, setActiveType] = useState("All Types");

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const toggleDiff = (d) =>
    setActiveDiff(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const filtered = EXERCISES.filter(ex => {
    if (subject !== "All Subjects" && ex.subject !== subject) return false;
    if (activeDiff.length > 0) {
      const map = { Beginner: ["Beginner"], Intermediate: ["Medium","Intermediate"], Advanced: ["Hard","Advanced"] };
      if (!activeDiff.flatMap(d => map[d] || []).includes(ex.difficulty)) return false;
    }
    if (activeType !== "All Types" && ex.type !== activeType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!ex.title.toLowerCase().includes(q) && !ex.subject.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <header
        className="relative bg-white border-b border-slate-200 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(226,232,240,0.6) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 0%,rgba(255,255,255,0.97) 35%,transparent 100%)" }}
        />
        <div
          className="relative w-full max-w-7xl mx-auto px-6 lg:px-10 pt-14 pb-12 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 border border-slate-200 bg-white px-4 py-1.5 rounded-full mb-5 shadow-sm">
            The Exercise Hub
          </span>
          <h1
            className="font-black tracking-tight text-slate-900 mb-4 leading-[1.05]"
            style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: "clamp(2.4rem,6vw,4.25rem)" }}
          >
            Practice. Master. Repeat.
          </h1>
          <p className="text-slate-500 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            A curated and adaptive environment to reinforce your concepts
            through targeted exercises and real-world problems.
          </p>

          {/* Filter bar */}
          <div
            className="flex flex-col sm:flex-row items-stretch max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-300 bg-white shadow-md"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
          >
            <div className="relative border-b sm:border-b-0 sm:border-r border-slate-200 sm:w-48 shrink-0">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full appearance-none pl-4 pr-8 py-3.5 text-sm text-slate-600 bg-transparent outline-none font-medium cursor-pointer"
              >
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div className="flex flex-1 items-center px-4 gap-2">
              <svg className="text-slate-400 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Exercise Type..."
                className="flex-1 py-3.5 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button className="px-7 py-3.5 bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shrink-0">
              Filter
            </button>
          </div>
        </div>
      </header>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div
        className="bg-white border-b border-slate-200"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.15s" }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex divide-x divide-slate-200">
            <StatCard value="6" label="Total Exercises" color="text-slate-900" />
            <StatCard value="3" label="In Progress"     color="text-blue-600"  />
            <StatCard value="1" label="Completed"       color="text-emerald-600" />
            <StatCard value="2" label="Not Started"     color="text-slate-400" />
          </div>
        </div>
      </div>

      {/* ── Main: sidebar + list ──────────────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Use CSS grid on lg so sidebar width is truly fixed and list gets the rest */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-start">

          {/* Sidebar */}
          <aside
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-16px)",
              transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
            }}
          >
            {/* Difficulty */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                Difficulty Level
              </p>
              <div className="flex flex-col gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDiff(d)}
                    className={`text-left w-full px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      activeDiff.includes(d)
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                Exercise Type
              </p>
              <div className="flex flex-col gap-0.5">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={`text-left w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeType === t
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Exercise list */}
          <div>
            {/* List header */}
            <div
              className="flex items-center justify-between mb-4"
              style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.22s" }}
            >
              <p className="text-slate-500 text-sm">
                Showing{" "}
                <span className="font-bold text-slate-900">{filtered.length}</span>
                {" "}exercise{filtered.length !== 1 && "s"}
                {subject !== "All Subjects" && (
                  <span> in <span className="font-semibold text-slate-800">{subject}</span></span>
                )}
              </p>
              <select className="text-xs font-medium text-slate-500 border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-400 transition-colors">
                <option>Sort: Recommended</option>
                <option>Sort: Difficulty ↑</option>
                <option>Sort: Difficulty ↓</option>
                <option>Sort: Progress</option>
              </select>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="text-center py-24 text-slate-400">
                  <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <p className="font-semibold text-slate-500">No exercises found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filtered.map((ex, i) => (
                  <ExerciseRow key={ex.id} ex={ex} index={i} visible={visible} />
                ))
              )}
            </div>

            {filtered.length > 0 && (
              <div
                className="mt-8 text-center"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.5s" }}
              >
                <button className="px-8 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all duration-200 hover:shadow-sm">
                  Load More Exercises
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}