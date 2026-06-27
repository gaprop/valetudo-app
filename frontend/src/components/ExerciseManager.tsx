import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Exercise } from "../types";
import { IconButton } from "./IconButton";

type ExerciseManagerProps = {
  exercises: Exercise[];
  loading: boolean;
  error: string;
  creating: boolean;
  deletingValue: string | null;
  onAddExercise: (label: string) => Promise<boolean>;
  onDeleteExercise: (value: string) => void;
};

export function ExerciseManager({
  exercises,
  loading,
  error,
  creating,
  deletingValue,
  onAddExercise,
  onDeleteExercise,
}: ExerciseManagerProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [selectedExerciseValue, setSelectedExerciseValue] = useState("");

  useEffect(() => {
    if (
      exercises.length > 0 &&
      !exercises.some((exercise) => exercise.value === selectedExerciseValue)
    ) {
      setSelectedExerciseValue(exercises[0].value);
    }
    if (exercises.length === 0 && selectedExerciseValue !== "") {
      setSelectedExerciseValue("");
    }
  }, [exercises, selectedExerciseValue]);

  async function handleAddExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddExercise(exerciseName)) {
      setExerciseName("");
    }
  }

  return (
    <form
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-2xl shadow-black/30"
      onSubmit={handleAddExercise}
    >
      <h2 className="text-lg font-semibold text-white">Exercises</h2>
      <label className="mt-5 grid gap-2 text-sm font-medium text-neutral-300">
        Exercise
        <input
          className="input"
          value={exerciseName}
          onChange={(event) => setExerciseName(event.target.value)}
          placeholder="Squat"
          required
        />
      </label>
      {error && (
        <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
          {error}
        </p>
      )}
      <button
        className="mt-5 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
        type="submit"
        disabled={creating}
      >
        {creating ? "Creating..." : "Create exercise"}
      </button>

      <div className="mt-5 grid gap-3">
        {loading ? (
          <p className="text-sm text-neutral-400">Loading exercises...</p>
        ) : exercises.length === 0 ? (
          <p className="text-sm text-neutral-500">No exercises yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Existing exercise
              <select
                className="input"
                value={selectedExerciseValue}
                onChange={(event) => setSelectedExerciseValue(event.target.value)}
              >
                {exercises.map((exercise) => (
                  <option key={exercise.value} value={exercise.value}>
                    {exercise.label}
                  </option>
                ))}
              </select>
            </label>
            <IconButton
              label="Delete selected exercise"
              title="Delete exercise"
              onClick={() => onDeleteExercise(selectedExerciseValue)}
              disabled={
                !selectedExerciseValue || deletingValue === selectedExerciseValue
              }
            >
              <X aria-hidden="true" size={16} strokeWidth={2.25} />
            </IconButton>
          </div>
        )}
      </div>
    </form>
  );
}
