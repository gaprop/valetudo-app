import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/training-log", label: "Training log" },
  { to: "/workout-plan", label: "Workout plan" },
  { to: "/recipes", label: "Recipes" },
];

export function PageNavigation() {
  const location = useLocation();

  return (
    <nav className="mt-5 flex gap-2">
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
    </nav>
  );
}
