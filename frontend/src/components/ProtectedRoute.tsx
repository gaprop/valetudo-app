import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks";
import { appRoutes } from "../routes";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <p className="rounded border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
          Checking login...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to={appRoutes.login} state={{ from: location }} />;
  }

  return <Outlet />;
}
