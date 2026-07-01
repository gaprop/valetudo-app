export const appRoutes = {
  login: "/login",
  trainingLog: "/training-log",
  workoutPlan: "/workout-plan",
  recipes: "/recipes",
} as const;

export const navItems = [
  { to: appRoutes.trainingLog, label: "Training log" },
  { to: appRoutes.workoutPlan, label: "Workout plan" },
  { to: appRoutes.recipes, label: "Recipes" },
];
