import { useMemo } from "react";
import {
  PageHeader,
  PreviousSessionSummary,
  TrainingForm,
  TrainingSessionPanel,
} from "../components";
import {
  useExerciseCatalog,
  usePlanDays,
  useTrainingLogState,
  useTrainingSessions,
} from "../hooks";
import { labelFor } from "../trainingSessions";

export function TrainingLogPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const {
    exercises,
    error: exerciseError,
  } = useExerciseCatalog();
  const {
    trainingSessions,
    loading,
    pending,
    formError,
    entryErrors,
    openTrainingSessionId,
    load,
    createTrainingSession,
    deleteTrainingSession,
    addSet,
    updateSet,
    removeSet,
    toggleTrainingSession,
  } = useTrainingSessions();
  const planDays = usePlanDays();
  const trainingLog = useTrainingLogState({
    today,
    exercises,
    trainingSessions,
    planDays: planDays.days,
    openTrainingSessionId,
    createTrainingSession,
  });

  return (
    <div className="grid gap-5 sm:gap-8">
      <PageHeader
        title="Training log"
        aside={
          <PreviousSessionSummary
            exercises={exercises}
            previousSession={trainingLog.previousSession}
            hasSelection={trainingLog.selectedVisibleSession != null}
          />
        }
      />

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-[340px_1fr]">
        <TrainingForm
          form={trainingLog.form}
          exercises={exercises}
          planDays={planDays.days}
          selectedPlanDayId={trainingLog.selectedPlanDay?.id ?? null}
          error={formError}
          savingEntry={pending.savingEntry}
          onChange={trainingLog.setForm}
          onPlanDayChange={trainingLog.setSelectedPlanDayId}
          onSubmit={trainingLog.submitTrainingSession}
        />
        <div className="grid content-start gap-4">
          {(exerciseError || planDays.error) && (
            <div className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
              {exerciseError || planDays.error}
            </div>
          )}
          <TrainingSessionPanel
            trainingSessions={trainingLog.selectedDateSessions}
            exercises={exercises}
            loading={loading}
            nextPlanExerciseLabel={
              trainingLog.nextPlanExerciseValue
                ? labelFor(exercises, trainingLog.nextPlanExerciseValue)
                : null
            }
            selectedPlanDayName={trainingLog.selectedPlanDay?.name || null}
            pending={pending}
            entryErrors={entryErrors}
            openTrainingSessionId={openTrainingSessionId}
            onRefresh={load}
            onAddNextPlanSession={() => void trainingLog.addNextPlanSession()}
            onToggleTrainingSession={toggleTrainingSession}
            onAddSet={addSet}
            onUpdateSet={updateSet}
            onDeleteTrainingSession={deleteTrainingSession}
            onDeleteSet={removeSet}
          />
        </div>
      </section>
    </div>
  );
}
