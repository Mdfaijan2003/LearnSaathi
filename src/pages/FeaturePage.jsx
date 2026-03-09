import React from 'react';

import Footer from '../components/layout/Footer';
import { Heading, Text } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Target, BookOpen, Zap, MessageSquare, Clock, UploadCloud } from 'lucide-react';
import Navbar2 from '../components/layout/Navbar2';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar2 />
      
      {/* Page Header */}
      <header className="bg-white border-b border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Heading level={1} className="mb-4">Platform Features & Workflows</Heading>
          <Text variant="lead" className="max-w-3xl">
            Synapse is designed to replace your fragmented study tools. Explore how our integrated engines work together to plan, teach, assess, and revise.
          </Text>
        </div>
      </header>

      {/* Main Documentation Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row px-6 py-12 gap-12">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-1 pr-6 border-r border-slate-200">
            <Text className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 px-3">Core Engines</Text>
            <SidebarLink href="#learning-paths" icon={<Target size={16}/>} label="AI Learning Paths" active />
            <SidebarLink href="#unified-study" icon={<BookOpen size={16}/>} label="Unified Study UI" />
            <SidebarLink href="#gap-detector" icon={<Zap size={16}/>} label="Gap Detector" />
            <SidebarLink href="#ai-tutor" icon={<MessageSquare size={16}/>} label="Omni-Mode Tutor" />
            
            <Text className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 px-3 mt-8">Utility & Prep</Text>
            <SidebarLink href="#revision-mode" icon={<Clock size={16}/>} label="Pre-Exam Revision" />
            <SidebarLink href="#note-import" icon={<UploadCloud size={16}/>} label="Universal Import" />
          </div>
        </aside>

        {/* Feature Details Content */}
        <main className="flex-1 space-y-24 pb-24">
          
          {/* Feature 1 */}
          <section id="learning-paths" className="scroll-mt-24">
            <Badge className="mb-4">The Planning Engine</Badge>
            <Heading level={2} className="mb-4">Dynamic Learning Paths</Heading>
            <Text variant="body" className="mb-8">
              Forget static timetables. The AI Learning Path generator builds a day-by-day syllabus that adapts to your actual completion rate. If you miss a day, the system automatically recalculates your deadlines without overwhelming you.
            </Text>
            
            <Card className="bg-white">
              <Heading level={4} className="mb-4 text-slate-800 border-b border-slate-100 pb-2">How to use it:</Heading>
              <ol className="space-y-4 list-decimal list-inside text-sm text-slate-600">
                <li><strong className="text-slate-800">Set your target:</strong> Enter your final exam date and target syllabus (e.g., "CBSE Class 12 Physics").</li>
                <li><strong className="text-slate-800">Input your bandwidth:</strong> Tell the AI how many hours you can study on weekdays vs. weekends.</li>
                <li><strong className="text-slate-800">Take the diagnostic:</strong> Complete a quick 15-minute quiz so the AI knows your baseline.</li>
                <li><strong className="text-slate-800">Follow the dashboard:</strong> Log in daily to see your prioritized tasks. The "Up Next" module will always tell you exactly where to start.</li>
              </ol>
            </Card>
          </section>

          {/* Feature 2 */}
          <section id="unified-study" className="scroll-mt-24">
            <Badge className="mb-4">The Zero-Tab Promise</Badge>
            <Heading level={2} className="mb-4">Unified Study Interface</Heading>
            <Text variant="body" className="mb-8">
              We eliminate context switching. When you open a topic, you get the Smart Notes, the best time-stamped YouTube explanations, and relevant practice questions perfectly aligned on one screen.
            </Text>
            
            <div className="bg-slate-900 rounded-xl p-1 shadow-lg">
               {/* Faux UI Mockup of the split screen */}
               <div className="bg-slate-50 rounded-lg flex flex-col md:flex-row h-64 overflow-hidden border border-slate-700">
                 <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-200">
                   <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
                   <div className="space-y-2">
                     <div className="h-2 w-full bg-slate-200 rounded"></div>
                     <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                     <div className="h-2 w-4/6 bg-slate-200 rounded"></div>
                   </div>
                   <Text variant="caption" className="mt-6 text-slate-400 font-semibold">SMART NOTES</Text>
                 </div>
                 <div className="w-full md:w-64 bg-slate-100 p-4 flex flex-col justify-center items-center">
                    <div className="w-full aspect-video bg-slate-800 rounded flex items-center justify-center text-white mb-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center pl-1">▶</div>
                    </div>
                    <Text variant="caption" className="text-slate-500">Starts exactly at 4:12</Text>
                 </div>
               </div>
            </div>
          </section>

          {/* Feature 3 */}
          <section id="gap-detector" className="scroll-mt-24">
            <Badge className="mb-4">The Assessment Engine</Badge>
            <Heading level={2} className="mb-4">AI Concept Gap Detector</Heading>
            <Text variant="body" className="mb-8">
              Taking mock tests is useless if you don't know why you are failing. The Gap Detector analyzes your incorrect answers, traces them back to the root fundamental concept, and generates a micro-revision plan to fix it.
            </Text>

            <Card className="bg-slate-50 border-amber-200">
              <Heading level={4} className="mb-2 text-amber-800">Workflow Example:</Heading>
              <Text variant="body" className="mb-4">
                You get a complex Physics kinematics question wrong. 
                <br/><br/>
                Instead of just giving you the correct answer, the AI flags: <em>"You understand the kinematics formulas, but your vector resolution is fundamentally flawed."</em> It then inserts a 10-minute Vector Mathematics crash course into your immediate learning path before letting you continue.
              </Text>
            </Card>
          </section>

          {/* Feature 4 */}
          <section id="ai-tutor" className="scroll-mt-24">
            <Badge className="mb-4">The Core USP</Badge>
            <Heading level={2} className="mb-4">Omni-Mode AI Tutor</Heading>
            <Text variant="body" className="mb-8">
              A tutor that doesn't just give answers, but changes its teaching methodology based on your current cognitive block. Access it anywhere via text, voice, or image upload.
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TutorModeCard title="Exam-Focused Mode" desc="Formats answers exactly how board/university examiners want to see them (step-by-step, bulleted)." />
              <TutorModeCard title="Analogy Mode" desc="Replaces complex jargon with real-world comparisons (e.g., explaining CPU caches using a refrigerator)." />
              <TutorModeCard title="Child-Simple Mode" desc="Strips away all formulas and vocabulary to teach the raw, fundamental logic." />
              <TutorModeCard title="Derivation Mode" desc="Breaks down the strict mathematical or logical proof leading to a formula." />
            </div>
          </section>

          {/* Feature 5 */}
          <section id="revision-mode" className="scroll-mt-24">
            <Badge className="mb-4">The Final Mile</Badge>
            <Heading level={2} className="mb-4">Pre-Exam Revision Mode</Heading>
            <Text variant="body" className="mb-8">
              Designed for the panic of the last 48 hours. Activate Revision Mode to freeze your standard learning path and instantly generate a highly condensed, high-yield study dashboard.
            </Text>

             <Card className="bg-white">
              <Heading level={4} className="mb-4 text-slate-800 border-b border-slate-100 pb-2">What happens when activated:</Heading>
              <ul className="space-y-3 list-disc list-inside text-sm text-slate-600">
                <li>All pending standard modules are paused.</li>
                <li>A master sheet of <strong>all formulas</strong> relevant to the subject is generated.</li>
                <li>A custom quiz is created containing <strong>only the questions you previously got wrong</strong> over the last 3 months.</li>
                <li>AI predicts top 10 high-probability questions based on previous year trends.</li>
              </ul>
            </Card>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
};

// Sub-components specific to this page
const SidebarLink = ({ href, icon, label, active = false }) => (
  <a 
    href={href} 
    className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <span className={`mr-3 ${active ? 'text-slate-700' : 'text-slate-400'}`}>{icon}</span>
    {label}
  </a>
);

const TutorModeCard = ({ title, desc }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors">
    <Heading level={4} className="text-sm mb-2">{title}</Heading>
    <Text variant="body" className="text-xs">{desc}</Text>
  </div>
);

export default FeaturesPage;