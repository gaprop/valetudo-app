import { useEffect, useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";
import type { Exercise, ExerciseValue, ID, PlanDay } from "../types";
import { labelFor } from "../trainingSessions";
import { ActionButton } from "./ActionButton";
import { IconButton } from "./IconButton";

type PlanDayCardProps = {
  day: PlanDay;
  exercises: Exercise[];
  addingItemDayId: ID | null;
  deletingDayId: ID | null;
  updatingDayId: ID | null;
  deletingItemId: ID | null;
  updatingItemId: ID | null;
  onAddItem: (input: {
    dayID: ID;
    exerciseType: ExerciseValue;
  }) => Promise<boolean>;
  onUpdateDay: (input: { dayID: ID; name: string }) => Promise<boolean>;
  onUpdateItem: (input: {
    dayID: ID;
    itemID: ID;
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
  updatingDayId,
  deletingItemId,
  updatingItemId,
  onAddItem,
  onUpdateDay,
  onUpdateItem,
  onDeleteDay,
  onDeleteItem,
}: PlanDayCardProps) {
  const [dayName, setDayName] = useState(day.name);
  const [exerciseValue, setExerciseValue] = useState<ExerciseValue>("bench");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [itemExerciseValues, setItemExerciseValues] = useState<
    Record<ID, ExerciseValue>
  >({});

  useEffect(() => {
    setDayName(day.name);
  }, [day.name]);

  useEffect(() => {
    setItemExerciseValues((current) => {
      const next: Record<ID, ExerciseValue> = {};
      for (const item of day.items) {
        next[item.id] = current[item.id] || item.exerciseType;
      }
      return next;
    });
  }, [day.items]);

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

  async function handleUpdateDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = dayName.trim();
    if (trimmedName === "" || trimmedName === day.name) {
      setDayName(day.name);
      return;
    }

    const saved = await onUpdateDay({ dayID: day.id, name: trimmedName });
    if (!saved) {
      setDayName(day.name);
    }
  }

  async function saveItem(
    itemID: ID,
    currentExerciseType: ExerciseValue
  ) {
    const exerciseType = itemExerciseValues[itemID];
    if (!exerciseType || exerciseType === currentExerciseType) {
      return;
    }

    const saved = await onUpdateItem({
      dayID: day.id,
      itemID,
      exerciseType,
    });
    if (!saved) {
      setItemExerciseValues((current) => ({
        ...current,
        [itemID]: currentExerciseType,
      }));
    }
  }

  async function handleUpdateItem(
    event: FormEvent<HTMLFormElement>,
    itemID: ID,
    currentExerciseType: ExerciseValue
  ) {
    event.preventDefault();
    await saveItem(itemID, currentExerciseType);
  }

  return (
    <article className="grid gap-4 px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <form
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            onSubmit={handleUpdateDay}
          >
            <input
              className="input font-semibold text-white"
              value={dayName}
              onChange={(event) => setDayName(event.target.value)}
              aria-label="Workout plan day name"
            />
            <ActionButton
              type="submit"
              variant="secondary"
              disabled={
                updatingDayId === day.id ||
                dayName.trim() === "" ||
                dayName.trim() === day.name
              }
            >
              {updatingDayId === day.id ? "Saving" : "Save"}
            </ActionButton>
          </form>
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
            <form
              className="grid gap-2 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
              key={item.id}
              onSubmit={(event) =>
                void handleUpdateItem(event, item.id, item.exerciseType)
              }
            >
              <select
                className="input min-w-0 text-sm font-semibold text-white"
                value={itemExerciseValues[item.id] || item.exerciseType}
                onChange={(event) =>
                  setItemExerciseValues((current) => ({
                    ...current,
                    [item.id]: event.target.value as ExerciseValue,
                  }))
                }
                aria-label={`Change ${labelFor(exercises, item.exerciseType)}`}
                disabled={exercises.length === 0}
              >
                {exercises.map((exercise) => (
                  <option key={exercise.value} value={exercise.value}>
                    {exercise.label}
                  </option>
                ))}
              </select>
              <IconButton
                label={`Save ${labelFor(exercises, item.exerciseType)}`}
                title="Save exercise"
                onClick={() => void saveItem(item.id, item.exerciseType)}
                disabled={
                  updatingItemId === item.id ||
                  !itemExerciseValues[item.id] ||
                  itemExerciseValues[item.id] === item.exerciseType
                }
              >
                <Check aria-hidden="true" size={16} strokeWidth={2.25} />
              </IconButton>
              <IconButton
                label={`Remove ${labelFor(exercises, item.exerciseType)} from ${day.name}`}
                title="Remove exercise"
                onClick={() => onDeleteItem(item.id)}
                disabled={deletingItemId === item.id}
              >
                <X aria-hidden="true" size={16} strokeWidth={2.25} />
              </IconButton>
            </form>
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
