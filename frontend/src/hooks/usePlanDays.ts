import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { planDaysService } from "../services";
import { sortPlanDays, sortPlanItems } from "../sorting";
import { runAsyncAction } from "./asyncAction";
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
    await runAsyncAction({
      before: () => {
        setLoading(true);
        setError("");
      },
      action: async () => {
        setDays(sortPlanDays(await planDaysService.listDays()));
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setLoading(false),
      fallback: undefined,
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addDay(input: CreatePlanDayRequest): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPendingField(setPending, "creatingDay", true);
        setError("");
      },
      action: async () => {
        const day = await planDaysService.createDay(input);
        setDays((current) => sortPlanDays([...current, day]));
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "creatingDay", false),
      fallback: false,
    });
  }

  async function removeDay(dayID: ID): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPendingField(setPending, "deletingDayId", dayID);
        setError("");
      },
      action: async () => {
        await planDaysService.deleteDay({ dayID });
        setDays((current) => current.filter((day) => day.id !== dayID));
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "deletingDayId", null),
      fallback: undefined,
    });
  }

  async function addItem(input: CreatePlanExerciseRequest): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPendingField(setPending, "addingItemDayId", input.dayID);
        setError("");
      },
      action: async () => {
        const item = await planDaysService.createItem(input);
        setDays((current) =>
          updatePlanDay(current, input.dayID, (day) => ({
            ...day,
            items: sortPlanItems([...day.items, item]),
          }))
        );
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "addingItemDayId", null),
      fallback: false,
    });
  }

  async function removeItem(dayID: ID, itemID: ID): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPendingField(setPending, "deletingItemId", itemID);
        setError("");
      },
      action: async () => {
        await planDaysService.deleteItem({ dayID, itemID });
        setDays((current) =>
          updatePlanDay(current, dayID, (day) => ({
            ...day,
            items: day.items.filter((item) => item.id !== itemID),
          }))
        );
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "deletingItemId", null),
      fallback: undefined,
    });
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
