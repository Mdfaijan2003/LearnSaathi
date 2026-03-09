import React from "react";
import { Heading, Text } from "../ui/Typography";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

const SocialProof = () => {
  const testimonials = [
    {
      quote: "The AI Learning Loop completely changed how I study. I don't panic before mock exams anymore because the roadmap tells me exactly what I need to do every single day.",
      name: "Alex Morgan",
      title: "Class XII Board Exams",
      avatarInitials: "AM",
    },
    {
      quote: "I used to spend 45 minutes just finding the right YouTube video. Now the system just hands me the exact 4-minute clip I need to fix my weak concepts.",
      name: "Priya Sharma",
      title: "JEE Mains Aspirant",
      avatarInitials: "PS",
    }
  ];

  return (
    <section className="bg-slate-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Trusted By Logos */}
        <div className="mb-24">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by students from top institutions
          </p>
          {/* Grayscale opacity lowers visual noise so it looks premium */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale select-none">
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800">IIT Bombay</span>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800">AIIMS Delhi</span>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800">NIT Trichy</span>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800">BITS Pilani</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <Badge className="mb-6 bg-white border-slate-200 text-slate-600">
            JOIN 500+ BETA STUDENTS
          </Badge>
          <Heading level={2} className="text-slate-900">
            Don't just take our word for it.
          </Heading>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <Card key={index} hover={true} className="flex flex-col h-full bg-white shadow-sm border-slate-200 p-8">
              
              {/* Quote */}
              <Text className="text-lg text-slate-700 font-medium leading-relaxed italic mb-8 flex-1">
                "{t.quote}"
              </Text>
              
              {/* Divider */}
              <div className="w-full h-px bg-slate-100 mb-6"></div>
              
              {/* User Info */}
              <div className="flex items-center space-x-4">
                {/* Faux Avatar */}
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {t.avatarInitials}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{t.title}</div>
                </div>
              </div>
              
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SocialProof;