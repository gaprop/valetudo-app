import { PageHeader, PlanPage } from "../components";
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
    <div className="grid gap-5 sm:gap-8">
      <PageHeader title="Workout plan" />

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
