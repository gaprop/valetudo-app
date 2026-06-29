import type {
  CreateWorkoutSetRequest,
  Exercise,
  ID,
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
    savingSetId: ID | null;
    updatingSetId: ID | null;
    deletingWorkoutId: ID | null;
    deletingSetId: ID | null;
  };
  entryErrors: Record<ID, string>;
  openWorkoutId: ID | null;
  onRefresh: () => void;
  onAddNextPlanWorkout: () => void;
  onToggleWorkout: (workoutID: ID) => void;
  onAddSet: (input: CreateWorkoutSetRequest) => Promise<boolean>;
  onUpdateSet: (input: UpdateWorkoutSetRequest) => Promise<void>;
  onDeleteWorkout: (workoutID: ID) => void;
  onDeleteSet: (workoutID: ID, setID: ID) => void;
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
      onAddSet={(workoutID: ID, form: SetForm) =>
        onAddSet({
          workoutID,
          weight: Number(form.weight),
          reps: Number(form.reps),
        })
      }
      onUpdateSet={(workoutID: ID, setID: ID, form: SetForm) =>
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
