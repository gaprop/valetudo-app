import { useEffect, useState } from "react";
import { nutritionForGrams } from "../recipeNutrition";
import type {
  ID,
  Ingredient,
  RecipeIngredient,
  UpdateRecipeIngredientRequest,
} from "../types";

type UseRecipeIngredientFormInput = {
  recipeID: ID;
  ingredient: RecipeIngredient;
  ingredients: Ingredient[];
  onUpdateIngredient: (
    input: UpdateRecipeIngredientRequest
  ) => Promise<boolean>;
};

function recipeIngredientToForm(ingredient: RecipeIngredient) {
  return {
    ingredientValue: ingredient.ingredientValue,
    amountGrams: String(ingredient.amountGrams),
    calories: String(ingredient.calories),
    protein: String(ingredient.protein),
  };
}

export function useRecipeIngredientForm({
  recipeID,
  ingredient,
  ingredients,
  onUpdateIngredient,
}: UseRecipeIngredientFormInput) {
  const [form, setForm] = useState(() => recipeIngredientToForm(ingredient));

  useEffect(() => {
    setForm(recipeIngredientToForm(ingredient));
  }, [ingredient]);

  function ingredientDefaults(ingredientValue: string, amountGrams: string) {
    const catalogIngredient =
      ingredients.find((item) => item.value === ingredientValue) || null;
    if (!catalogIngredient || !amountGrams) {
      return null;
    }

    return {
      calories: String(
        nutritionForGrams(catalogIngredient.caloriesPer100g, amountGrams)
      ),
      protein: String(
        nutritionForGrams(catalogIngredient.proteinPer100g, amountGrams)
      ),
    };
  }

  function setIngredientValue(ingredientValue: string) {
    setForm((current) => ({
      ...current,
      ingredientValue,
      ...ingredientDefaults(ingredientValue, current.amountGrams),
    }));
  }

  function setAmountGrams(amountGrams: string) {
    setForm((current) => ({
      ...current,
      amountGrams,
      ...ingredientDefaults(current.ingredientValue, amountGrams),
    }));
  }

  function setCalories(calories: string) {
    setForm((current) => ({ ...current, calories }));
  }

  function setProtein(protein: string) {
    setForm((current) => ({ ...current, protein }));
  }

  const hasChanges =
    form.ingredientValue !== ingredient.ingredientValue ||
    Number(form.amountGrams) !== ingredient.amountGrams ||
    Number(form.calories) !== ingredient.calories ||
    Number(form.protein) !== ingredient.protein;

  async function save() {
    const saved = await onUpdateIngredient({
      recipeID,
      ingredientID: ingredient.id,
      ingredientValue: form.ingredientValue,
      amountGrams: Number(form.amountGrams),
      calories: Number(form.calories),
      protein: Number(form.protein),
    });
    if (!saved) {
      setForm(recipeIngredientToForm(ingredient));
    }
  }

  return {
    form,
    hasChanges,
    save,
    setIngredientValue,
    setAmountGrams,
    setCalories,
    setProtein,
  };
}
