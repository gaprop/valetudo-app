import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { recipesService } from "../services";
import { sortRecipeIngredients, sortRecipes } from "../sorting";
import { runAsyncAction } from "./asyncAction";
import { setPendingField } from "./pending";
import type {
  CreateRecipeIngredientRequest,
  CreateRecipeRequest,
  ID,
  Recipe,
  UpdateRecipeIngredientRequest,
} from "../types";

export type RecipesPendingState = {
  creatingRecipe: boolean;
  deletingRecipeId: ID | null;
  addingIngredientRecipeId: ID | null;
  updatingIngredientId: ID | null;
  deletingIngredientId: ID | null;
};

const initialPendingState: RecipesPendingState = {
  creatingRecipe: false,
  deletingRecipeId: null,
  addingIngredientRecipeId: null,
  updatingIngredientId: null,
  deletingIngredientId: null,
};

function updateRecipe(
  recipes: Recipe[],
  recipeID: ID,
  update: (recipe: Recipe) => Recipe
): Recipe[] {
  return recipes.map((recipe) =>
    recipe.id === recipeID ? update(recipe) : recipe
  );
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] =
    useState<RecipesPendingState>(initialPendingState);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    await runAsyncAction({
      before: () => {
        setLoading(true);
        setError("");
      },
      action: async () => {
        setRecipes(sortRecipes(await recipesService.listRecipes()));
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setLoading(false),
      fallback: undefined,
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addRecipe(input: CreateRecipeRequest): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPendingField(setPending, "creatingRecipe", true);
        setError("");
      },
      action: async () => {
        const recipe = await recipesService.createRecipe(input);
        setRecipes((current) => sortRecipes([...current, recipe]));
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "creatingRecipe", false),
      fallback: false,
    });
  }

  async function removeRecipe(recipeID: ID): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPendingField(setPending, "deletingRecipeId", recipeID);
        setError("");
      },
      action: async () => {
        await recipesService.deleteRecipe(recipeID);
        setRecipes((current) =>
          current.filter((recipe) => recipe.id !== recipeID)
        );
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "deletingRecipeId", null),
      fallback: undefined,
    });
  }

  async function addRecipeIngredient(
    input: CreateRecipeIngredientRequest
  ): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPendingField(setPending, "addingIngredientRecipeId", input.recipeID);
        setError("");
      },
      action: async () => {
        const ingredient = await recipesService.createIngredient(input);
        setRecipes((current) =>
          updateRecipe(current, input.recipeID, (recipe) => ({
            ...recipe,
            ingredients: sortRecipeIngredients([...recipe.ingredients, ingredient]),
          }))
        );
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "addingIngredientRecipeId", null),
      fallback: false,
    });
  }

  async function updateRecipeIngredient(
    input: UpdateRecipeIngredientRequest
  ): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setPendingField(setPending, "updatingIngredientId", input.ingredientID);
        setError("");
      },
      action: async () => {
        const ingredient = await recipesService.updateIngredient(input);
        setRecipes((current) =>
          updateRecipe(current, input.recipeID, (recipe) => ({
            ...recipe,
            ingredients: sortRecipeIngredients(
              recipe.ingredients.map((item) =>
                item.id === input.ingredientID ? ingredient : item
              )
            ),
          }))
        );
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "updatingIngredientId", null),
      fallback: false,
    });
  }

  async function removeRecipeIngredient(
    recipeID: ID,
    ingredientID: ID
  ): Promise<void> {
    await runAsyncAction({
      before: () => {
        setPendingField(setPending, "deletingIngredientId", ingredientID);
        setError("");
      },
      action: async () => {
        await recipesService.deleteIngredient(recipeID, ingredientID);
        setRecipes((current) =>
          updateRecipe(current, recipeID, (recipe) => ({
            ...recipe,
            ingredients: recipe.ingredients.filter(
              (ingredient) => ingredient.id !== ingredientID
            ),
          }))
        );
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setPendingField(setPending, "deletingIngredientId", null),
      fallback: undefined,
    });
  }

  return {
    recipes,
    loading,
    pending,
    error,
    load,
    addRecipe,
    removeRecipe,
    addRecipeIngredient,
    updateRecipeIngredient,
    removeRecipeIngredient,
  };
}
