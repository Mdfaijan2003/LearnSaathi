import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Workflow from '../components/sections/Workflow';
import AITutor from '../components/sections/AITutor';
// import Features from '../components/sections/Feature';


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main>
        <Hero />
        <Workflow />
        <AITutor />
        {/* <Features /> */}
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;