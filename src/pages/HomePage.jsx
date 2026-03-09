import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import Footer from "../components/layout/Footer";
import FloatingAITutor from "../components/ui/FloatingAITutor";
import PainPoints from "../components/sections/PainPoints";
import TheSolution from "../components/sections/TheSolution";
import Results from "../components/sections/Results";
import SocialProof from "../components/sections/SocialProof";
export const HomePage = () =>{
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main>
        <Hero />
        <FloatingAITutor />
        <PainPoints />
        <TheSolution />
        <Results />
        <SocialProof />
      </main>

      <Footer />
    </div>
  );
}