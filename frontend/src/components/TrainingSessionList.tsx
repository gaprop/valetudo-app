import type {
  ID,
  SetForm,
  Exercise,
  TrainingSession,
} from "../types";
import { TrainingSessionCard } from "./TrainingSessionCard";

type TrainingSessionListProps = {
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
  onAddSet: (trainingSessionID: ID, form: SetForm) => Promise<boolean>;
  onUpdateSet: (
    trainingSessionID: ID,
    setID: ID,
    form: SetForm
  ) => Promise<void>;
  onDeleteTrainingSession: (trainingSessionID: ID) => void;
  onDeleteSet: (trainingSessionID: ID, setID: ID) => void;
};

export function TrainingSessionList({
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
}: TrainingSessionListProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Training sessions</h2>
        <button
          className="rounded border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition hover:border-primary-500 hover:text-white"
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
      </div>

      <div>
        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-400">
            Loading training sessions...
          </p>
        ) : trainingSessions.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-400">
            No training sessions for this day.
          </p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {trainingSessions.map((trainingSession) => (
              <TrainingSessionCard
                key={trainingSession.id}
                trainingSession={trainingSession}
                exercises={exercises}
                error={entryErrors[trainingSession.id] || ""}
                savingSetId={pending.savingSetId}
                updatingSetId={pending.updatingSetId}
                deletingTrainingSessionId={pending.deletingTrainingSessionId}
                deletingSetId={pending.deletingSetId}
                isOpen={openTrainingSessionId === trainingSession.id}
                onToggle={() => onToggleTrainingSession(trainingSession.id)}
                onAddSet={(form: SetForm) => onAddSet(trainingSession.id, form)}
                onUpdateSet={(setID, form) =>
                  onUpdateSet(trainingSession.id, setID, form)
                }
                onDeleteTrainingSession={() => onDeleteTrainingSession(trainingSession.id)}
                onDeleteSet={(setID) => onDeleteSet(trainingSession.id, setID)}
              />
            ))}
          </div>
        )}

        <div className="border-t border-neutral-800 bg-neutral-950/60 px-5 py-4">
          <button
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={onAddNextPlanSession}
            disabled={!nextPlanExerciseLabel || pending.savingEntry}
          >
            {nextPlanExerciseLabel && selectedPlanDayName
              ? `Add next from ${selectedPlanDayName}: ${nextPlanExerciseLabel}`
              : "Add next from workout plan"}
          </button>
        </div>
      </div>
    </section>
  );
}
