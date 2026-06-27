import type { Exercise, ExerciseValue, WorkoutSet } from "./types";

export function labelFor(
  exercises: Exercise[],
  value: ExerciseValue
): string {
  return exercises.find((type) => type.value === value)?.label || value;
}

export function formatWeight(value: number | null): string {
  if (value == null) {
    return "-";
  }

  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} kg`;
}

export function maxWeight(sets: WorkoutSet[]): number | null {
  if (sets.length === 0) {
    return null;
  }

  return Math.max(...sets.map((set) => set.weight));
}
