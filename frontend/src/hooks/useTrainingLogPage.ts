import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  Exercise,
  ID,
  Workout,
  WorkoutForm,
  WorkoutPlanDay,
} from "../types";
import { findPreviousWorkoutForSelection } from "../trainingLog";
import { useWorkoutPlanProgress } from "./useWorkoutPlanProgress";

type UseTrainingLogPageInput = {
  today: string;
  exercises: Exercise[];
  workouts: Workout[];
  planDays: WorkoutPlanDay[];
  openWorkoutId: ID | null;
  createEntry: (input: WorkoutForm) => Promise<boolean>;
};

export function useTrainingLogPage({
  today,
  exercises,
  workouts,
  planDays,
  openWorkoutId,
  createEntry,
}: UseTrainingLogPageInput) {
  const [form, setForm] = useState<WorkoutForm>({
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

  const selectedDateWorkouts = useMemo(() => {
    return workouts.filter(
      (workout) => workout.trainingDate === form.trainingDate
    );
  }, [form.trainingDate, workouts]);

  const selectedVisibleWorkout = useMemo(() => {
    return (
      selectedDateWorkouts.find((workout) => workout.id === openWorkoutId) ||
      null
    );
  }, [openWorkoutId, selectedDateWorkouts]);

  const { nextExerciseValue, advance } = useWorkoutPlanProgress(
    selectedPlanDay,
    form.trainingDate
  );

  const previousWorkout = useMemo(
    () => findPreviousWorkoutForSelection(workouts, selectedVisibleWorkout),
    [selectedVisibleWorkout, workouts]
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

  async function submitWorkout(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createEntry(form);
  }

  async function addNextPlanWorkout(): Promise<void> {
    if (!nextExerciseValue) {
      return;
    }

    const created = await createEntry({
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
    selectedDateWorkouts,
    selectedVisibleWorkout,
    nextPlanExerciseValue: nextExerciseValue,
    previousWorkout,
    setForm,
    setSelectedPlanDayId,
    submitWorkout,
    addNextPlanWorkout,
  };
}
