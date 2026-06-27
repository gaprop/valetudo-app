import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { EntriesList, StatusSummary, TrainingForm } from "./components";
import type { WorkoutForm } from "./types";
import { useWorkouts } from "./useWorkouts";
import "./styles.css";

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState<WorkoutForm>({
    trainingDate: today,
    exerciseType: "bench",
  });
  const {
    workouts,
    loading,
    pending,
    formError,
    entryErrors,
    openWorkoutId,
    load,
    createEntry,
    deleteEntry,
    addSet,
    updateSet,
    removeSet,
    toggleWorkout,
  } = useWorkouts();

  async function handleCreateWorkout(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    await createEntry(form);
  }

  const currentPrevious = useMemo(() => {
    return workouts.find(
      (workout) =>
        workout.exerciseType === form.exerciseType && workout.sets.length > 0
    );
  }, [form.exerciseType, workouts]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
              Fitness tracker
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Training log
            </h1>
          </div>
          <StatusSummary currentWorkout={currentPrevious} />
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <TrainingForm
            form={form}
            error={formError}
            savingEntry={pending.savingEntry}
            onChange={setForm}
            onSubmit={handleCreateWorkout}
          />
          <EntriesList
            workouts={workouts}
            loading={loading}
            pending={pending}
            entryErrors={entryErrors}
            openWorkoutId={openWorkoutId}
            onRefresh={load}
            onToggleWorkout={toggleWorkout}
            onAddSet={addSet}
            onUpdateSet={updateSet}
            onDeleteWorkout={deleteEntry}
            onDeleteSet={removeSet}
          />
        </section>
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
    <App />
  </React.StrictMode>
);
