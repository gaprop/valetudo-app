import type { TrainingSession } from "./types";

export function findPreviousTrainingSessionForSelection(
  trainingSessions: TrainingSession[],
  selectedSession: TrainingSession | null
): TrainingSession | undefined {
  if (!selectedSession) {
    return undefined;
  }

  return [...trainingSessions].reverse().find((trainingSession) => {
    if (
      trainingSession.exerciseType !== selectedSession.exerciseType ||
      trainingSession.sets.length === 0
    ) {
      return false;
    }

    if (trainingSession.trainingDate !== selectedSession.trainingDate) {
      return trainingSession.trainingDate < selectedSession.trainingDate;
    }

    return (
      Date.parse(trainingSession.createdAt) < Date.parse(selectedSession.createdAt) ||
      trainingSession.id.localeCompare(selectedSession.id) < 0
    );
  });
}
