import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../hooks";
import { navItems } from "../routes";

export function PageNavigation() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <nav className="mt-5 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              className={`rounded border px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-primary-700 bg-primary-950/60 text-primary-100"
                  : "border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white"
              }`}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      {user && (
        <button
          aria-label="Logout"
          className="inline-flex items-center gap-2 rounded border border-neutral-700 px-3 py-2 text-sm font-semibold text-neutral-300 transition hover:border-primary-500 hover:text-white"
          onClick={() => void logout()}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      )}
    </nav>
  );
}
