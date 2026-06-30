import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Exercise, ExerciseValue, ID, PlanDay } from "../types";
import { labelFor } from "../trainingSessions";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";

type PlanDayCardProps = {
  day: PlanDay;
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

export function PlanDayCard({
  day,
  exercises,
  addingItemDayId,
  deletingDayId,
  deletingItemId,
  onAddItem,
  onDeleteDay,
  onDeleteItem,
}: PlanDayCardProps) {
  const [exerciseValue, setExerciseValue] = useState<ExerciseValue>("bench");
  const [exerciseSearch, setExerciseSearch] = useState("");

  useEffect(() => {
    if (
      exercises.length > 0 &&
      !exercises.some((exercise) => exercise.value === exerciseValue)
    ) {
      setExerciseValue(exercises[0].value);
    }
  }, [exerciseValue, exercises]);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.label.toLowerCase().includes(exerciseSearch.trim().toLowerCase())
  );
  const selectedExercise = exercises.find(
    (exercise) => exercise.value === exerciseValue
  );

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exerciseValue) {
      return;
    }
    await onAddItem({ dayID: day.id, exerciseType: exerciseValue });
    setExerciseSearch("");
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
        className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-start"
        onSubmit={handleAddItem}
      >
        <div className="grid gap-2 text-sm font-medium text-neutral-300">
          Exercise
          <input
            className="input"
            value={exerciseSearch}
            onChange={(event) => setExerciseSearch(event.target.value)}
            disabled={exercises.length === 0}
            placeholder={selectedExercise?.label || "Search exercises"}
          />
          {exercises.length > 0 && exerciseSearch.trim() !== "" && (
            <div className="max-h-48 overflow-y-auto rounded border border-neutral-800 bg-neutral-900">
              {filteredExercises.length === 0 ? (
                <p className="px-3 py-3 text-sm text-neutral-500">
                  No exercises found.
                </p>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-800 ${
                      exercise.value === exerciseValue
                        ? "bg-primary-950/60 text-primary-100"
                        : "text-neutral-200"
                    }`}
                    key={exercise.value}
                    type="button"
                    onClick={() => {
                      setExerciseValue(exercise.value);
                      setExerciseSearch(exercise.label);
                    }}
                  >
                    {exercise.label}
                  </button>
                ))
              )}
            </div>
          )}
          {selectedExercise && (
            <p className="text-xs text-neutral-500">
              Selected: {selectedExercise.label}
            </p>
          )}
        </div>
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
