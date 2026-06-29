import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  Exercise,
  ID,
  TrainingSession,
  TrainingSessionForm,
  PlanDay,
} from "../types";
import { findPreviousTrainingSessionForSelection } from "../trainingLogSelectors";
import { usePlanProgress } from "./usePlanProgress";

type UseTrainingLogPageInput = {
  today: string;
  exercises: Exercise[];
  trainingSessions: TrainingSession[];
  planDays: PlanDay[];
  openTrainingSessionId: ID | null;
  createTrainingSession: (input: TrainingSessionForm) => Promise<boolean>;
};

export function useTrainingLogState({
  today,
  exercises,
  trainingSessions,
  planDays,
  openTrainingSessionId,
  createTrainingSession,
}: UseTrainingLogPageInput) {
  const [form, setForm] = useState<TrainingSessionForm>({
    trainingDate: today,
    exerciseType: "bench",
  });
  const [selectedPlanDayId, setSelectedPlanDayId] = useState<ID | null>(null);

  const selectedPlanDay = useMemo(() => {
    return (
      planDays.find((day) => day.id === selectedPlanDayId) ||
      planDays[0] ||
      null
    );
  }, [planDays, selectedPlanDayId]);

  const selectedDateSessions = useMemo(() => {
    return trainingSessions.filter(
      (trainingSession) => trainingSession.trainingDate === form.trainingDate
    );
  }, [form.trainingDate, trainingSessions]);

  const selectedVisibleSession = useMemo(() => {
    return (
      selectedDateSessions.find((trainingSession) => trainingSession.id === openTrainingSessionId) ||
      null
    );
  }, [openTrainingSessionId, selectedDateSessions]);

  const { nextExerciseValue, advance } = usePlanProgress(
    selectedPlanDay,
    form.trainingDate
  );

  const previousSession = useMemo(
    () => findPreviousTrainingSessionForSelection(trainingSessions, selectedVisibleSession),
    [selectedVisibleSession, trainingSessions]
  );

  useEffect(() => {
    if (
      planDays.length > 0 &&
      !planDays.some((day) => day.id === selectedPlanDayId)
    ) {
      setSelectedPlanDayId(planDays[0].id);
    }
  }, [planDays, selectedPlanDayId]);

  useEffect(() => {
    if (
      exercises.length > 0 &&
      !exercises.some((exercise) => exercise.value === form.exerciseType)
    ) {
      setForm((current) => ({
        ...current,
        exerciseType: exercises[0].value,
      }));
    }
  }, [exercises, form.exerciseType]);

  async function submitTrainingSession(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createTrainingSession(form);
  }

  async function addNextPlanSession(): Promise<void> {
    if (!nextExerciseValue) {
      return;
    }

    const created = await createTrainingSession({
      trainingDate: form.trainingDate,
      exerciseType: nextExerciseValue,
    });
    if (created) {
      advance();
    }
  }

  return {
    form,
    selectedPlanDay,
    selectedDateSessions,
    selectedVisibleSession,
    nextPlanExerciseValue: nextExerciseValue,
    previousSession,
    setForm,
    setSelectedPlanDayId,
    submitTrainingSession,
    addNextPlanSession,
  };
}
