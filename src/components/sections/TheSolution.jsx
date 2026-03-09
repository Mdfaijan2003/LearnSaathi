import React from "react";
import {
  Book,
  Clock,
  Map,
  Pen,
  Radar,
  Zap,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
} from "lucide-react";
import { Heading, Text } from "../ui/Typography";
import { StructuredCard } from "../ui/Card";
import { Badge } from "../ui/Badge";

const TheSolution = () => {
  const solutions = [
    {
      title: "Plan",
      icon: <Map size={20} className="text-emerald-600" />,
      tag: "AI generates a dynamic day-by-day roadmap.",
    },
    {
      title: "Learn",
      icon: <Book size={20} className="text-blue-600" />,
      tag: "Smart notes and time-stamped video curation.",
    },
    {
      title: "Practice",
      icon: <Pen size={20} className="text-rose-600" />,
      tag: "PYQs that adapt to your real-time accuracy.",
    },
    {
      title: "Detect",
      icon: <Radar size={20} className="text-amber-600" />,
      tag: "AI finds the exact broken fundamental concept.",
    },
    {
      title: "Adapt",
      icon: <Zap size={20} className="text-slate-700" />,
      tag: "System inserts a 15-minute micro-revision fix.",
    },
    {
      title: "Revise",
      icon: <Clock size={20} className="text-yellow-600" />,
      tag: "Generate condensed cheat sheets before exams.",
    },
  ];

  // Maps the linear array into a circular UI on Desktop using flex/grid order
  const getOrderClass = (index) => {
    if (index === 3) return "order-4 md:order-6"; // Detect -> Bottom Right
    if (index === 4) return "order-5 md:order-5"; // Adapt -> Bottom Center
    if (index === 5) return "order-6 md:order-4"; // Revise -> Bottom Left
    return `order-${index + 1}`; // Plan, Learn, Practice stay Top Row
  };

  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <Badge className="mb-6 bg-slate-50 border-slate-200 text-slate-500">
            THE SOLUTION
          </Badge>

          <Heading level={2} className="mb-6 text-slate-900">
            The Complete AI Learning Loop.
          </Heading>

          <Text variant="lead" className="text-slate-600">
            Your entire study process, engineered into one continuous,
            <br className="hidden md:block" />
            self-improving system. Nothing falls through the cracks.
          </Text>
        </div>

        {/* The Circuit Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`relative flex ${getOrderClass(index)}`}
            >
              {/* The Card */}
              <StructuredCard
                title={solution.title}
                description={solution.tag}
                icon={solution.icon}
                hover={true}
                className="w-full relative z-20 border-slate-200 shadow-sm"
              >
                
                <div className="absolute -bottom-4 -right-2 text-8xl font-black text-slate-100 pointer-events-none select-none z-0">
                  0{index + 1}
                </div>
              </StructuredCard>

            
              {index < 5 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-400 md:hidden z-10 animate-pulse">
                  <ArrowDown size={24} />
                </div>
              )}

              <div className="hidden md:block absolute z-30 text-slate-400 animate-pulse">
                {index === 0 && (
                  <ArrowRight
                    size={28}
                    className="absolute top-1/2 -translate-y-1/2 -right-6 lg:-right-8"
                  />
                )}

                {index === 1 && (
                  <ArrowRight
                    size={28}
                    className="absolute top-1/2 -translate-y-1/2 -right-6 lg:-right-8"
                  />
                )}

                {index === 2 && (
                  <ArrowDown
                    size={28}
                    className="absolute -bottom-6 lg:-bottom-8 left-1/2 -translate-x-1/2"
                  />
                )}

                {index === 3 && (
                  <ArrowLeft
                    size={28}
                    className="absolute top-1/2 -translate-y-1/2 -left-6 lg:-left-8"
                  />
                )}

                {index === 4 && (
                  <ArrowLeft
                    size={28}
                    className="absolute top-1/2 -translate-y-1/2 -left-6 lg:-left-8"
                  />
                )}

                {index === 5 && (
                  <ArrowUp
                    size={28}
                    className="absolute -top-6 lg:-top-8 left-1/2 -translate-x-1/2"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheSolution;
