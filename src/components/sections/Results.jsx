import React from "react";
import { TrendingUp, Timer, Target } from "lucide-react";
import { Heading, Text } from "../ui/Typography";

const Results = () => {
  const stats = [
    {
      icon: <TrendingUp size={24} className="text-emerald-400" />,
      number: "+27%",
      label: "Average Score Increase",
      desc: "Students strictly following the AI roadmap saw consistent growth within 30 days.",
    },
    {
      icon: <Timer size={24} className="text-blue-400" />,
      number: "3x",
      label: "Faster Revision",
      desc: "Using auto-generated cheat sheets instead of manual, unstructured note-taking.",
    },
    {
      icon: <Target size={24} className="text-rose-400" />,
      number: "42%",
      label: "Fewer Careless Errors",
      desc: "The Gap Detector catches and fixes fundamental flaws before they cost you marks.",
    },
  ];

  return (
    <section className="bg-slate-900 py-24 border-y border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          {/* Dark Mode Badge */}
          <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-slate-400 uppercase bg-slate-800 border border-slate-700 rounded-full shadow-sm">
            The Data
          </span>
          
          <Heading level={2} className="mb-6 text-white">
            Students Using Structured AI Improve Faster.
          </Heading>
          
          <Text variant="lead" className="text-slate-400">
            Based on performance data from our initial beta cohort of 500+ committed learners.
          </Text>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center md:items-start text-center md:text-left">
              
              {/* Icon Container */}
              <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center mb-6 shadow-inner">
                {stat.icon}
              </div>
              
              {/* Massive Number */}
              <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                {stat.number}
              </div>
              
              {/* Label & Description */}
              <h3 className="text-lg font-bold text-slate-200 mb-3">
                {stat.label}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                {stat.desc}
              </p>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Results;