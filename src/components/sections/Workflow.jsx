import React from 'react';
import { Target, BookOpen, PenTool, Zap } from 'lucide-react';
import { Heading, Text } from '../ui/Typography';

const workflowData = [
  {
    number: "01",
    icon: <Target />,
    title: "Plan & Structure",
    desc: "Input your goal and timeline. The AI generates a dynamic, day-by-day roadmap that automatically adjusts if you fall behind or move ahead."
  },
  {
    number: "02",
    icon: <BookOpen />,
    title: "Learn & Consume",
    desc: "Access structured smart notes alongside auto-curated, time-stamped YouTube reference videos. Never switch tabs to search for explanations."
  },
  {
    number: "03",
    icon: <PenTool />,
    title: "Practice & Adapt",
    desc: "Tackle PYQs and predicted questions. The Adaptive Exercise Engine instantly scales difficulty based on your real-time accuracy."
  },
  {
    number: "04",
    icon: <Zap />,
    title: "Detect & Revise",
    desc: "The Concept Gap Detector analyzes test errors, isolates weak foundations, and builds a 30-minute targeted crash plan to fix them."
  }
];

const WorkflowStep = ({ number, icon, title, desc }) => (
  <div className="relative group">
    {/* Decorative Background Number */}
    <div className="text-5xl font-extrabold text-slate-100 absolute -top-6 -left-2 -z-10 group-hover:text-slate-200 transition-colors">
      {number}
    </div>
    
    <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-700 rounded-md flex items-center justify-center mb-4">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    
    <Heading level={3} className="mb-2">{title}</Heading>
    <Text variant="body">{desc}</Text>
  </div>
);

const Workflow = () => {
  return (
    <section id="workflow" className="border-t border-slate-200 bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Heading level={2} className="mb-12 text-center">The Complete Learning Loop</Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {workflowData.map((step, index) => (
            <WorkflowStep key={index} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;