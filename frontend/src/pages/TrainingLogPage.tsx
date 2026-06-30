import { useMemo } from "react";
import {
  PageNavigation,
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
  const { exercises } = useExerciseCatalog();
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
    <div className="grid gap-8">
      <header className="flex flex-col gap-3 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
            Valetudo
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Training log
          </h1>
          <PageNavigation />
        </div>
        <PreviousSessionSummary
          exercises={exercises}
          previousSession={trainingLog.previousSession}
          hasSelection={trainingLog.selectedVisibleSession != null}
        />
      </header>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
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
      </section>
    </div>
  );
}
