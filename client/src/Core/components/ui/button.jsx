export default function Button({ children }) {
  return (
    <button
      className="w-full py-4 rounded-2xl
      bg-gradient-to-r from-orange-500 to-amber-500
      font-semibold text-xl flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}