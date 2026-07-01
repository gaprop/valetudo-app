import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks";
import { appRoutes } from "../routes";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading...</p>;
  }

  if (!user) {
    return <Navigate replace to={appRoutes.login} state={{ from: location }} />;
  }

  return <Outlet />;
}
