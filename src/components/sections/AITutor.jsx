import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Heading, Text } from '../ui/Typography';
import { Badge } from '../ui/Badge';

const TutorMode = ({ title, desc }) => (
  <div className="flex items-start">
    <div className="mt-1 mr-3 text-slate-400">
      <MessageSquare size={18} />
    </div>
    <div>
      <Heading level={4} className="text-sm">{title}</Heading>
      <Text variant="body" className="mt-1">{desc}</Text>
    </div>
  </div>
);

const AITutor = () => {
  return (
    <section id="tutor" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content Area */}
        <div>
          <Heading level={2} className="mb-6">A tutor that speaks your language.</Heading>
          <Text variant="lead" className="mb-8">
            Standard content platforms give you one explanation. LearnSaathi adapts its teaching style to exactly how your brain works. Upload an image of a complex problem, type a question, or use voice input to get unstuck instantly.
          </Text>
          
          <div className="space-y-4">
            <TutorMode title="Logical & Exam-Focused" desc="Direct, step-by-step breakdowns optimized for writing standard exam answers." />
            <TutorMode title="Real-Life Analogy" desc="Translates abstract concepts into relatable, everyday scenarios to make them stick." />
            <TutorMode title="Child-Simple Explanation" desc="Strips away academic jargon entirely. Pure fundamental understanding." />
            <TutorMode title="Derivation Mode" desc="Line-by-line mathematical or logical proofs showing exactly how a formula is reached." />
          </div>
        </div>
        
        {/* Right Area: Visual Representation of the UI */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          {/* Mockup Window Header */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 flex justify-between items-center">
            <span>LearnSaathi AI Context Engine</span>
            <div className="flex space-x-2">
               <span className="w-3 h-3 rounded-full bg-slate-300"></span>
               <span className="w-3 h-3 rounded-full bg-slate-300"></span>
            </div>
          </div>
          
          {/* Mockup Chat Area */}
          <div className="p-6 flex-1 flex flex-col space-y-4">
            {/* User Message */}
            <div className="self-end bg-slate-900 text-white p-4 rounded-lg rounded-tr-none max-w-[80%]">
              <Text variant="body" className="text-slate-100">
                I keep failing test cases on this recursion problem. Can you explain the base case using an analogy?
              </Text>
            </div>
            
            {/* System Response */}
            <div className="self-start bg-slate-100 p-5 rounded-lg rounded-tl-none max-w-[90%] border border-slate-200">
              <Badge className="mb-3 bg-white border-slate-300">Analogy Mode Activated</Badge>
              
              <Text variant="body" className="text-slate-800">
                Think of recursion like standing in a line of people holding a stack of books, trying to find out how many books there are in total.
                <br/><br/>
                You don't count them all. You just take your books, ask the person behind you how many they have, and add yours to their total. 
                <br/><br/>
                The <strong>base case</strong> is the very last person in line. They look behind them, see no one is there, and just say, "I have 3 books." Without that last person (the base case), you'd be asking empty space forever!
              </Text>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default AITutor;