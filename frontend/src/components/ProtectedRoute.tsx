import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks";
import { appRoutes } from "../routes";

export function ProtectedRoute() {
  const { user, loading, refreshCurrentUser } = useAuth();
  const location = useLocation();
  const locationKey = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search]
  );
  const [checkedLocationKey, setCheckedLocationKey] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    setCheckedLocationKey(null);

    refreshCurrentUser().finally(() => {
      if (!cancelled) {
        setCheckedLocationKey(locationKey);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [locationKey, refreshCurrentUser]);

  if (loading || checkedLocationKey !== locationKey) {
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
