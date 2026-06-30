import { PageNavigation, PlanPage } from "../components";
import { useExerciseCatalog, usePlanDays } from "../hooks";

export function WorkoutPlanPage() {
  const {
    exercises,
    loading: exerciseLoading,
    error: exerciseError,
    creating: creatingExercise,
    deletingValue: deletingExerciseValue,
    addExercise,
    removeExercise,
  } = useExerciseCatalog();
  const planDays = usePlanDays();

  return (
    <div className="grid gap-8">
      <header className="border-b border-neutral-800 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
          Valetudo
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Workout plan
        </h1>
        <PageNavigation />
      </header>

      <PlanPage
        exercises={exercises}
        days={planDays.days}
        loading={planDays.loading}
        pending={planDays.pending}
        error={planDays.error}
        exerciseLoading={exerciseLoading}
        exerciseError={exerciseError}
        creatingExercise={creatingExercise}
        deletingExerciseValue={deletingExerciseValue}
        onRefresh={planDays.load}
        onAddDay={planDays.addDay}
        onDeleteDay={(dayID) => void planDays.removeDay(dayID)}
        onAddItem={planDays.addItem}
        onDeleteItem={(dayID, itemID) => void planDays.removeItem(dayID, itemID)}
        onAddExercise={addExercise}
        onDeleteExercise={(value) => void removeExercise(value)}
      />
    </div>
  );
}
