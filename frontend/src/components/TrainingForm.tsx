import type { FormEvent } from "react";
import type { ExerciseOption, WorkoutForm } from "../types";

type TrainingFormProps = {
  form: WorkoutForm;
  exercises: ExerciseOption[];
  error: string;
  savingEntry: boolean;
  onChange: (form: WorkoutForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TrainingForm({
  form,
  exercises,
  error,
  savingEntry,
  onChange,
  onSubmit,
}: TrainingFormProps) {
  return (
    <form
      onSubmit={onSubmit}
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
              onChange({ ...form, trainingDate: event.target.value })
            }
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-neutral-300">
          Exercise
          <select
            className="input"
            value={form.exerciseType}
            onChange={(event) =>
              onChange({
                ...form,
                exerciseType: event.target.value,
              })
            }
            disabled={exercises.length === 0}
          >
            {exercises.map((type) => (
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
        disabled={savingEntry || exercises.length === 0}
      >
        {savingEntry ? "Creating..." : "Create training"}
      </button>
    </form>
  );
}
