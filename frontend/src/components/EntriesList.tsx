import type { FormEvent } from "react";
import type { SetForm, Workout } from "../types";
import { WorkoutEntry } from "./WorkoutEntry";

type EntriesListProps = {
  workouts: Workout[];
  loading: boolean;
  setForms: Record<number, SetForm>;
  savingSetId: number | null;
  updatingSetId: number | null;
  deletingWorkoutId: number | null;
  deletingSetId: number | null;
  openWorkoutId: number | null;
  onRefresh: () => void;
  onToggleWorkout: (workoutID: number) => void;
  onSetFormChange: (
    workoutID: number,
    field: keyof SetForm,
    value: string
  ) => void;
  onAddSet: (event: FormEvent<HTMLFormElement>, workoutID: number) => void;
  onUpdateSet: (workoutID: number, setID: number, form: SetForm) => void;
  onDeleteWorkout: (workoutID: number) => void;
  onDeleteSet: (workoutID: number, setID: number) => void;
};

export function EntriesList({
  workouts,
  loading,
  setForms,
  savingSetId,
  updatingSetId,
  deletingWorkoutId,
  deletingSetId,
  openWorkoutId,
  onRefresh,
  onToggleWorkout,
  onSetFormChange,
  onAddSet,
  onUpdateSet,
  onDeleteWorkout,
  onDeleteSet,
}: EntriesListProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Entries</h2>
        <button
          className="rounded border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition hover:border-primary-500 hover:text-white"
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="px-5 py-8 text-sm text-neutral-400">Loading entries...</p>
      ) : workouts.length === 0 ? (
        <p className="px-5 py-8 text-sm text-neutral-400">
          No training entries yet.
        </p>
      ) : (
        <div className="divide-y divide-neutral-800">
          {workouts.map((workout) => (
            <WorkoutEntry
              key={workout.id}
              workout={workout}
              setForm={setForms[workout.id] || { weight: "", reps: "" }}
              savingSetId={savingSetId}
              updatingSetId={updatingSetId}
              deletingWorkoutId={deletingWorkoutId}
              deletingSetId={deletingSetId}
              isOpen={openWorkoutId === workout.id}
              onToggle={() => onToggleWorkout(workout.id)}
              onSetFormChange={(field, value) =>
                onSetFormChange(workout.id, field, value)
              }
              onAddSet={(event) => onAddSet(event, workout.id)}
              onUpdateSet={(setID, form) => onUpdateSet(workout.id, setID, form)}
              onDeleteWorkout={() => onDeleteWorkout(workout.id)}
              onDeleteSet={(setID) => onDeleteSet(workout.id, setID)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
