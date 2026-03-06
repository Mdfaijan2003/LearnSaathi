import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import Footer from "../components/layout/Footer";
import FloatingAITutor from "../components/ui/FloatingAITutor";
export const HomePage = () =>{
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main>
        <Hero />
        {/* <Workflow />
        <AITutor /> */}
        {/* <Features /> */}
        <FloatingAITutor />
      </main>

      <Footer />
    </div>
  );
}