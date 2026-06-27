import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

type ExerciseType = "bench" | "dumbell-shoulder" | "dips";

type ExerciseOption = {
  value: ExerciseType;
  label: string;
};

type Workout = {
  id: number;
  trainingDate: string;
  exerciseType: ExerciseType;
  sets: number;
  weight: number;
  previousSets: number | null;
  previousWeight: number | null;
  createdAt: string;
};

type CreateWorkoutResponse = Workout | { error: string };

type WorkoutForm = {
  trainingDate: string;
  exerciseType: ExerciseType;
  sets: string;
  weight: string;
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
    sets: "3",
    weight: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/workouts`);
      if (!response.ok) {
        throw new Error("Could not load workouts");
      }
      const payload = (await response.json()) as Workout[];
      setWorkouts(payload);
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
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingDate: form.trainingDate,
          exerciseType: form.exerciseType,
          sets: Number(form.sets),
          weight: Number(form.weight),
        }),
      });

      const payload = (await response.json()) as CreateWorkoutResponse;
      if (!response.ok) {
        throw new Error(
          "error" in payload ? payload.error : "Could not save workout"
        );
      }

      await loadWorkouts();
      setForm((current) => ({ ...current, sets: "3", weight: "" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const currentPrevious = useMemo(() => {
    return workouts.find((workout) => workout.exerciseType === form.exerciseType);
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
                <strong>{currentPrevious.sets} sets</strong> at{" "}
                <strong>{formatWeight(currentPrevious.weight)}</strong>
              </span>
            ) : (
              <span>No previous value for this training type.</span>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
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

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2 text-sm font-medium text-neutral-300">
                  Sets
                  <input
                    className="input"
                    type="number"
                    min="1"
                    step="1"
                    value={form.sets}
                    onChange={(event) =>
                      setForm({ ...form, sets: event.target.value })
                    }
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-neutral-300">
                  Weight
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="kg"
                    value={form.weight}
                    onChange={(event) =>
                      setForm({ ...form, weight: event.target.value })
                    }
                    required
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
                {error}
              </p>
            )}

            <button
              className="mt-5 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add entry"}
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-800 text-left text-sm">
                <thead className="bg-neutral-950 text-xs uppercase tracking-wide text-neutral-400">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Training</th>
                    <th className="px-5 py-3">Sets</th>
                    <th className="px-5 py-3">Weight</th>
                    <th className="px-5 py-3">Previous</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {loading ? (
                    <tr>
                      <td className="px-5 py-8 text-neutral-400" colSpan={5}>
                        Loading entries...
                      </td>
                    </tr>
                  ) : workouts.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-neutral-400" colSpan={5}>
                        No training entries yet.
                      </td>
                    </tr>
                  ) : (
                    workouts.map((workout) => (
                      <tr key={workout.id} className="hover:bg-neutral-800/50">
                        <td className="whitespace-nowrap px-5 py-4 text-neutral-300">
                          {workout.trainingDate}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-white">
                          {labelFor(workout.exerciseType)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-neutral-300">
                          {workout.sets}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-neutral-300">
                          {formatWeight(workout.weight)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-neutral-300">
                          {workout.previousSets == null ? (
                            <span className="text-neutral-500">No previous entry</span>
                          ) : (
                            <span>
                              {workout.previousSets} sets at{" "}
                              {formatWeight(workout.previousWeight)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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

function errorMessage(error: unknown): string {
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
