import React from "react";
import { Heading, Text } from "../ui/Typography";
import { StructuredCard } from "../ui/Card";
import { Youtube, Target, CalendarX } from "lucide-react";

const PainPoints = () => {
 
  const painPoints = [
    {
      title: "The YouTube Binge",
      icon: <Youtube size={18} className="text-rose-600" />,
      content:
        "Wasting 45 minutes searching for the right explanation instead of actually practicing the topics.",
    },
    {
      title: "Zero Feedback Loop",
      icon: <Target size={18} className="text-rose-600" />,
      content:
        "Taking endless mock tests but never knowing the exact fundamental concepts you are failing at.",
    },
    {
      title: "No Revision System",
      icon: <CalendarX size={18} className="text-rose-600" />,
      content:
        "Forgetting 80% of what you studied in 2 weeks because you don't have a spaced repetition schedule.",
    },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          {/* Subtle Label / Badge */}
          <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-slate-500 uppercase bg-white border border-slate-200 rounded-full shadow-sm">
            The Reality Check
          </span>
          
          <Heading level={2} className="mb-6 text-slate-900">
            Why Most Students Never Improve.
          </Heading>
          
          <Text variant="lead" className="text-slate-600 text-lg leading-relaxed">
            You are putting in the hours, but your scores aren't moving. 
            <br className="hidden md:block" />
            It’s not a lack of intelligence—it’s a broken, fragmented system.
          </Text>
        </div>

        {/* The Cards Grid */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <StructuredCard
              key={index}
              title={point.title}
              description={point.content}
              hover={true}
              icon={point.icon}
              className="h-full" 
            />
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default PainPoints;