import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../hooks";
import { navItems } from "../routes";

export function PageNavigation() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <nav className="-mx-3 mt-4 flex max-w-[calc(100%+1.5rem)] gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:mt-5 sm:max-w-full sm:px-0">
      <div className="flex shrink-0 gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              className={`whitespace-nowrap rounded border px-2.5 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
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
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded border border-neutral-700 px-2.5 py-2 text-xs font-semibold text-neutral-300 transition hover:border-primary-500 hover:text-white sm:px-3 sm:text-sm"
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
