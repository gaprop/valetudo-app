import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { planDaysService } from "../services";
import { sortPlanDays, sortPlanItems } from "../sorting";
import { setPendingField } from "./pending";
import type {
  CreatePlanDayRequest,
  CreatePlanExerciseRequest,
  ID,
  PlanDay,
} from "../types";

export type PlanPendingState = {
  creatingDay: boolean;
  deletingDayId: ID | null;
  addingItemDayId: ID | null;
  deletingItemId: ID | null;
};

const initialPendingState: PlanPendingState = {
  creatingDay: false,
  deletingDayId: null,
  addingItemDayId: null,
  deletingItemId: null,
};

function updatePlanDay(
  days: PlanDay[],
  dayID: ID,
  update: (day: PlanDay) => PlanDay
): PlanDay[] {
  return days.map((day) => (day.id === dayID ? update(day) : day));
}

export function usePlanDays() {
  const [days, setDays] = useState<PlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PlanPendingState>(initialPendingState);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDays(sortPlanDays(await planDaysService.listDays()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addDay(input: CreatePlanDayRequest): Promise<boolean> {
    setPendingField(setPending, "creatingDay", true);
    setError("");

    try {
      const day = await planDaysService.createDay(input);
      setDays((current) => sortPlanDays([...current, day]));
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setPendingField(setPending, "creatingDay", false);
    }
  }

  async function removeDay(dayID: ID): Promise<void> {
    setPendingField(setPending, "deletingDayId", dayID);
    setError("");

    try {
      await planDaysService.deleteDay({ dayID });
      setDays((current) => current.filter((day) => day.id !== dayID));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPendingField(setPending, "deletingDayId", null);
    }
  }

  async function addItem(input: CreatePlanExerciseRequest): Promise<boolean> {
    setPendingField(setPending, "addingItemDayId", input.dayID);
    setError("");

    try {
      const item = await planDaysService.createItem(input);
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
      setPendingField(setPending, "addingItemDayId", null);
    }
  }

  async function removeItem(dayID: ID, itemID: ID): Promise<void> {
    setPendingField(setPending, "deletingItemId", itemID);
    setError("");

    try {
      await planDaysService.deleteItem({ dayID, itemID });
      setDays((current) =>
        updatePlanDay(current, dayID, (day) => ({
          ...day,
          items: day.items.filter((item) => item.id !== itemID),
        }))
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPendingField(setPending, "deletingItemId", null);
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
