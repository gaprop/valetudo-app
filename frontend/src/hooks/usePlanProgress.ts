import { useEffect, useMemo, useState } from "react";
import type { PlanDay } from "../types";

const storageKey = "fitness-trainingSession-plan-progress";

function readProgress(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function usePlanProgress(
  selectedPlanDay: PlanDay | null,
  selectedDate: string
) {
  const [progress, setProgress] = useState<Record<string, number>>(() =>
    readProgress()
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress]);

  const progressKey = selectedPlanDay
    ? `${selectedPlanDay.id}:${selectedDate}`
    : "";

  const nextExerciseValue = useMemo(() => {
    if (!selectedPlanDay) {
      return null;
    }

    const nextIndex = progress[progressKey] || 0;
    return selectedPlanDay.items[nextIndex]?.exerciseType || null;
  }, [progress, progressKey, selectedPlanDay]);

  function advance(): void {
    if (!progressKey) {
      return;
    }

    setProgress((current) => ({
      ...current,
      [progressKey]: (current[progressKey] || 0) + 1,
    }));
  }

  return {
    nextExerciseValue,
    advance,
  };
}
