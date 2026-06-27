import { useCallback, useEffect, useState } from "react";
import {
  createWorkoutPlanDay,
  createWorkoutPlanItem,
  deleteWorkoutPlanDay,
  deleteWorkoutPlanItem,
  errorMessage,
  listWorkoutPlanDays,
} from "./api";
import { sortPlanDays, sortPlanItems } from "./sorting";
import type {
  CreateWorkoutPlanDayRequest,
  CreateWorkoutPlanItemRequest,
  WorkoutPlanDay,
} from "./types";

export type PlanPendingState = {
  creatingDay: boolean;
  deletingDayId: number | null;
  addingItemDayId: number | null;
  deletingItemId: number | null;
};

const initialPendingState: PlanPendingState = {
  creatingDay: false,
  deletingDayId: null,
  addingItemDayId: null,
  deletingItemId: null,
};

function updatePlanDay(
  days: WorkoutPlanDay[],
  dayID: number,
  update: (day: WorkoutPlanDay) => WorkoutPlanDay
): WorkoutPlanDay[] {
  return days.map((day) => (day.id === dayID ? update(day) : day));
}

export function useWorkoutPlan() {
  const [days, setDays] = useState<WorkoutPlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PlanPendingState>(initialPendingState);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDays(sortPlanDays(await listWorkoutPlanDays()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addDay(input: CreateWorkoutPlanDayRequest): Promise<boolean> {
    setPending((current) => ({ ...current, creatingDay: true }));
    setError("");

    try {
      const day = await createWorkoutPlanDay(input);
      setDays((current) => sortPlanDays([...current, day]));
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setPending((current) => ({ ...current, creatingDay: false }));
    }
  }

  async function removeDay(dayID: number): Promise<void> {
    setPending((current) => ({ ...current, deletingDayId: dayID }));
    setError("");

    try {
      await deleteWorkoutPlanDay({ dayID });
      setDays((current) => current.filter((day) => day.id !== dayID));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, deletingDayId: null }));
    }
  }

  async function addItem(input: CreateWorkoutPlanItemRequest): Promise<boolean> {
    setPending((current) => ({ ...current, addingItemDayId: input.dayID }));
    setError("");

    try {
      const item = await createWorkoutPlanItem(input);
      setDays((current) =>
        updatePlanDay(current, input.dayID, (day) => ({
          ...day,
          items: sortPlanItems([...day.items, item]),
        }))
      );
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setPending((current) => ({ ...current, addingItemDayId: null }));
    }
  }

  async function removeItem(dayID: number, itemID: number): Promise<void> {
    setPending((current) => ({ ...current, deletingItemId: itemID }));
    setError("");

    try {
      await deleteWorkoutPlanItem({ dayID, itemID });
      setDays((current) =>
        updatePlanDay(current, dayID, (day) => ({
          ...day,
          items: day.items.filter((item) => item.id !== itemID),
        }))
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending((current) => ({ ...current, deletingItemId: null }));
    }
  }

  return {
    days,
    loading,
    pending,
    error,
    load,
    addDay,
    removeDay,
    addItem,
    removeItem,
  };
}
