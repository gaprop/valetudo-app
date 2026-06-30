import type { ID } from "./common";

export type IngredientValue = string;

export type Ingredient = {
  value: IngredientValue;
  label: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  createdAt: string;
};

export type RecipeIngredient = {
  id: ID;
  ingredientValue: IngredientValue;
  amountGrams: number;
  calories: number;
  protein: number;
  createdAt: string;
};

export type Recipe = {
  id: ID;
  name: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
};

export type CreateRecipeRequest = {
  name: string;
};

export type IngredientRequest = {
  label: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

export type RecipeIngredientRequest = {
  ingredientValue: IngredientValue;
  amountGrams: number;
  calories: number;
  protein: number;
};

export type CreateRecipeIngredientRequest = RecipeIngredientRequest & {
  recipeID: ID;
};

export type UpdateRecipeIngredientRequest = RecipeIngredientRequest & {
  recipeID: ID;
  ingredientID: ID;
};
