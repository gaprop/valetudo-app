import type {
  CreateWorkoutPlanDayRequest,
  CreateWorkoutPlanItemRequest,
  Exercise,
  ID,
  WorkoutPlanDay,
} from "../types";
import type { PlanPendingState } from "../hooks";
import { ExerciseManager } from "./ExerciseManager";
import { WorkoutDayForm } from "./WorkoutDayForm";
import { WorkoutPlanDayCard } from "./WorkoutPlanDayCard";

type WorkoutPlanPageProps = {
  exercises: Exercise[];
  days: WorkoutPlanDay[];
  loading: boolean;
  pending: PlanPendingState;
  error: string;
  exerciseLoading: boolean;
  exerciseError: string;
  creatingExercise: boolean;
  deletingExerciseValue: string | null;
  onRefresh: () => void;
  onAddDay: (input: CreateWorkoutPlanDayRequest) => Promise<boolean>;
  onDeleteDay: (dayID: ID) => void;
  onAddItem: (input: CreateWorkoutPlanItemRequest) => Promise<boolean>;
  onDeleteItem: (dayID: ID, itemID: ID) => void;
  onAddExercise: (label: string) => Promise<boolean>;
  onDeleteExercise: (value: string) => void;
};

export function WorkoutPlanPage({
  exercises,
  days,
  loading,
  pending,
  error,
  exerciseLoading,
  exerciseError,
  creatingExercise,
  deletingExerciseValue,
  onRefresh,
  onAddDay,
  onDeleteDay,
  onAddItem,
  onDeleteItem,
  onAddExercise,
  onDeleteExercise,
}: WorkoutPlanPageProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="grid content-start gap-6">
        <WorkoutDayForm
          error={error}
          creatingDay={pending.creatingDay}
          onAddDay={onAddDay}
        />
        <ExerciseManager
          exercises={exercises}
          loading={exerciseLoading}
          error={exerciseError}
          creating={creatingExercise}
          deletingValue={deletingExerciseValue}
          onAddExercise={onAddExercise}
          onDeleteExercise={onDeleteExercise}
        />
      </div>

      <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Workout plan</h2>
          <button
            className="rounded border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition hover:border-primary-500 hover:text-white"
            onClick={onRefresh}
            type="button"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-400">Loading plan...</p>
        ) : days.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-400">
            No plan days yet.
          </p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {days.map((day) => (
              <WorkoutPlanDayCard
                key={day.id}
                day={day}
                exercises={exercises}
                addingItemDayId={pending.addingItemDayId}
                deletingDayId={pending.deletingDayId}
                deletingItemId={pending.deletingItemId}
                onAddItem={onAddItem}
                onDeleteDay={() => onDeleteDay(day.id)}
                onDeleteItem={(itemID) => onDeleteItem(day.id, itemID)}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
