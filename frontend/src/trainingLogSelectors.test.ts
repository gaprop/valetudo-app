import { findPreviousTrainingSessionForSelection } from "./trainingLogSelectors";
import type { TrainingSession } from "./types";

function session(
  id: string,
  exerciseType: string,
  trainingDate: string,
  createdAt: string,
  hasSets = true
): TrainingSession {
  return {
    id,
    trainingDate,
    exerciseType,
    createdAt,
    sets: hasSets
      ? [
          {
            id: `${id}-set`,
            weight: 100,
            reps: 5,
            createdAt,
          },
        ]
      : [],
  };
}

describe("findPreviousTrainingSessionForSelection", () => {
  it("returns undefined when nothing is selected", () => {
    expect(findPreviousTrainingSessionForSelection([], null)).toBeUndefined();
  });

  it("only considers matching exercise sessions with sets", () => {
    const selected = session(
      "selected",
      "bench",
      "2026-06-30",
      "2026-06-30T10:00:00.000Z"
    );
    const wrongExercise = session(
      "wrong",
      "squat",
      "2026-06-29",
      "2026-06-29T10:00:00.000Z"
    );
    const noSets = session(
      "empty",
      "bench",
      "2026-06-29",
      "2026-06-29T10:00:00.000Z",
      false
    );

    expect(
      findPreviousTrainingSessionForSelection([wrongExercise, noSets], selected)
    ).toBeUndefined();
  });

  it("finds an older date for the same exercise", () => {
    const selected = session(
      "selected",
      "bench",
      "2026-06-30",
      "2026-06-30T10:00:00.000Z"
    );
    const previous = session(
      "previous",
      "bench",
      "2026-06-29",
      "2026-06-29T10:00:00.000Z"
    );

    expect(
      findPreviousTrainingSessionForSelection([previous, selected], selected)
    ).toBe(previous);
  });

  it("uses createdAt and id for same-day previous sessions", () => {
    const selected = session(
      "selected",
      "bench",
      "2026-06-30",
      "2026-06-30T10:00:00.000Z"
    );
    const previousSameDay = session(
      "previous",
      "bench",
      "2026-06-30",
      "2026-06-30T09:00:00.000Z"
    );

    expect(
      findPreviousTrainingSessionForSelection(
        [previousSameDay, selected],
        selected
      )
    ).toBe(previousSameDay);
  });
});
