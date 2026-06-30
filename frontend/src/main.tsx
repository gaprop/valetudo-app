import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  PreviousSessionSummary,
  RecipesPage,
  TrainingForm,
  TrainingSessionPanel,
  PlanPage,
} from "./components";
import {
  useExerciseCatalog,
  useIngredients,
  useRecipes,
  useTrainingLogState,
  usePlanDays,
  useTrainingSessions,
} from "./hooks";
import { labelFor } from "./trainingSessions";
import "./styles.css";

type Page = "log" | "plan" | "recipes";

function App() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [page, setPage] = useState<Page>("log");
  const {
    exercises,
    loading: exerciseLoading,
    error: exerciseError,
    creating: creatingExercise,
    deletingValue: deletingExerciseValue,
    addExercise,
    removeExercise,
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
  const ingredients = useIngredients();
  const recipes = useRecipes();
  const trainingLog = useTrainingLogState({
    today,
    exercises,
    trainingSessions,
    planDays: planDays.days,
    openTrainingSessionId,
    createTrainingSession,
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
              Valetudo
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              {page === "log"
                ? "Training log"
                : page === "plan"
                  ? "Workout plan"
                  : "Recipes"}
            </h1>
          </div>
          {page === "log" && (
            <PreviousSessionSummary
              exercises={exercises}
              previousSession={trainingLog.previousSession}
              hasSelection={trainingLog.selectedVisibleSession != null}
            />
          )}
        </header>

        <nav className="flex gap-2">
          <button
            className={`rounded border px-3 py-2 text-sm font-semibold transition ${
              page === "log"
                ? "border-primary-700 bg-primary-950/60 text-primary-100"
                : "border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white"
            }`}
            type="button"
            onClick={() => setPage("log")}
          >
            Training log
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm font-semibold transition ${
              page === "plan"
                ? "border-primary-700 bg-primary-950/60 text-primary-100"
                : "border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white"
            }`}
            type="button"
            onClick={() => setPage("plan")}
          >
            Workout plan
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm font-semibold transition ${
              page === "recipes"
                ? "border-primary-700 bg-primary-950/60 text-primary-100"
                : "border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white"
            }`}
            type="button"
            onClick={() => setPage("recipes")}
          >
            Recipes
          </button>
        </nav>

        {page === "log" ? (
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
        ) : page === "plan" ? (
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
            onDeleteItem={(dayID, itemID) =>
              void planDays.removeItem(dayID, itemID)
            }
            onAddExercise={addExercise}
            onDeleteExercise={(value) => void removeExercise(value)}
          />
        ) : (
          <RecipesPage
            recipes={recipes.recipes}
            ingredients={ingredients.ingredients}
            loading={recipes.loading}
            error={recipes.error}
            pending={recipes.pending}
            ingredientLoading={ingredients.loading}
            ingredientError={ingredients.error}
            creatingIngredient={ingredients.creating}
            updatingIngredientValue={ingredients.updatingValue}
            deletingIngredientValue={ingredients.deletingValue}
            onAddRecipe={recipes.addRecipe}
            onDeleteRecipe={(recipeID) => void recipes.removeRecipe(recipeID)}
            onAddRecipeIngredient={recipes.addRecipeIngredient}
            onUpdateRecipeIngredient={recipes.updateRecipeIngredient}
            onDeleteRecipeIngredient={(recipeID, ingredientID) =>
              void recipes.removeRecipeIngredient(recipeID, ingredientID)
            }
            onAddIngredient={ingredients.addIngredient}
            onUpdateIngredient={ingredients.updateIngredient}
            onDeleteIngredient={(value) => void ingredients.removeIngredient(value)}
          />
        )}
      </div>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
