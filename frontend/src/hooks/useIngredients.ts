import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api";
import { ingredientsService } from "../services";
import type { Ingredient, IngredientRequest } from "../types";

function sortIngredients(ingredients: Ingredient[]) {
  return [...ingredients].sort((left, right) =>
    left.label.localeCompare(right.label) || left.value.localeCompare(right.value)
  );
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [updatingValue, setUpdatingValue] = useState<string | null>(null);
  const [deletingValue, setDeletingValue] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setIngredients(sortIngredients(await ingredientsService.listIngredients()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addIngredient(input: IngredientRequest): Promise<boolean> {
    setCreating(true);
    setError("");

    try {
      const ingredient = await ingredientsService.createIngredient(input);
      setIngredients((current) => sortIngredients([...current, ingredient]));
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function updateIngredient(
    value: string,
    input: IngredientRequest
  ): Promise<boolean> {
    setUpdatingValue(value);
    setError("");

    try {
      const ingredient = await ingredientsService.updateIngredient(value, input);
      setIngredients((current) =>
        sortIngredients(
          current.map((item) => (item.value === value ? ingredient : item))
        )
      );
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setUpdatingValue(null);
    }
  }

  async function removeIngredient(value: string): Promise<void> {
    setDeletingValue(value);
    setError("");

    try {
      await ingredientsService.deleteIngredient(value);
      setIngredients((current) =>
        current.filter((ingredient) => ingredient.value !== value)
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingValue(null);
    }
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
