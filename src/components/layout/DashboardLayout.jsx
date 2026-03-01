import Sidebar from "./Sidebar";

import WelcomeHeader from "../dashboard/WelcomeHeader";
import StudyPlanCard from "../dashboard/StudyPlanCard";
import WeakConceptsSection from "../dashboard/WeakConceptsSection";
import LearningHistory from "../dashboard/LearningHistory";

import StudyStreakCard from "../rightPanel/StudyStreakCard";
import AIStudyAssistants from "../rightPanel/AIStudyAssistant.jsx";
import UpcomingTasks from "../dashboard/UpcomingCard";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#0b1220] text-white">
      
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-white/5">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Main Content Grid */}
        <div className="grid gap-6">
          
          {/* Top Section */}
          <WelcomeHeader />

          {/* Study Cards */}
          <StudyPlanCard />
          <WeakConceptsSection />
          <LearningHistory />
          <UpcomingTasks />

          {/* Right Panel Components moved below */}
          <div className="grid gap-6 xl:grid-cols-2">
            <StudyStreakCard />
            <AIStudyAssistants />
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;