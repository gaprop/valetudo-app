import { api } from "../api";
import type { Ingredient, IngredientRequest } from "../types";

export const ingredientsService = {
  async listIngredients(): Promise<Ingredient[]> {
    const response = await api.get<Ingredient[]>("/api/ingredients");
    return response.data;
  },

  async createIngredient(input: IngredientRequest): Promise<Ingredient> {
    const response = await api.post<Ingredient>("/api/ingredients", input);
    return response.data;
  },

  async updateIngredient(
    value: string,
    input: IngredientRequest
  ): Promise<Ingredient> {
    const response = await api.patch<Ingredient>(
      `/api/ingredients/${encodeURIComponent(value)}`,
      input
    );
    return response.data;
  },

  async deleteIngredient(value: string): Promise<void> {
    await api.delete(`/api/ingredients/${encodeURIComponent(value)}`);
  },
};
