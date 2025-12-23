import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen" />;
  }

  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
}
