import { api } from "../api";
import type {
  CreateRecipeIngredientRequest,
  CreateRecipeRequest,
  ID,
  Recipe,
  RecipeIngredient,
  UpdateRecipeIngredientRequest,
} from "../types";

export const recipesService = {
  async listRecipes(): Promise<Recipe[]> {
    const response = await api.get<Recipe[]>("/api/recipes");
    return response.data;
  },

  async createRecipe(input: CreateRecipeRequest): Promise<Recipe> {
    const response = await api.post<Recipe>("/api/recipes", input);
    return response.data;
  },

  async deleteRecipe(recipeID: ID): Promise<void> {
    await api.delete(`/api/recipes/${recipeID}`);
  },

  async createIngredient(
    input: CreateRecipeIngredientRequest
  ): Promise<RecipeIngredient> {
    const { recipeID, ...body } = input;
    const response = await api.post<RecipeIngredient>(
      `/api/recipes/${recipeID}/ingredients`,
      body
    );
    return response.data;
  },

  async updateIngredient(
    input: UpdateRecipeIngredientRequest
  ): Promise<RecipeIngredient> {
    const { recipeID, ingredientID, ...body } = input;
    const response = await api.patch<RecipeIngredient>(
      `/api/recipes/${recipeID}/ingredients/${ingredientID}`,
      body
    );
    return response.data;
  },

  async deleteIngredient(recipeID: ID, ingredientID: ID): Promise<void> {
    await api.delete(`/api/recipes/${recipeID}/ingredients/${ingredientID}`);
  },
};
