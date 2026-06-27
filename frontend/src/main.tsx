import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  EntriesList,
  StatusSummary,
  TrainingForm,
  WorkoutPlanPage,
} from "./components";
import type { WorkoutForm } from "./types";
import { useExercises } from "./useExercises";
import { useWorkouts } from "./useWorkouts";
import "./styles.css";

type Page = "log" | "plan";

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [page, setPage] = useState<Page>("log");
  const [form, setForm] = useState<WorkoutForm>({
    trainingDate: today,
    exerciseType: "bench",
  });
  const {
    exercises,
    loading: exerciseLoading,
    error: exerciseError,
    creating: creatingExercise,
    deletingValue: deletingExerciseValue,
    addExercise,
    removeExercise,
  } = useExercises();
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

  useEffect(() => {
    if (
      exercises.length > 0 &&
      !exercises.some((exercise) => exercise.value === form.exerciseType)
    ) {
      setForm((current) => ({
        ...current,
        exerciseType: exercises[0].value,
      }));
    }
  }, [exercises, form.exerciseType]);

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
              {page === "log" ? "Training log" : "Workout plan"}
            </h1>
          </div>
          {page === "log" && (
            <StatusSummary
              exercises={exercises}
              currentWorkout={currentPrevious}
            />
          )}
        </header>

        <nav className="flex gap-2">
          <button
            className={`rounded border px-3 py-2 text-sm font-semibold transition ${
              page === "log"
                ? "border-primary-700 bg-primary-950/60 text-primary-100"
                : "border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white"
            }`}
            type="button"
            onClick={() => setPage("log")}
          >
            Training log
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm font-semibold transition ${
              page === "plan"
                ? "border-primary-700 bg-primary-950/60 text-primary-100"
                : "border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white"
            }`}
            type="button"
            onClick={() => setPage("plan")}
          >
            Workout plan
          </button>
        </nav>

        {page === "log" ? (
          <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <TrainingForm
              form={form}
              exercises={exercises}
              error={formError}
              savingEntry={pending.savingEntry}
              onChange={setForm}
              onSubmit={handleCreateWorkout}
            />
            <EntriesList
              workouts={workouts}
              exercises={exercises}
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
        ) : (
          <WorkoutPlanPage
            exercises={exercises}
            exerciseLoading={exerciseLoading}
            exerciseError={exerciseError}
            creatingExercise={creatingExercise}
            deletingExerciseValue={deletingExerciseValue}
            onAddExercise={addExercise}
            onDeleteExercise={(value) => void removeExercise(value)}
          />
        )}
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
