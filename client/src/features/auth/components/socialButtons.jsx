import { Chrome, Github, Apple } from "lucide-react";

export default function SocialButtons() {
  const buttons = [
    { icon: Chrome, label: "Continue with Google" },
    { icon: Github, label: "Continue with GitHub" },
    { icon: Apple, label: "Continue with Apple" }
  ];

  return (
    <div className="space-y-4 mb-6">
      {buttons.map((btn, index) => {
        const Icon = btn.icon;
        return (
          <button
            key={index}
            className="w-full flex items-center justify-center gap-3
            py-3 rounded-xl bg-white/5
            border border-white/10
            hover:border-white/20 transition-all"
          >
            <Icon className="w-5 h-5" />
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}