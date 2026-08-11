import {
  sortExercises,
  sortIngredients,
  sortPlanItems,
  sortRecipeIngredients,
  sortRecipes,
  sortTrainingSessions,
  sortTrainingSets,
} from "./sorting";
import type {
  Exercise,
  Ingredient,
  PlanExercise,
  Recipe,
  RecipeIngredient,
  TrainingSession,
  TrainingSet,
} from "./types";

describe("sorting helpers", () => {
  it("sorts training sessions by date, created time, then id", () => {
    const sessions: TrainingSession[] = [
      {
        id: "c",
        trainingDate: "2026-06-30",
        exerciseType: "bench",
        sets: [],
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "b",
        trainingDate: "2026-06-29",
        exerciseType: "bench",
        sets: [],
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        trainingDate: "2026-06-30",
        exerciseType: "bench",
        sets: [],
        createdAt: "2026-06-30T07:00:00.000Z",
      },
    ];

    expect(sortTrainingSessions(sessions).map((session) => session.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("sorts training sets by created time, then id", () => {
    const sets: TrainingSet[] = [
      {
        id: "b",
        weight: 100,
        reps: 5,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        weight: 90,
        reps: 8,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "c",
        weight: 80,
        reps: 10,
        createdAt: "2026-06-30T07:00:00.000Z",
      },
    ];

    expect(sortTrainingSets(sets).map((set) => set.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("sorts plan items by created time, then id", () => {
    const items: PlanExercise[] = [
      {
        id: "b",
        exerciseType: "bench",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        exerciseType: "squat",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ];

    expect(sortPlanItems(items).map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("sorts recipes by created time, then id", () => {
    const recipes: Recipe[] = [
      {
        id: "b",
        name: "B",
        ingredients: [],
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        name: "A",
        ingredients: [],
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ];

    expect(sortRecipes(recipes).map((recipe) => recipe.id)).toEqual(["a", "b"]);
  });

  it("sorts recipe ingredients by created time, then id", () => {
    const ingredients: RecipeIngredient[] = [
      {
        id: "b",
        ingredientValue: "rice",
        amountGrams: 100,
        calories: 100,
        protein: 2,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        id: "a",
        ingredientValue: "chicken",
        amountGrams: 100,
        calories: 120,
        protein: 25,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ];

    expect(sortRecipeIngredients(ingredients).map((item) => item.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("sorts catalog ingredients by label, then value", () => {
    const ingredients: Ingredient[] = [
      {
        value: "rice-b",
        label: "Rice",
        caloriesPer100g: 100,
        proteinPer100g: 2,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        value: "apple",
        label: "Apple",
        caloriesPer100g: 52,
        proteinPer100g: 0.3,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        value: "rice-a",
        label: "Rice",
        caloriesPer100g: 100,
        proteinPer100g: 2,
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ];

    expect(sortIngredients(ingredients).map((item) => item.value)).toEqual([
      "apple",
      "rice-a",
      "rice-b",
    ]);
  });

  it("sorts exercises by label, then value", () => {
    const exercises: Exercise[] = [
      {
        value: "bench-b",
        label: "Bench",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        value: "squat",
        label: "Squat",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
      {
        value: "bench-a",
        label: "Bench",
        createdAt: "2026-06-30T08:00:00.000Z",
      },
    ];

    expect(sortExercises(exercises).map((item) => item.value)).toEqual([
      "bench-a",
      "bench-b",
      "squat",
    ]);
  });
});
