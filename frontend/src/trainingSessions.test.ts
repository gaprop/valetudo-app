import { formatWeight, labelFor, maxWeight } from "./trainingSessions";
import type { Exercise, TrainingSet } from "./types";

const exercises: Exercise[] = [
  {
    value: "bench",
    label: "Bænk",
    createdAt: "2026-06-30T08:00:00.000Z",
  },
];

describe("training session helpers", () => {
  it("returns the label for a known exercise", () => {
    expect(labelFor(exercises, "bench")).toBe("Bænk");
  });

  it("falls back to the raw exercise value", () => {
    expect(labelFor(exercises, "unknown")).toBe("unknown");
  });

  it("formats null weight as a dash", () => {
    expect(formatWeight(null)).toBe("-");
  });

  it("formats weights with kg", () => {
    expect(formatWeight(100)).toBe("100 kg");
    expect(formatWeight(100.25)).toBe("100.25 kg");
  });

  it("returns null for max weight when there are no sets", () => {
    expect(maxWeight([])).toBeNull();
  });

  it("returns the heaviest set weight", () => {
    const sets: TrainingSet[] = [
      {
        id: "a",
        weight: 90,
        reps: 8,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "b",
        weight: 110,
        reps: 3,
        createdAt: "2026-06-30T08:05:00.000Z",
      },
    ];

    expect(maxWeight(sets)).toBe(110);
  });
});
