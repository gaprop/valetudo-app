import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Exercise, ExerciseValue, ID, WorkoutPlanDay } from "../types";
import { labelFor } from "../workouts";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";

type WorkoutPlanDayCardProps = {
  day: WorkoutPlanDay;
  exercises: Exercise[];
  addingItemDayId: ID | null;
  deletingDayId: ID | null;
  deletingItemId: ID | null;
  onAddItem: (input: {
    dayID: ID;
    exerciseType: ExerciseValue;
  }) => Promise<boolean>;
  onDeleteDay: () => void;
  onDeleteItem: (itemID: ID) => void;
};

export function WorkoutPlanDayCard({
  day,
  exercises,
  addingItemDayId,
  deletingDayId,
  deletingItemId,
  onAddItem,
  onDeleteDay,
  onDeleteItem,
}: WorkoutPlanDayCardProps) {
  const [exerciseValue, setExerciseValue] = useState<ExerciseValue>("bench");

  useEffect(() => {
    if (
      exercises.length > 0 &&
      !exercises.some((exercise) => exercise.value === exerciseValue)
    ) {
      setExerciseValue(exercises[0].value);
    }
  }, [exerciseValue, exercises]);

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exerciseValue) {
      return;
    }
    await onAddItem({ dayID: day.id, exerciseType: exerciseValue });
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
            value={exerciseValue}
            onChange={(event) => setExerciseValue(event.target.value)}
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
