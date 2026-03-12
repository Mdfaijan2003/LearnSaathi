import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import FeaturesPage from "../pages/FeaturePage";
import AnimatedAuthPage from "../pages/AnimatedAuthPage";
import { HomePage } from "../pages/HomePage";
import NotesDashboard from "../pages/NotesDashboard";
import CareerExplorer from "../pages/CareerExplorer";
import ExerciseHubPage from "../pages/ExerciseHubPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/signin" element={<AnimatedAuthPage />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/Notes" element={<NotesDashboard />} />
      <Route path="/CareerExplorer" element={<CareerExplorer />} />
      <Route path="/Exercise" element={<ExerciseHubPage />} />
    </Routes>
  );
};

export default AppRoutes;