import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { recipesService } from "../services";
import { setPendingField } from "./pending";
import type {
  CreateRecipeIngredientRequest,
  CreateRecipeRequest,
  ID,
  Recipe,
  RecipeIngredient,
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

function sortRecipes(recipes: Recipe[]) {
  return [...recipes].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime() ||
      left.id.localeCompare(right.id)
  );
}

function sortRecipeIngredients(ingredients: RecipeIngredient[]) {
  return [...ingredients].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime() ||
      left.id.localeCompare(right.id)
  );
}

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
    setLoading(true);
    setError("");
    try {
      setRecipes(sortRecipes(await recipesService.listRecipes()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addRecipe(input: CreateRecipeRequest): Promise<boolean> {
    setPendingField(setPending, "creatingRecipe", true);
    setError("");

    try {
      const recipe = await recipesService.createRecipe(input);
      setRecipes((current) => sortRecipes([...current, recipe]));
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setPendingField(setPending, "creatingRecipe", false);
    }
  }

  async function removeRecipe(recipeID: ID): Promise<void> {
    setPendingField(setPending, "deletingRecipeId", recipeID);
    setError("");

    try {
      await recipesService.deleteRecipe(recipeID);
      setRecipes((current) => current.filter((recipe) => recipe.id !== recipeID));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPendingField(setPending, "deletingRecipeId", null);
    }
  }

  async function addRecipeIngredient(
    input: CreateRecipeIngredientRequest
  ): Promise<boolean> {
    setPendingField(setPending, "addingIngredientRecipeId", input.recipeID);
    setError("");

    try {
      const ingredient = await recipesService.createIngredient(input);
      setRecipes((current) =>
        updateRecipe(current, input.recipeID, (recipe) => ({
          ...recipe,
          ingredients: sortRecipeIngredients([...recipe.ingredients, ingredient]),
        }))
      );
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setPendingField(setPending, "addingIngredientRecipeId", null);
    }
  }

  async function updateRecipeIngredient(
    input: UpdateRecipeIngredientRequest
  ): Promise<boolean> {
    setPendingField(setPending, "updatingIngredientId", input.ingredientID);
    setError("");

    try {
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
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setPendingField(setPending, "updatingIngredientId", null);
    }
  }

  async function removeRecipeIngredient(
    recipeID: ID,
    ingredientID: ID
  ): Promise<void> {
    setPendingField(setPending, "deletingIngredientId", ingredientID);
    setError("");

    try {
      await recipesService.deleteIngredient(recipeID, ingredientID);
      setRecipes((current) =>
        updateRecipe(current, recipeID, (recipe) => ({
          ...recipe,
          ingredients: recipe.ingredients.filter(
            (ingredient) => ingredient.id !== ingredientID
          ),
        }))
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPendingField(setPending, "deletingIngredientId", null);
    }
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
