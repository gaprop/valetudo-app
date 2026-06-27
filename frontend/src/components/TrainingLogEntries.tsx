import type {
  CreateWorkoutSetRequest,
  Exercise,
  SetForm,
  UpdateWorkoutSetRequest,
  Workout,
} from "../types";
import { EntriesList } from "./EntriesList";

type TrainingLogEntriesProps = {
  workouts: Workout[];
  exercises: Exercise[];
  loading: boolean;
  nextPlanExerciseLabel: string | null;
  selectedPlanDayName: string | null;
  pending: {
    savingEntry: boolean;
    savingSetId: number | null;
    updatingSetId: number | null;
    deletingWorkoutId: number | null;
    deletingSetId: number | null;
  };
  entryErrors: Record<number, string>;
  openWorkoutId: number | null;
  onRefresh: () => void;
  onAddNextPlanWorkout: () => void;
  onToggleWorkout: (workoutID: number) => void;
  onAddSet: (input: CreateWorkoutSetRequest) => Promise<boolean>;
  onUpdateSet: (input: UpdateWorkoutSetRequest) => Promise<void>;
  onDeleteWorkout: (workoutID: number) => void;
  onDeleteSet: (workoutID: number, setID: number) => void;
};

export function TrainingLogEntries({
  workouts,
  exercises,
  loading,
  nextPlanExerciseLabel,
  selectedPlanDayName,
  pending,
  entryErrors,
  openWorkoutId,
  onRefresh,
  onAddNextPlanWorkout,
  onToggleWorkout,
  onAddSet,
  onUpdateSet,
  onDeleteWorkout,
  onDeleteSet,
}: TrainingLogEntriesProps) {
  return (
    <EntriesList
      workouts={workouts}
      exercises={exercises}
      loading={loading}
      nextPlanExerciseLabel={nextPlanExerciseLabel}
      selectedPlanDayName={selectedPlanDayName}
      pending={pending}
      entryErrors={entryErrors}
      openWorkoutId={openWorkoutId}
      onRefresh={onRefresh}
      onAddNextPlanWorkout={onAddNextPlanWorkout}
      onToggleWorkout={onToggleWorkout}
      onAddSet={(workoutID: number, form: SetForm) =>
        onAddSet({
          workoutID,
          weight: Number(form.weight),
          reps: Number(form.reps),
        })
      }
      onUpdateSet={(workoutID: number, setID: number, form: SetForm) =>
        onUpdateSet({
          workoutID,
          setID,
          weight: Number(form.weight),
          reps: Number(form.reps),
        })
      }
      onDeleteWorkout={onDeleteWorkout}
      onDeleteSet={onDeleteSet}
    />
  );
}
