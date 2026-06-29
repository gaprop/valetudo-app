import type {
  CreateTrainingSetRequest,
  Exercise,
  ID,
  SetForm,
  UpdateTrainingSetRequest,
  TrainingSession,
} from "../types";
import { TrainingSessionList } from "./TrainingSessionList";

type TrainingSessionPanelProps = {
  trainingSessions: TrainingSession[];
  exercises: Exercise[];
  loading: boolean;
  nextPlanExerciseLabel: string | null;
  selectedPlanDayName: string | null;
  pending: {
    savingEntry: boolean;
    savingSetId: ID | null;
    updatingSetId: ID | null;
    deletingTrainingSessionId: ID | null;
    deletingSetId: ID | null;
  };
  entryErrors: Record<ID, string>;
  openTrainingSessionId: ID | null;
  onRefresh: () => void;
  onAddNextPlanSession: () => void;
  onToggleTrainingSession: (trainingSessionID: ID) => void;
  onAddSet: (input: CreateTrainingSetRequest) => Promise<boolean>;
  onUpdateSet: (input: UpdateTrainingSetRequest) => Promise<void>;
  onDeleteTrainingSession: (trainingSessionID: ID) => void;
  onDeleteSet: (trainingSessionID: ID, setID: ID) => void;
};

export function TrainingSessionPanel({
  trainingSessions,
  exercises,
  loading,
  nextPlanExerciseLabel,
  selectedPlanDayName,
  pending,
  entryErrors,
  openTrainingSessionId,
  onRefresh,
  onAddNextPlanSession,
  onToggleTrainingSession,
  onAddSet,
  onUpdateSet,
  onDeleteTrainingSession,
  onDeleteSet,
}: TrainingSessionPanelProps) {
  return (
    <TrainingSessionList
      trainingSessions={trainingSessions}
      exercises={exercises}
      loading={loading}
      nextPlanExerciseLabel={nextPlanExerciseLabel}
      selectedPlanDayName={selectedPlanDayName}
      pending={pending}
      entryErrors={entryErrors}
      openTrainingSessionId={openTrainingSessionId}
      onRefresh={onRefresh}
      onAddNextPlanSession={onAddNextPlanSession}
      onToggleTrainingSession={onToggleTrainingSession}
      onAddSet={(trainingSessionID: ID, form: SetForm) =>
        onAddSet({
          trainingSessionID,
          weight: Number(form.weight),
          reps: Number(form.reps),
        })
      }
      onUpdateSet={(trainingSessionID: ID, setID: ID, form: SetForm) =>
        onUpdateSet({
          trainingSessionID,
          setID,
          weight: Number(form.weight),
          reps: Number(form.reps),
        })
      }
      onDeleteTrainingSession={onDeleteTrainingSession}
      onDeleteSet={onDeleteSet}
    />
  );
}
