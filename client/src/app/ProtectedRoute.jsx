import { Navigate } from "react-router-dom";
import { useAuth } from "../Core/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}