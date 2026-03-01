import { useState, useRef, useEffect } from "react";

const KEYFRAMES = `
  @keyframes ai-fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ai-pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(180,60,220,0.45); }
    50%       { box-shadow: 0 0 0 9px rgba(180,60,220,0); }
  }
  @keyframes ai-typingBounce {
    0%, 57%, 100% { transform: translateY(0) scale(1); opacity: 0.35; background: #9d3bbf; }
    28%            { transform: translateY(-8px) scale(1.2); opacity: 1; background: #dd6ef0; }
  }
  @keyframes ai-typingGlow {
    0%, 57%, 100% { box-shadow: 0 0 0px 0px rgba(201,79,216,0); }
    28%            { box-shadow: 0 0 10px 3px rgba(201,79,216,0.75); }
  }
  @keyframes ai-bubblePulse {
    0%, 100% { box-shadow: 0 2px 12px rgba(120,30,170,0.0); }
    50%       { box-shadow: 0 4px 22px rgba(120,30,170,0.3); }
  }
  .ai-fade-in    { animation: ai-fadeInUp 0.4s ease both; }
  .ai-pulse-glow { animation: ai-pulseGlow 3s ease-in-out infinite; }
  .ai-dot {
    animation: ai-typingBounce 1.3s ease-in-out infinite,
               ai-typingGlow   1.3s ease-in-out infinite;
  }
  .ai-typing-bubble { animation: ai-bubblePulse 2s ease-in-out infinite; }
`;

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4 ai-fade-in">
    {/* Avatar */}
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ai-pulse-glow"
      style={{ background: "linear-gradient(135deg, #c94fd8, #7c3aed)" }}>
      <BotIcon />
    </div>
    {/* Bubble */}
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-[18px] rounded-bl-[4px] ai-typing-bubble"
      style={{ background: "#221539", border: "1px solid rgba(201,79,216,0.18)" }}>
      <span className="ai-dot w-2 h-2 rounded-full inline-block" style={{ animationDelay: "0ms" }} />
      <span className="ai-dot w-2 h-2 rounded-full inline-block" style={{ animationDelay: "180ms" }} />
      <span className="ai-dot w-2 h-2 rounded-full inline-block" style={{ animationDelay: "360ms" }} />
    </div>
  </div>
);

const AIMessage = ({ text, isNew }) => (
  <div className={`flex items-end gap-2 mb-4 ${isNew ? "ai-fade-in" : ""}`}>
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #c94fd8, #7c3aed)" }}>
      <BotIcon />
    </div>
    <div className="max-w-[230px] px-4 py-3 text-[13px] leading-relaxed rounded-[18px] rounded-bl-[4px] whitespace-pre-line"
      style={{ background: "#221539", color: "#e8d5ff", border: "1px solid rgba(201,79,216,0.12)" }}>
      {text}
    </div>
  </div>
);

const UserMessage = ({ text, isNew }) => (
  <div className={`flex items-end justify-end gap-2 mb-4 ${isNew ? "ai-fade-in" : ""}`}>
    <div className="max-w-[230px] px-4 py-3 text-[13px] leading-relaxed rounded-[18px] rounded-br-[4px]"
      style={{ background: "#2a1d40", color: "#ddd0f0", border: "1px solid rgba(255,255,255,0.06)" }}>
      {text}
    </div>
    <div className="w-9 h-9 rounded-full flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }} />
  </div>
);

export default function AIStudyAssistants() {
  const [messages, setMessages] = useState([
    { id: 1, type: "ai", text: "Hi! I'm your AI tutor. I can help you understand concepts, solve doubts, and create study plans. What would you like to learn today?" },
    { id: 2, type: "user", text: "Explain integration by parts with an example" },
  ]);
  const [isTyping, setIsTyping] = useState(true);
  const [input, setInput] = useState("");
  const [newIds, setNewIds] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsTyping(false);
      const id = Date.now();
      setNewIds(p => new Set([...p, id]));
      setMessages(p => [...p, {
        id, type: "ai",
        text: "Integration by parts uses:\n∫u·dv = u·v − ∫v·du\n\nExample: ∫x·eˣ dx\n• u = x → du = dx\n• dv = eˣdx → v = eˣ\n\nResult: eˣ(x − 1) + C"
      }]);
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const uid = Date.now();
    setNewIds(p => new Set([...p, uid]));
    setMessages(p => [...p, { id: uid, type: "user", text: input }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aid = Date.now() + 1;
      setNewIds(p => new Set([...p, aid]));
      setMessages(p => [...p, { id: aid, type: "ai", text: "Great question! Let me break that down step by step for you." }]);
    }, 2500);
  };

  return (
    <div>
      <style>{KEYFRAMES}</style>

      {/* Card */}
      <div className="flex flex-col overflow-hidden relative"
        style={{
          width: 340, height: 620,
          borderRadius: 30,
          background: "linear-gradient(165deg, #1c1030 0%, #110920 55%, #0e071a 100%)",
          boxShadow: "0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
          fontFamily: "'DM Sans', sans-serif",
        }}>

        {/* Ambient glow overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          borderRadius: 30,
          background: "radial-gradient(ellipse 60% 30% at 70% 0%, rgba(180,60,220,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 20% at 20% 100%, rgba(120,40,200,0.08) 0%, transparent 70%)"
        }} />

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-[18px] flex-shrink-0 relative z-10"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-11 h-11 rounded-[15px] flex items-center justify-center flex-shrink-0 ai-pulse-glow"
            style={{ background: "linear-gradient(135deg, #c94fd8, #7c3aed)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#f0e6ff" }}>AI Study Assistant</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(232,213,255,0.4)" }}>Ask me anything!</p>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2 relative z-10" style={{ scrollbarWidth: "none" }}>
          {messages.map(msg =>
            msg.type === "ai"
              ? <AIMessage key={msg.id} text={msg.text} isNew={newIds.has(msg.id)} />
              : <UserMessage key={msg.id} text={msg.text} isNew={newIds.has(msg.id)} />
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className="flex items-center gap-2 px-3.5 pt-2.5 pb-5 flex-shrink-0 relative z-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Image btn */}
          <button className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(232,213,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>

          {/* Input field */}
          <input
            className="flex-1 rounded-[24px] px-4 py-2.5 text-[13px] outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e8d5ff",
              fontFamily: "inherit",
            }}
            placeholder="Ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            onFocus={e => {
              e.target.style.borderColor = "rgba(201,79,216,0.45)";
              e.target.style.background = "rgba(255,255,255,0.08)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.background = "rgba(255,255,255,0.05)";
            }}
          />

          {/* Mic btn */}
          <button className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(232,213,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          {/* Send btn */}
          <button
            onClick={sendMessage}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,0.45)", border: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}