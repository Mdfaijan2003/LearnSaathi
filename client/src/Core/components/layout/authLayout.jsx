import { Sparkles, Brain, Target, TrendingUp, Zap } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">

      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay 
      bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background Glows */}
      <div className="absolute top-[-250px] right-[-200px] w-[800px] h-[800px]
      bg-[radial-gradient(circle,_rgba(251,146,60,0.18)_0%,_transparent_65%)] blur-3xl" />

      <div className="absolute bottom-[-300px] left-[-200px] w-[900px] h-[900px]
      bg-[radial-gradient(circle,_rgba(59,130,246,0.15)_0%,_transparent_65%)] blur-3xl" />

      <div className="relative min-h-screen flex">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex lg:w-1/2 px-20 pt-12 pb-16 flex-col">

          {/* Logo + Heading */}
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-orange-400">
                  LearnAI
                </h2>
                <p className="text-xs text-gray-500">
                  AI Learning Platform
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-semibold leading-tight mb-6">
              Your AI-Powered <br />
              <span className="bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Exam Success Partner
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12">
              Join 50,000+ students who cracked JEE, NEET & other competitive exams with AI
            </p>

            {/* FEATURES */}
            <div className="space-y-6">
              <Feature
                icon={Brain}
                title="AI-Powered Learning"
                text="Personalized study plans powered by advanced AI"
                color="from-purple-500 to-pink-500"
              />
              <Feature
                icon={Target}
                title="Smart Practice"
                text="Adaptive questions targeting your weak areas"
                color="from-orange-500 to-amber-500"
              />
              <Feature
                icon={TrendingUp}
                title="Progress Analytics"
                text="Track your improvement with detailed insights"
                color="from-blue-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4 mt-16">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
              Trusted by Toppers
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Testimonial
                name="Aryan Sharma"
                exam="JEE Main 2025"
                rank="AIR 247"
                text="LearnAI helped me improve from 65% to 92% in 3 months!"
              />
              <Testimonial
                name="Priya Patel"
                exam="JEE Advanced 2025"
                rank="AIR 589"
                text="The AI tutor explained better than my coaching."
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex items-start justify-center pt-4 pb-16 px-8">
          {children}

          

        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text, color }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-400">{text}</p>
      </div>
    </div>
  );
}

function Testimonial({ name, exam, rank, text }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-gray-400">{exam}</p>
      <p className="text-xs text-orange-400 font-bold mb-2">{rank}</p>
      <p className="text-xs text-gray-400 italic">"{text}"</p>
    </div>
  );
}