export default function Input({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  rightIcon,
  onRightClick
}) {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm mb-2">{label}</label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}

        <input
          type={type}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 rounded-2xl
          bg-white/5 border border-white/10
          focus:outline-none focus:border-orange-500/50"
        />

        {rightIcon && (
          <button
            type="button"
            onClick={onRightClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
}