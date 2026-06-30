import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  RecipesRoutePage,
  TrainingLogPage,
  WorkoutPlanPage,
} from "./pages";
import "./styles.css";

function AppShell() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate replace to="/training-log" />} />
          <Route path="/training-log" element={<TrainingLogPage />} />
          <Route path="/workout-plan" element={<WorkoutPlanPage />} />
          <Route path="/recipes" element={<RecipesRoutePage />} />
          <Route path="*" element={<Navigate replace to="/training-log" />} />
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
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>
);
