import type {
  CreateWorkoutSetRequest,
  ExerciseOption,
  SetForm,
  UpdateWorkoutSetRequest,
  Workout,
} from "../types";
import { WorkoutEntry } from "./WorkoutEntry";

type EntriesListProps = {
  workouts: Workout[];
  exercises: ExerciseOption[];
  loading: boolean;
  pending: {
    savingSetId: number | null;
    updatingSetId: number | null;
    deletingWorkoutId: number | null;
    deletingSetId: number | null;
  };
  entryErrors: Record<number, string>;
  openWorkoutId: number | null;
  onRefresh: () => void;
  onToggleWorkout: (workoutID: number) => void;
  onAddSet: (input: CreateWorkoutSetRequest) => Promise<boolean>;
  onUpdateSet: (input: UpdateWorkoutSetRequest) => Promise<void>;
  onDeleteWorkout: (workoutID: number) => void;
  onDeleteSet: (workoutID: number, setID: number) => void;
};

export function EntriesList({
  workouts,
  exercises,
  loading,
  pending,
  entryErrors,
  openWorkoutId,
  onRefresh,
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
              exercises={exercises}
              error={entryErrors[workout.id] || ""}
              savingSetId={pending.savingSetId}
              updatingSetId={pending.updatingSetId}
              deletingWorkoutId={pending.deletingWorkoutId}
              deletingSetId={pending.deletingSetId}
              isOpen={openWorkoutId === workout.id}
              onToggle={() => onToggleWorkout(workout.id)}
              onAddSet={(form: SetForm) =>
                onAddSet({
                  workoutID: workout.id,
                  weight: Number(form.weight),
                  reps: Number(form.reps),
                })
              }
              onUpdateSet={(setID, form) =>
                onUpdateSet({
                  workoutID: workout.id,
                  setID,
                  weight: Number(form.weight),
                  reps: Number(form.reps),
                })
              }
              onDeleteWorkout={() => onDeleteWorkout(workout.id)}
              onDeleteSet={(setID) => onDeleteSet(workout.id, setID)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
