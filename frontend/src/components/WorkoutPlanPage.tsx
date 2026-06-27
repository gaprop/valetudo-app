import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type {
  CreateWorkoutPlanDayRequest,
  CreateWorkoutPlanItemRequest,
  ExerciseOption,
  ExerciseType,
  WorkoutPlanDay,
} from "../types";
import type { PlanPendingState } from "../useWorkoutPlan";
import { labelFor } from "../workouts";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";

type WorkoutPlanPageProps = {
  exercises: ExerciseOption[];
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
  onDeleteDay: (dayID: number) => void;
  onAddItem: (input: CreateWorkoutPlanItemRequest) => Promise<boolean>;
  onDeleteItem: (dayID: number, itemID: number) => void;
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
  const [dayName, setDayName] = useState("");
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

  async function handleAddDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddDay({ name: dayName })) {
      setDayName("");
    }
  }

  async function handleAddExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAddExercise(exerciseName)) {
      setExerciseName("");
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="grid content-start gap-6">
        <form
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-2xl shadow-black/30"
          onSubmit={handleAddDay}
        >
          <h2 className="text-lg font-semibold text-white">Add day</h2>
          <label className="mt-5 grid gap-2 text-sm font-medium text-neutral-300">
            Day
            <input
              className="input"
              value={dayName}
              onChange={(event) => setDayName(event.target.value)}
              placeholder="Push day"
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
            disabled={pending.creatingDay}
          >
            {pending.creatingDay ? "Creating..." : "Create day"}
          </button>
        </form>

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
          {exerciseError && (
            <p className="mt-4 rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
              {exerciseError}
            </p>
          )}
          <button
            className="mt-5 w-full rounded bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
            type="submit"
            disabled={creatingExercise}
          >
            {creatingExercise ? "Creating..." : "Create exercise"}
          </button>

          <div className="mt-5 grid gap-3">
            {exerciseLoading ? (
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
                    onChange={(event) =>
                      setSelectedExerciseValue(event.target.value)
                    }
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
                    !selectedExerciseValue ||
                    deletingExerciseValue === selectedExerciseValue
                  }
                >
                  <X aria-hidden="true" size={16} strokeWidth={2.25} />
                </IconButton>
              </div>
            )}
          </div>
        </form>
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

type WorkoutPlanDayCardProps = {
  day: WorkoutPlanDay;
  exercises: ExerciseOption[];
  addingItemDayId: number | null;
  deletingDayId: number | null;
  deletingItemId: number | null;
  onAddItem: (input: {
    dayID: number;
    exerciseType: ExerciseType;
  }) => Promise<boolean>;
  onDeleteDay: () => void;
  onDeleteItem: (itemID: number) => void;
};

function WorkoutPlanDayCard({
  day,
  exercises,
  addingItemDayId,
  deletingDayId,
  deletingItemId,
  onAddItem,
  onDeleteDay,
  onDeleteItem,
}: WorkoutPlanDayCardProps) {
  const [exerciseType, setExerciseType] = useState<ExerciseType>("bench");

  useEffect(() => {
    if (
      exercises.length > 0 &&
      !exercises.some((exercise) => exercise.value === exerciseType)
    ) {
      setExerciseType(exercises[0].value);
    }
  }, [exerciseType, exercises]);

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exerciseType) {
      return;
    }
    await onAddItem({ dayID: day.id, exerciseType });
  }

  return (
    <article className="grid gap-4 px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{day.name}</h3>
          <p className="mt-1 text-sm text-neutral-400">
            {day.items.length} {day.items.length === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <IconButton
          label={`Delete ${day.name}`}
          title="Delete day"
          onClick={onDeleteDay}
          disabled={deletingDayId === day.id}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
      </div>

      {day.items.length === 0 ? (
        <p className="text-sm text-neutral-500">No exercises added yet.</p>
      ) : (
        <div className="grid gap-2">
          {day.items.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3"
              key={item.id}
            >
              <span className="text-sm font-semibold text-white">
                {labelFor(exercises, item.exerciseType)}
              </span>
              <IconButton
                label={`Remove ${labelFor(exercises, item.exerciseType)} from ${day.name}`}
                title="Remove exercise"
                onClick={() => onDeleteItem(item.id)}
                disabled={deletingItemId === item.id}
              >
                <X aria-hidden="true" size={16} strokeWidth={2.25} />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      <form
        className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={handleAddItem}
      >
        <label className="grid gap-2 text-sm font-medium text-neutral-300">
          Exercise
          <select
            className="input"
            value={exerciseType}
            onChange={(event) => setExerciseType(event.target.value)}
            disabled={exercises.length === 0}
          >
            {exercises.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-2 sm:w-40">
          <ActionButton
            type="submit"
            disabled={addingItemDayId === day.id || exercises.length === 0}
          >
            {addingItemDayId === day.id ? "Adding" : "Add"}
          </ActionButton>
        </div>
      </form>
    </article>
  );
}
