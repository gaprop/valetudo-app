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
import { useWorkoutPlan } from "./useWorkoutPlan";
import { useWorkouts } from "./useWorkouts";
import { labelFor } from "./workouts";
import "./styles.css";

type Page = "log" | "plan";

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [page, setPage] = useState<Page>("log");
  const [form, setForm] = useState<WorkoutForm>({
    trainingDate: today,
    exerciseType: "bench",
  });
  const [selectedPlanDayId, setSelectedPlanDayId] = useState<number | null>(
    null
  );
  const [nextPlanIndexByDay, setNextPlanIndexByDay] = useState<
    Record<string, number>
  >({});
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
  const workoutPlan = useWorkoutPlan();

  const selectedPlanDay = useMemo(() => {
    return (
      workoutPlan.days.find((day) => day.id === selectedPlanDayId) ||
      workoutPlan.days[0] ||
      null
    );
  }, [selectedPlanDayId, workoutPlan.days]);

  const selectedDateWorkouts = useMemo(() => {
    return workouts.filter(
      (workout) => workout.trainingDate === form.trainingDate
    );
  }, [form.trainingDate, workouts]);

  const nextPlanKey = selectedPlanDay
    ? `${selectedPlanDay.id}:${form.trainingDate}`
    : "";

  const nextPlanExerciseType = useMemo(() => {
    if (!selectedPlanDay) {
      return null;
    }

    const nextIndex = nextPlanIndexByDay[nextPlanKey] || 0;
    return selectedPlanDay.items[nextIndex]?.exerciseType || null;
  }, [nextPlanIndexByDay, nextPlanKey, selectedPlanDay]);

  useEffect(() => {
    if (
      workoutPlan.days.length > 0 &&
      !workoutPlan.days.some((day) => day.id === selectedPlanDayId)
    ) {
      setSelectedPlanDayId(workoutPlan.days[0].id);
    }
  }, [selectedPlanDayId, workoutPlan.days]);

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

  async function handleAddNextPlanWorkout(): Promise<void> {
    if (!nextPlanExerciseType) {
      return;
    }

    const created = await createEntry({
      trainingDate: form.trainingDate,
      exerciseType: nextPlanExerciseType,
    });
    if (created && selectedPlanDay) {
      setNextPlanIndexByDay((current) => ({
        ...current,
        [nextPlanKey]: (current[nextPlanKey] || 0) + 1,
      }));
    }
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
              planDays={workoutPlan.days}
              selectedPlanDayId={selectedPlanDay?.id ?? null}
              error={formError}
              savingEntry={pending.savingEntry}
              onChange={setForm}
              onPlanDayChange={setSelectedPlanDayId}
              onSubmit={handleCreateWorkout}
            />
            <EntriesList
              workouts={selectedDateWorkouts}
              exercises={exercises}
              loading={loading}
              selectedDate={form.trainingDate}
              nextPlanExerciseLabel={
                nextPlanExerciseType
                  ? labelFor(exercises, nextPlanExerciseType)
                  : null
              }
              selectedPlanDayName={selectedPlanDay?.name || null}
              pending={pending}
              entryErrors={entryErrors}
              openWorkoutId={openWorkoutId}
              onRefresh={load}
              onAddNextPlanWorkout={() => void handleAddNextPlanWorkout()}
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
            days={workoutPlan.days}
            loading={workoutPlan.loading}
            pending={workoutPlan.pending}
            error={workoutPlan.error}
            exerciseLoading={exerciseLoading}
            exerciseError={exerciseError}
            creatingExercise={creatingExercise}
            deletingExerciseValue={deletingExerciseValue}
            onRefresh={workoutPlan.load}
            onAddDay={workoutPlan.addDay}
            onDeleteDay={(dayID) => void workoutPlan.removeDay(dayID)}
            onAddItem={workoutPlan.addItem}
            onDeleteItem={(dayID, itemID) =>
              void workoutPlan.removeItem(dayID, itemID)
            }
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
