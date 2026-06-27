import type { FormEvent } from "react";
import type { Workout } from "../types";
import { WorkoutEntry } from "./WorkoutEntry";

type EntriesListProps = {
  workouts: Workout[];
  loading: boolean;
  setWeights: Record<number, string>;
  savingSetId: number | null;
  deletingSetId: number | null;
  openWorkoutId: number | null;
  onRefresh: () => void;
  onToggleWorkout: (workoutID: number) => void;
  onSetWeightChange: (workoutID: number, weight: string) => void;
  onAddSet: (event: FormEvent<HTMLFormElement>, workoutID: number) => void;
  onDeleteSet: (workoutID: number, setID: number) => void;
};

export function EntriesList({
  workouts,
  loading,
  setWeights,
  savingSetId,
  deletingSetId,
  openWorkoutId,
  onRefresh,
  onToggleWorkout,
  onSetWeightChange,
  onAddSet,
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
              setWeight={setWeights[workout.id] || ""}
              savingSetId={savingSetId}
              deletingSetId={deletingSetId}
              isOpen={openWorkoutId === workout.id}
              onToggle={() => onToggleWorkout(workout.id)}
              onSetWeightChange={(weight) =>
                onSetWeightChange(workout.id, weight)
              }
              onAddSet={(event) => onAddSet(event, workout.id)}
              onDeleteSet={(setID) => onDeleteSet(workout.id, setID)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
