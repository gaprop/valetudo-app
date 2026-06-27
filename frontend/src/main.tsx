import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  addWorkoutSet,
  createWorkout,
  deleteWorkoutSet,
  errorMessage,
  listWorkouts,
} from "./api";
import { EntriesList, StatusSummary, TrainingForm } from "./components";
import type { SetForm, Workout, WorkoutForm } from "./types";
import "./styles.css";

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [form, setForm] = useState<WorkoutForm>({
    trainingDate: today,
    exerciseType: "bench",
  });
  const [setForms, setSetForms] = useState<Record<number, SetForm>>({});
  const [loading, setLoading] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);
  const [savingSetId, setSavingSetId] = useState<number | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<number | null>(null);
  const [openWorkoutId, setOpenWorkoutId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      setWorkouts(await listWorkouts());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWorkout(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setSavingEntry(true);
    setError("");

    try {
      const workout = await createWorkout({
        trainingDate: form.trainingDate,
        exerciseType: form.exerciseType,
      });

      await loadWorkouts();
      setOpenWorkoutId(workout.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingEntry(false);
    }
  }

  async function handleAddSet(
    event: React.FormEvent<HTMLFormElement>,
    workoutID: number
  ): Promise<void> {
    event.preventDefault();
    setSavingSetId(workoutID);
    setError("");

    try {
      await addWorkoutSet({
        workoutID,
        weight: Number(setForms[workoutID]?.weight),
        reps: Number(setForms[workoutID]?.reps),
      });

      setSetForms((current) => ({
        ...current,
        [workoutID]: { weight: "", reps: "" },
      }));
      await loadWorkouts();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingSetId(null);
    }
  }

  async function handleDeleteSet(
    workoutID: number,
    setID: number
  ): Promise<void> {
    setDeletingSetId(setID);
    setError("");

    try {
      await deleteWorkoutSet({ workoutID, setID });
      await loadWorkouts();
      setOpenWorkoutId(workoutID);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingSetId(null);
    }
  }

  function handleToggleWorkout(workoutID: number): void {
    setOpenWorkoutId((current) => (current === workoutID ? null : workoutID));
  }

  function handleSetFormChange(
    workoutID: number,
    field: keyof SetForm,
    value: string
  ): void {
    setSetForms((current) => ({
      ...current,
      [workoutID]: {
        weight: current[workoutID]?.weight || "",
        reps: current[workoutID]?.reps || "",
        [field]: value,
      },
    }));
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
            error={error}
            savingEntry={savingEntry}
            onChange={setForm}
            onSubmit={handleCreateWorkout}
          />
          <EntriesList
            workouts={workouts}
            loading={loading}
            setForms={setForms}
            savingSetId={savingSetId}
            deletingSetId={deletingSetId}
            openWorkoutId={openWorkoutId}
            onRefresh={loadWorkouts}
            onToggleWorkout={handleToggleWorkout}
            onSetFormChange={handleSetFormChange}
            onAddSet={handleAddSet}
            onDeleteSet={handleDeleteSet}
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
