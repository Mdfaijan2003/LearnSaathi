import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import FeaturesPage from "../pages/FeaturePage";
import AnimatedAuthPage from "../pages/AnimatedAuthPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/signin" element={<AnimatedAuthPage />} />
    </Routes>
  );
};

export default AppRoutes;