import type {
  Exercise,
  Ingredient,
  PlanDay,
  PlanExercise,
  Recipe,
  RecipeIngredient,
  TrainingSession,
  TrainingSet,
} from "./types";

function compareCreatedAtThenId(
  left: { createdAt: string; id: string },
  right: { createdAt: string; id: string }
) {
  return (
    Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

export function sortTrainingSessions(trainingSessions: TrainingSession[]): TrainingSession[] {
  return [...trainingSessions].sort((a, b) => {
    if (a.trainingDate !== b.trainingDate) {
      return a.trainingDate.localeCompare(b.trainingDate);
    }
    return compareCreatedAtThenId(a, b);
  });
}

export function sortTrainingSets(sets: TrainingSet[]): TrainingSet[] {
  return [...sets].sort(compareCreatedAtThenId);
}

export function sortPlanDays(days: PlanDay[]): PlanDay[] {
  return [...days].sort(compareCreatedAtThenId);
}

export function sortPlanItems(items: PlanExercise[]): PlanExercise[] {
  return [...items].sort(compareCreatedAtThenId);
}

export function sortRecipes(recipes: Recipe[]): Recipe[] {
  return [...recipes].sort(compareCreatedAtThenId);
}

export function sortRecipeIngredients(
  ingredients: RecipeIngredient[]
): RecipeIngredient[] {
  return [...ingredients].sort(compareCreatedAtThenId);
}

export function sortIngredients(ingredients: Ingredient[]): Ingredient[] {
  return [...ingredients].sort((left, right) =>
    left.label.localeCompare(right.label) || left.value.localeCompare(right.value)
  );
}

export function sortExercises(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((left, right) =>
    left.label.localeCompare(right.label) || left.value.localeCompare(right.value)
  );
}
