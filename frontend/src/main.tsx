import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const api = axios.create({ baseURL: API_URL });

type ExerciseType = "bench" | "dumbell-shoulder" | "dips";

type ExerciseOption = {
  value: ExerciseType;
  label: string;
};

type WorkoutSet = {
  id: number;
  setNumber: number;
  weight: number;
  createdAt: string;
};

type Workout = {
  id: number;
  trainingDate: string;
  exerciseType: ExerciseType;
  sets: WorkoutSet[];
  createdAt: string;
};

type ApiError = { error: string };

type WorkoutForm = {
  trainingDate: string;
  exerciseType: ExerciseType;
};

const exerciseTypes = [
  { value: "bench", label: "Bench" },
  { value: "dumbell-shoulder", label: "Dumbell shoulder" },
  { value: "dips", label: "Dips" },
] satisfies ExerciseOption[];

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [form, setForm] = useState<WorkoutForm>({
    trainingDate: today,
    exerciseType: "bench",
  });
  const [setWeights, setSetWeights] = useState<Record<number, string>>({});
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
      const response = await api.get<Workout[]>("/api/workouts");
      setWorkouts(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function createWorkout(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setSavingEntry(true);
    setError("");

    try {
      const response = await api.post<Workout>("/api/workouts", {
          trainingDate: form.trainingDate,
          exerciseType: form.exerciseType,
      });

      await loadWorkouts();
      setOpenWorkoutId(response.data.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingEntry(false);
    }
  }

  async function addSet(
    event: React.FormEvent<HTMLFormElement>,
    workoutID: number
  ): Promise<void> {
    event.preventDefault();
    setSavingSetId(workoutID);
    setError("");

    try {
      await api.post<WorkoutSet>(`/api/workouts/${workoutID}/sets`, {
          weight: Number(setWeights[workoutID]),
      });

      setSetWeights((current) => ({ ...current, [workoutID]: "" }));
      await loadWorkouts();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingSetId(null);
    }
  }

  async function deleteSet(workoutID: number, setID: number): Promise<void> {
    setDeletingSetId(setID);
    setError("");

    try {
      await api.delete(`/api/workouts/${workoutID}/sets/${setID}`);

      await loadWorkouts();
      setOpenWorkoutId(workoutID);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingSetId(null);
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
              Training log
            </h1>
          </div>
          <div className="rounded border border-primary-800 bg-primary-950/50 px-4 py-3 text-sm text-primary-100">
            {currentPrevious ? (
              <span>
                Latest {labelFor(currentPrevious.exerciseType)}:{" "}
                <strong>{currentPrevious.sets.length} sets</strong>, best at{" "}
                <strong>{formatWeight(maxWeight(currentPrevious.sets))}</strong>
              </span>
            ) : (
              <span>No sets logged for this training type yet.</span>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <form
            onSubmit={createWorkout}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-2xl shadow-black/30"
          >
            <h2 className="text-lg font-semibold text-white">Add training</h2>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-neutral-300">
                Date
                <input
                  className="input"
                  type="date"
                  value={form.trainingDate}
                  onChange={(event) =>
                    setForm({ ...form, trainingDate: event.target.value })
                  }
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-neutral-300">
                Training type
                <select
                  className="input"
                  value={form.exerciseType}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      exerciseType: event.target.value as ExerciseType,
                    })
                  }
                >
                  {exerciseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
                {error}
              </p>
            )}

            <button
              className="mt-5 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
              type="submit"
              disabled={savingEntry}
            >
              {savingEntry ? "Creating..." : "Create training"}
            </button>
          </form>

          <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Entries</h2>
              <button
                className="rounded border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition hover:border-primary-500 hover:text-white"
                onClick={loadWorkouts}
                type="button"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-sm text-neutral-400">
                Loading entries...
              </p>
            ) : workouts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-400">
                No training entries yet.
              </p>
            ) : (
              <div className="divide-y divide-neutral-800">
                {workouts.map((workout) => (
                  <article
                    key={workout.id}
                    className="bg-neutral-900"
                  >
                    <button
                      className="grid w-full cursor-pointer gap-3 border-l-4 border-transparent bg-neutral-800/40 px-5 py-4 text-left transition hover:border-primary-600 hover:bg-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-700 sm:grid-cols-[1fr_auto_auto]"
                      type="button"
                      aria-expanded={openWorkoutId === workout.id}
                      onClick={() =>
                        setOpenWorkoutId((current) =>
                          current === workout.id ? null : workout.id
                        )
                      }
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-semibold text-white">
                          {labelFor(workout.exerciseType)}
                        </span>
                        <span className="mt-1 block text-sm text-neutral-400">
                          {workout.trainingDate}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-sm text-neutral-300 sm:justify-end">
                        <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
                          {workout.sets.length}{" "}
                          {workout.sets.length === 1 ? "set" : "sets"}
                        </span>
                        <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
                          Best {formatWeight(maxWeight(workout.sets))}
                        </span>
                      </span>
                      <span className="flex h-9 min-w-24 items-center justify-center rounded border border-primary-800 bg-primary-950/60 px-3 text-sm font-semibold text-primary-100 sm:justify-self-end">
                        {openWorkoutId === workout.id ? "Close" : "Open"}
                      </span>
                    </button>

                    {openWorkoutId === workout.id && (
                      <div className="grid gap-5 border-t border-neutral-800 bg-neutral-950/50 px-5 py-5">
                        <div>
                          {workout.sets.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                              No sets added yet.
                            </p>
                          ) : (
                            <div className="grid gap-2">
                              {workout.sets.map((set) => (
                                <div
                                  className="flex items-center justify-between gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3"
                                  key={set.id}
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                                      Set {set.setNumber}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-white">
                                      {formatWeight(set.weight)}
                                    </p>
                                  </div>
                                  <button
                                    className="shrink-0 rounded border border-neutral-700 px-2 py-1 text-xs font-semibold text-neutral-300 transition hover:border-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    type="button"
                                    onClick={() => deleteSet(workout.id, set.id)}
                                    disabled={deletingSetId === set.id}
                                  >
                                    {deletingSetId === set.id ? "Removing" : "Remove"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <form
                          className="flex max-w-sm items-end gap-3"
                          onSubmit={(event) => addSet(event, workout.id)}
                        >
                          <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium text-neutral-300">
                            Weight
                            <input
                              className="input"
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="kg"
                              value={setWeights[workout.id] || ""}
                              onChange={(event) =>
                                setSetWeights({
                                  ...setWeights,
                                  [workout.id]: event.target.value,
                                })
                              }
                              required
                            />
                          </label>
                          <button
                            className="h-[46px] rounded bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
                            type="submit"
                            disabled={savingSetId === workout.id}
                          >
                            {savingSetId === workout.id ? "Adding..." : "Add set"}
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function labelFor(value: ExerciseType): string {
  return exerciseTypes.find((type) => type.value === value)?.label || value;
}

function formatWeight(value: number | null): string {
  if (value == null) {
    return "-";
  }

  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} kg`;
}

function maxWeight(sets: WorkoutSet[]): number | null {
  if (sets.length === 0) {
    return null;
  }

  return Math.max(...sets.map((set) => set.weight));
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
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
