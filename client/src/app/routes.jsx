import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/pages/login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../features/dashboard/pages/Dashboard";
import DashboardLayout from "../Core/components/layout/dashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Protected Dashboard Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

    </Routes>
  );
}