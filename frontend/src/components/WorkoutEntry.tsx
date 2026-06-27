import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { SetForm, Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";
import { MetricInputs } from "./MetricInputs";
import { WorkoutSetRow } from "./WorkoutSetRow";

type WorkoutEntryProps = {
  workout: Workout;
  error: string;
  savingSetId: number | null;
  updatingSetId: number | null;
  deletingWorkoutId: number | null;
  deletingSetId: number | null;
  isOpen: boolean;
  onToggle: () => void;
  onAddSet: (form: SetForm) => Promise<boolean>;
  onUpdateSet: (setID: number, form: SetForm) => void;
  onDeleteWorkout: () => void;
  onDeleteSet: (setID: number) => void;
};

export function WorkoutEntry({
  workout,
  error,
  savingSetId,
  updatingSetId,
  deletingWorkoutId,
  deletingSetId,
  isOpen,
  onToggle,
  onAddSet,
  onUpdateSet,
  onDeleteWorkout,
  onDeleteSet,
}: WorkoutEntryProps) {
  const [setForm, setSetForm] = useState<SetForm>({ weight: "", reps: "" });

  async function handleAddSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddSet(setForm)) {
      setSetForm({ weight: "", reps: "" });
    }
  }

  return (
    <article className="bg-neutral-900">
      <div className="grid gap-3 border-l-4 border-transparent bg-neutral-800/40 px-5 py-4 transition hover:border-primary-600 hover:bg-neutral-800 sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <button
          className="min-w-0 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-700"
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <span className="block text-base font-semibold text-white">
            {labelFor(workout.exerciseType)}
          </span>
          <span className="mt-1 block text-sm text-neutral-400">
            {workout.trainingDate}
          </span>
        </button>
        <span className="flex flex-wrap items-center gap-2 text-sm text-neutral-300 sm:justify-end">
          <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
            {workout.sets.length} {workout.sets.length === 1 ? "set" : "sets"}
          </span>
          <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
            Best {formatWeight(maxWeight(workout.sets))}
          </span>
        </span>
        <div className="flex flex-wrap gap-2 sm:justify-self-end">
          <button
            className="flex h-9 min-w-24 items-center justify-center rounded border border-primary-800 bg-primary-950/60 px-3 text-sm font-semibold text-primary-100 transition hover:border-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-700"
            type="button"
            aria-expanded={isOpen}
            onClick={onToggle}
          >
            {isOpen ? "Close" : "Open"}
          </button>
          <IconButton
            label={`Delete ${labelFor(workout.exerciseType)} training on ${workout.trainingDate}`}
            title="Delete training"
            onClick={onDeleteWorkout}
            disabled={deletingWorkoutId === workout.id}
          >
            <X aria-hidden="true" size={16} strokeWidth={2.25} />
          </IconButton>
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-5 border-t border-neutral-800 bg-neutral-950/50 px-5 py-5">
          {error && (
            <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
              {error}
            </p>
          )}

          <div>
            {workout.sets.length === 0 ? (
              <p className="text-sm text-neutral-500">No sets added yet.</p>
            ) : (
              <div className="grid gap-2">
                {workout.sets.map((set, index) => (
                  <WorkoutSetRow
                    key={set.id}
                    workoutSet={set}
                    displayNumber={index + 1}
                    updatingSetId={updatingSetId}
                    deletingSetId={deletingSetId}
                    onUpdate={(form) => onUpdateSet(set.id, form)}
                    onDelete={() => onDeleteSet(set.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <form
            className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            onSubmit={handleAddSet}
          >
            <MetricInputs
              label="New set"
              value={setForm}
              onChange={(field, value) =>
                setSetForm((current) => ({ ...current, [field]: value }))
              }
            />
            <div className="grid gap-2 sm:w-40">
              <ActionButton type="submit" disabled={savingSetId === workout.id}>
                {savingSetId === workout.id ? "Adding" : "Add set"}
              </ActionButton>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
