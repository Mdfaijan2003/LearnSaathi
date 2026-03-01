export default function AuthCard({ children }) {
  return (
    <div className="relative w-full max-w-[480px]">

      <div className="absolute -inset-[2px] rounded-[36px]
      bg-gradient-to-br from-orange-500/30 via-purple-500/20 to-blue-500/30
      blur-xl opacity-60" />

      <div className="relative backdrop-blur-3xl bg-[rgba(255,255,255,0.04)]
      border border-white/10 rounded-[36px] p-12">
        {children}
      </div>
    </div>
  );
}