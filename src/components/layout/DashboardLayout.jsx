import React from 'react';
import { 
  Search, 
  BookOpen, 
  Code, 
  Terminal, 
  Cpu,
  ArrowRight,
  Target,
  FileText,
  MessageSquare
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      
      {/* Utility Navigation (Top Bar) */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-1.5 text-xs text-gray-600 flex justify-between items-center">
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-900">For Schools</a>
          <a href="#" className="hover:text-gray-900">Certifications</a>
        </div>
        <div>Trusted by 100,000+ students worldwide</div>
      </div>

      {/* Main Navigation */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-8">
          <div className="flex items-center font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-slate-800 rounded-sm mr-2 flex items-center justify-center text-white">
              <BookOpen size={14} />
            </div>
            EduPath
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-gray-900 flex items-center">Tutorials</a>
            <a href="#" className="hover:text-gray-900 flex items-center">Exercises</a>
            <a href="#" className="hover:text-gray-900 flex items-center">AI Tutor</a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</a>
          <button className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Start Learning
          </button>
        </div>
      </nav>

      {/* Hero Section - Search Centric (W3Schools style) */}
      <header className="bg-[#F9FAFB] border-b border-gray-200 py-20 px-6 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Learn to Code. <br className="md:hidden"/> Master the Concepts.
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          An adaptive learning platform that builds a personalized curriculum, detects your knowledge gaps, and provides smart notes for your exams.
        </p>
        
        {/* Massive Search Bar */}
        <div className="w-full max-w-3xl relative flex items-center">
          <Search size={24} className="absolute left-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search our tutorials, e.g. 'React Hooks', 'Java Interfaces'..." 
            className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
          />
          <button className="absolute right-2 bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition-colors">
            Search
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <span className="text-gray-500 mr-2 flex items-center">Popular:</span>
          <TopicPill icon={<Code size={14}/>} label="React" />
          <TopicPill icon={<Terminal size={14}/>} label="Java" />
          <TopicPill icon={<Cpu size={14}/>} label="Node.js" />
          <TopicPill icon={<Terminal size={14}/>} label="C++" />
        </div>
      </header>

      {/* Feature Grid - Structural and Clean */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12 border-b border-gray-200 pb-4 flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-900">Everything you need to master any topic</h2>
          <a href="#" className="text-blue-600 font-medium text-sm hover:underline flex items-center">
            View all features <ArrowRight size={16} className="ml-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Target size={24} className="text-blue-600" />}
            title="Adaptive Learning Paths"
            description="Tell us your goal, and we'll generate a dynamic curriculum that evolves as you learn. Skip what you know, focus on what you don't."
          />
          <FeatureCard 
            icon={<FileText size={24} className="text-gray-800" />}
            title="Smart Notes & Summaries"
            description="Automatically generate concise summaries, flashcards, and key takeaways from any module. Never manually take notes again."
          />
          <FeatureCard 
            icon={<MessageSquare size={24} className="text-emerald-600" />}
            title="24/7 Contextual AI Tutor"
            description="Stuck on a problem? Get instant, context-aware explanations that reference the exact code or theory you are currently studying."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#F9FAFB] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div>© 2026 EduPath AI Inc. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const TopicPill = ({ icon, label }) => (
  <a href="#" className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors">
    <span className="mr-1.5 text-gray-500">{icon}</span>
    {label}
  </a>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors bg-white">
    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;