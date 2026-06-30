import {
  sortPlanItems,
  sortTrainingSessions,
  sortTrainingSets,
} from "./sorting";
import type { PlanExercise, TrainingSession, TrainingSet } from "./types";

describe("sorting helpers", () => {
  it("sorts training sessions by date, created time, then id", () => {
    const sessions: TrainingSession[] = [
      {
        id: "c",
        trainingDate: "2026-06-30",
        exerciseType: "bench",
        sets: [],
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "b",
        trainingDate: "2026-06-29",
        exerciseType: "bench",
        sets: [],
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        trainingDate: "2026-06-30",
        exerciseType: "bench",
        sets: [],
        createdAt: "2026-06-30T07:00:00.000Z",
      },
    ];

    expect(sortTrainingSessions(sessions).map((session) => session.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("sorts training sets by created time, then id", () => {
    const sets: TrainingSet[] = [
      {
        id: "b",
        weight: 100,
        reps: 5,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        weight: 90,
        reps: 8,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "c",
        weight: 80,
        reps: 10,
        createdAt: "2026-06-30T07:00:00.000Z",
      },
    ];

    expect(sortTrainingSets(sets).map((set) => set.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("sorts plan items by created time, then id", () => {
    const items: PlanExercise[] = [
      {
        id: "b",
        exerciseType: "bench",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        exerciseType: "squat",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ];

    expect(sortPlanItems(items).map((item) => item.id)).toEqual(["a", "b"]);
  });
});
