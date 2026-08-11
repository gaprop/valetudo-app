import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { ingredientsService } from "../services";
import { sortIngredients } from "../sorting";
import type { Ingredient, IngredientRequest } from "../types";
import { runAsyncAction } from "./asyncAction";

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [updatingValue, setUpdatingValue] = useState<string | null>(null);
  const [deletingValue, setDeletingValue] = useState<string | null>(null);

  const load = useCallback(async () => {
    await runAsyncAction({
      before: () => {
        setLoading(true);
        setError("");
      },
      action: async () => {
        setIngredients(sortIngredients(await ingredientsService.listIngredients()));
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setLoading(false),
      fallback: undefined,
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addIngredient(input: IngredientRequest): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setCreating(true);
        setError("");
      },
      action: async () => {
        const ingredient = await ingredientsService.createIngredient(input);
        setIngredients((current) => sortIngredients([...current, ingredient]));
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setCreating(false),
      fallback: false,
    });
  }

  async function updateIngredient(
    value: string,
    input: IngredientRequest
  ): Promise<boolean> {
    return runAsyncAction({
      before: () => {
        setUpdatingValue(value);
        setError("");
      },
      action: async () => {
        const ingredient = await ingredientsService.updateIngredient(value, input);
        setIngredients((current) =>
          sortIngredients(
            current.map((item) => (item.value === value ? ingredient : item))
          )
        );
        return true;
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setUpdatingValue(null),
      fallback: false,
    });
  }

  async function removeIngredient(value: string): Promise<void> {
    await runAsyncAction({
      before: () => {
        setDeletingValue(value);
        setError("");
      },
      action: async () => {
        await ingredientsService.deleteIngredient(value);
        setIngredients((current) =>
          current.filter((ingredient) => ingredient.value !== value)
        );
      },
      onError: (error) => setError(errorMessage(error)),
      after: () => setDeletingValue(null),
      fallback: undefined,
    });
  }

  return {
    ingredients,
    loading,
    error,
    creating,
    updatingValue,
    deletingValue,
    load,
    addIngredient,
    updateIngredient,
    removeIngredient,
  };
}
