export const appRoutes = {
  login: "/login",
  trainingLog: "/training-log",
  workoutPlan: "/workout-plan",
  recipes: "/recipes",
  clock: "/clock",
} as const;

export const navItems = [
  { to: appRoutes.trainingLog, label: "Training log" },
  { to: appRoutes.workoutPlan, label: "Workout plan" },
  { to: appRoutes.recipes, label: "Recipes" },
  { to: appRoutes.clock, label: "Clock" },
];
