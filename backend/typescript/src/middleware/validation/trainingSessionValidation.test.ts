import {
  validateTrainingSessionInput,
  validateTrainingSetInput,
} from "./trainingSessionValidation";
import { HttpError } from "../errors";

describe("training session validation", () => {
  it("validates training session input", () => {
    expect(
      validateTrainingSessionInput({
        trainingDate: "2026-06-30",
        exerciseType: "bench",
        ignored: true,
      })
    ).toEqual({
      trainingDate: "2026-06-30",
      exerciseType: "bench",
    });
  });

  it("rejects invalid training dates", () => {
    expect(() =>
      validateTrainingSessionInput({
        trainingDate: "30-06-2026",
        exerciseType: "bench",
      })
    ).toThrow(HttpError);
  });

  it("validates training set input", () => {
    expect(validateTrainingSetInput({ weight: "100", reps: "5" })).toEqual({
      weight: 100,
      reps: 5,
    });
  });

  it("rejects invalid reps", () => {
    expect(() => validateTrainingSetInput({ weight: 100, reps: 0 })).toThrow(
      HttpError
    );
  });
});
