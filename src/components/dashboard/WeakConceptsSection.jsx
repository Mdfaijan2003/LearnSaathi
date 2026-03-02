// import { useState, useEffect } from "react";

// const concepts = [
//   {
//     id: 1,
//     title: "Calculus - Integration by Parts",
//     accuracy: 45,
//     accuracyColor: "#e05555",
//     accuracyBg: "rgba(224, 85, 85, 0.18)",
//     difficulty: "Medium",
//     barColor: "#ffffff",
//     delay: 0.15,
//   },
//   {
//     id: 2,
//     title: "Physics - Rotational Motion",
//     accuracy: 62,
//     accuracyColor: "#c8922a",
//     accuracyBg: "rgba(200, 146, 42, 0.18)",
//     difficulty: "Hard",
//     barColor: "#c8922a",
//     delay: 0.28,
//   },
// ];

// function AnimatedBar({ target, color, started }) {
//   const [width, setWidth] = useState(0);

//   useEffect(() => {
//     if (!started) return;
//     const timeout = setTimeout(() => setWidth(target), 80);
//     return () => clearTimeout(timeout);
//   }, [started, target]);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "6px",
//         background: "rgba(255,255,255,0.1)",
//         borderRadius: "4px",
//         overflow: "hidden",
//         margin: "12px 0 10px",
//       }}
//     >
//       <div
//         style={{
//           height: "100%",
//           width: `${width}%`,
//           background: color,
//           borderRadius: "4px",
//           transition: "width 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
//           boxShadow: `0 0 8px ${color}88`,
//         }}
//       />
//     </div>
//   );
// }

// function ConceptCard({ item, visible }) {
//   const [hovered, setHovered] = useState(false);
//   const [btnHovered, setBtnHovered] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         background: hovered
//           ? "rgba(255,255,255,0.05)"
//           : "rgba(255,255,255,0.03)",
//         border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
//         borderRadius: "12px",
//         padding: "18px 20px 16px",
//         cursor: "pointer",
//         opacity: visible ? 1 : 0,
//         transform: visible
//           ? hovered
//             ? "scale(1.02)"
//             : "scale(1)"
//           : "translateY(24px) scale(0.98)",
//         transition: `opacity 0.6s ease ${item.delay}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease`,
//         boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.35)" : "none",
//       }}
//     >
//       {/* Top row */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <p
//           style={{
//             color: "#f0f0f5",
//             fontWeight: 700,
//             fontSize: "15px",
//             letterSpacing: "0.01em",
//           }}
//         >
//           {item.title}
//         </p>
//         <span
//           style={{
//             background: item.accuracyBg,
//             color: item.accuracyColor,
//             border: `1px solid ${item.accuracyColor}55`,
//             borderRadius: "6px",
//             padding: "3px 10px",
//             fontSize: "12.5px",
//             fontWeight: 600,
//             whiteSpace: "nowrap",
//           }}
//         >
//           {item.accuracy}% Accuracy
//         </span>
//       </div>

//       {/* Progress bar */}
//       <AnimatedBar
//         target={item.accuracy}
//         color={item.barColor}
//         started={visible}
//       />

//       {/* Bottom row */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <p style={{ color: "#6b7280", fontSize: "13px" }}>
//           Difficulty: {item.difficulty}
//         </p>
//         <button
//           onMouseEnter={() => setBtnHovered(true)}
//           onMouseLeave={() => setBtnHovered(false)}
//           style={{
//             background: btnHovered
//               ? "linear-gradient(135deg, #d4781e, #b85e10)"
//               : "linear-gradient(135deg, #c8691a, #a0520e)",
//             color: "#fff",
//             border: "none",
//             borderRadius: "8px",
//             padding: "6px 16px",
//             fontSize: "13px",
//             fontWeight: 600,
//             cursor: "pointer",
//             transform: btnHovered ? "scale(1.06)" : "scale(1)",
//             transition:
//               "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease",
//             boxShadow: btnHovered ? "0 4px 16px rgba(200,105,26,0.4)" : "none",
//           }}
//         >
//           Practice Now
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function WeakConcepts() {
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setVisible(true), 120);
//     return () => clearTimeout(t);
//   }, []);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#0e0e16",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//       }}
//     >
//       <div
//         style={{
//           background: "linear-gradient(160deg, #1b1b28, #141420)",
//           borderRadius: "20px",
//           padding: "26px 26px 22px",
//           width: "600px",
//           boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
//           opacity: visible ? 1 : 0,
//           transform: visible ? "translateY(0)" : "translateY(20px)",
//           transition:
//             "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: "22px",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//             {/* Warning icon */}
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
//                 fill="rgba(220,60,60,0.2)"
//                 stroke="#dc3c3c"
//                 strokeWidth="1.8"
//                 strokeLinejoin="round"
//               />
//               <line
//                 x1="12"
//                 y1="9"
//                 x2="12"
//                 y2="13"
//                 stroke="#dc3c3c"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//               />
//               <circle cx="12" cy="17" r="1" fill="#dc3c3c" />
//             </svg>
//             <h2
//               style={{
//                 color: "#ffffff",
//                 fontSize: "19px",
//                 fontWeight: 800,
//                 letterSpacing: "-0.01em",
//                 opacity: visible ? 1 : 0,
//                 transform: visible ? "translateX(0)" : "translateX(-10px)",
//                 transition:
//                   "opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s",
//               }}
//             >
//               AI-Detected Weak Concepts
//             </h2>
//           </div>

//           {/* Needs Attention badge */}
//           <span
//             style={{
//               background: "rgba(180, 40, 40, 0.2)",
//               color: "#e05555",
//               border: "1px solid rgba(180,40,40,0.35)",
//               borderRadius: "8px",
//               padding: "5px 14px",
//               fontSize: "13px",
//               fontWeight: 600,
//               opacity: visible ? 1 : 0,
//               transform: visible ? "scale(1)" : "scale(0.8)",
//               transition:
//                 "opacity 0.45s ease 0.12s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.12s",
//             }}
//           >
//             Needs Attention
//           </span>
//         </div>

//         {/* Cards */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
//           {concepts.map((item) => (
//             <ConceptCard key={item.id} item={item} visible={visible} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";

const concepts = [
  {
    id: 1,
    title: "Calculus - Integration by Parts",
    accuracy: 45,
    difficulty: "Medium",
    delayMs: 150,
  },
  {
    id: 2,
    title: "Physics - Rotational Motion",
    accuracy: 62,
    difficulty: "Hard",
    delayMs: 300,
  },
];

function AnimatedBar({ target, isCalc, started }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setWidth(target), 100);
    return () => clearTimeout(t);
  }, [started, target]);

  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden my-3">
      <div
        className={`h-full rounded-full transition-all duration-[1100ms] ease-out ${
          isCalc
            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        }`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function ConceptCard({ item, visible }) {
  const isCalc = item.id === 1;

  return (
    <div
      className="rounded-xl p-4 sm:p-5 border cursor-pointer transition-all duration-500 ease-out hover:scale-[1.01] sm:hover:scale-[1.02] hover:bg-white/5 hover:border-white/10 hover:shadow-xl bg-white/[0.03] border-white/[0.07]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${item.delayMs}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${item.delayMs}ms, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <p className="text-white font-bold text-sm sm:text-[15px] tracking-tight">
          {item.title}
        </p>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap border ${
            isCalc
              ? "text-red-400 bg-red-500/15 border-red-500/30"
              : "text-amber-400 bg-amber-500/15 border-amber-500/30"
          }`}
        >
          {item.accuracy}% Accuracy
        </span>
      </div>

      {/* Animated progress bar */}
      <AnimatedBar target={item.accuracy} isCalc={isCalc} started={visible} />

      {/* Bottom row */}
      <div className="flex  flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-500 text-xs sm:text-[13px]">
          Difficulty: {item.difficulty}
        </p>
        <button className="w-full sm:w-auto bg-gradient-to-r from-orange-800 to-orange-900 hover:from-orange-700 hover:to-orange-800 text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-[0_4px_16px_rgba(194,65,12,0.5)] active:scale-95">
          Practice Now
        </button>
      </div>
    </div>
  );
}

export default function WeakConcepts() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    
      <div>
        <div
          className="bg-gradient-to-br from-[#1b1b28] to-[#141420] rounded-2xl p-4 sm:p-6 w-full shadow-[0_24px_64px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
            {/* Left: icon + title */}
            <div className="flex items-center gap-2.5">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  fill="rgba(220,60,60,0.2)"
                  stroke="#dc3c3c"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="9"
                  x2="12"
                  y2="13"
                  stroke="#dc3c3c"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="#dc3c3c" />
              </svg>
              <h2
                className="text-white text-base sm:text-[19px] font-extrabold tracking-tight transition-all duration-500 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-12px)",
                  transitionDelay: "80ms",
                }}
              >
                AI-Detected Weak Concepts
              </h2>
            </div>

            {/* Needs Attention badge */}
            <span
              className="text-red-400 bg-red-500/15 border border-red-500/30 text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.75)",
                transitionDelay: "120ms",
              }}
            >
              Needs Attention
            </span>
          </div>

          {/* Concept cards */}
          <div className="flex flex-col gap-3.5">
            {concepts.map((item) => (
              <ConceptCard key={item.id} item={item} visible={visible} />
            ))}
          </div>
        </div>
      </div>
  );
}
