import { act, renderHook } from "@testing-library/react";
import { useTrainingLogState } from "./useTrainingLogState";
import type { PlanDay } from "../types";

const createTrainingSession = jest.fn();

function planDay(id: string, name: string): PlanDay {
  return {
    id,
    name,
    createdAt: "2026-08-18T10:00:00.000Z",
    items: [],
  };
}

function renderTrainingLogState(planDays: PlanDay[]) {
  return renderHook(() =>
    useTrainingLogState({
      today: "2026-08-18",
      exercises: [{ value: "bench", label: "Bænk", createdAt: "2026-08-18T10:00:00.000Z" }],
      trainingSessions: [],
      planDays,
      openTrainingSessionId: null,
      createTrainingSession,
    })
  );
}

describe("useTrainingLogState", () => {
  beforeEach(() => {
    window.localStorage.clear();
    createTrainingSession.mockReset();
  });

  it("remembers the selected workout plan day", () => {
    const days = [planDay("day-a", "Push"), planDay("day-b", "Pull")];
    const { result, unmount } = renderTrainingLogState(days);

    act(() => {
      result.current.setSelectedPlanDayId("day-b");
    });
    expect(result.current.selectedPlanDay?.id).toBe("day-b");

    unmount();
    const rerendered = renderTrainingLogState(days);

    expect(rerendered.result.current.selectedPlanDay?.id).toBe("day-b");
  });

  it("falls back to the first workout plan day when the saved day no longer exists", () => {
    window.localStorage.setItem("fitness-trainingSession-selected-plan-day", "missing-day");

    const { result } = renderTrainingLogState([
      planDay("day-a", "Push"),
      planDay("day-b", "Pull"),
    ]);

    expect(result.current.selectedPlanDay?.id).toBe("day-a");
  });
});
