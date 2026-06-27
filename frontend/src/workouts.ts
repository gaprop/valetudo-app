import type { ExerciseOption, ExerciseType, WorkoutSet } from "./types";

export const exerciseTypes = [
  { value: "bench", label: "Bench" },
  { value: "dumbell-shoulder", label: "Dumbell shoulder" },
  { value: "dips", label: "Dips" },
] satisfies ExerciseOption[];

export function labelFor(value: ExerciseType): string {
  return exerciseTypes.find((type) => type.value === value)?.label || value;
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
