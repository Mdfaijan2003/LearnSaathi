export default function Card({ children }) {
  return (
    <div className="relative w-full max-w-md">

      <div className="absolute -inset-[2px] rounded-3xl
      bg-gradient-to-br from-orange-500/40 via-purple-500/20 to-blue-500/30
      blur-2xl opacity-60" />

      <div className="relative backdrop-blur-3xl
      bg-white/5 border border-white/10
      rounded-3xl p-10">
        {children}
      </div>

    </div>
  );
}