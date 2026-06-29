import type {
  ID,
  SetForm,
  Exercise,
  Workout,
} from "../types";
import { WorkoutEntry } from "./WorkoutEntry";

type EntriesListProps = {
  workouts: Workout[];
  exercises: Exercise[];
  loading: boolean;
  nextPlanExerciseLabel: string | null;
  selectedPlanDayName: string | null;
  pending: {
    savingEntry: boolean;
    savingSetId: ID | null;
    updatingSetId: ID | null;
    deletingWorkoutId: ID | null;
    deletingSetId: ID | null;
  };
  entryErrors: Record<ID, string>;
  openWorkoutId: ID | null;
  onRefresh: () => void;
  onAddNextPlanWorkout: () => void;
  onToggleWorkout: (workoutID: ID) => void;
  onAddSet: (workoutID: ID, form: SetForm) => Promise<boolean>;
  onUpdateSet: (
    workoutID: ID,
    setID: ID,
    form: SetForm
  ) => Promise<void>;
  onDeleteWorkout: (workoutID: ID) => void;
  onDeleteSet: (workoutID: ID, setID: ID) => void;
};

export function EntriesList({
  workouts,
  exercises,
  loading,
  nextPlanExerciseLabel,
  selectedPlanDayName,
  pending,
  entryErrors,
  openWorkoutId,
  onRefresh,
  onAddNextPlanWorkout,
  onToggleWorkout,
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

      <div>
        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-400">
            Loading entries...
          </p>
        ) : workouts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-400">
            No training entries for this day.
          </p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {workouts.map((workout) => (
              <WorkoutEntry
                key={workout.id}
                workout={workout}
                exercises={exercises}
                error={entryErrors[workout.id] || ""}
                savingSetId={pending.savingSetId}
                updatingSetId={pending.updatingSetId}
                deletingWorkoutId={pending.deletingWorkoutId}
                deletingSetId={pending.deletingSetId}
                isOpen={openWorkoutId === workout.id}
                onToggle={() => onToggleWorkout(workout.id)}
                onAddSet={(form: SetForm) => onAddSet(workout.id, form)}
                onUpdateSet={(setID, form) =>
                  onUpdateSet(workout.id, setID, form)
                }
                onDeleteWorkout={() => onDeleteWorkout(workout.id)}
                onDeleteSet={(setID) => onDeleteSet(workout.id, setID)}
              />
            ))}
          </div>
        )}

        <div className="border-t border-neutral-800 bg-neutral-950/60 px-5 py-4">
          <button
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={onAddNextPlanWorkout}
            disabled={!nextPlanExerciseLabel || pending.savingEntry}
          >
            {nextPlanExerciseLabel && selectedPlanDayName
              ? `Add next from ${selectedPlanDayName}: ${nextPlanExerciseLabel}`
              : "Add next from workout plan"}
          </button>
        </div>
      </div>
    </section>
  );
}
