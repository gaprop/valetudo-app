import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components";
import { AuthProvider } from "./hooks";
import {
  LoginPage,
  RecipesPage,
  TrainingLogPage,
  WorkoutPlanPage,
} from "./pages";
import { appRoutes } from "./routes";
import "./styles.css";

function AppShell() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path={appRoutes.login} element={<LoginPage />} />
          <Route
            path="/"
            element={<Navigate replace to={appRoutes.trainingLog} />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path={appRoutes.trainingLog} element={<TrainingLogPage />} />
            <Route path={appRoutes.workoutPlan} element={<WorkoutPlanPage />} />
            <Route path={appRoutes.recipes} element={<RecipesPage />} />
          </Route>
          <Route
            path="*"
            element={<Navigate replace to={appRoutes.trainingLog} />}
          />
        </Routes>
      </div>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
