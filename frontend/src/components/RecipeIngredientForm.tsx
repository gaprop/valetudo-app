import { useEffect, useState, type FormEvent } from "react";
import type { CreateRecipeIngredientRequest, ID, Ingredient } from "../types";
import { nutritionForGrams } from "../recipeNutrition";

type RecipeIngredientFormProps = {
  recipeID: ID;
  ingredients: Ingredient[];
  adding: boolean;
  onAddIngredient: (input: CreateRecipeIngredientRequest) => Promise<boolean>;
};

export function RecipeIngredientForm({
  recipeID,
  ingredients,
  adding,
  onAddIngredient,
}: RecipeIngredientFormProps) {
  const [ingredientValue, setIngredientValue] = useState("");
  const [amountGrams, setAmountGrams] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [nutritionEdited, setNutritionEdited] = useState(false);

  useEffect(() => {
    if (
      ingredients.length > 0 &&
      !ingredients.some((ingredient) => ingredient.value === ingredientValue)
    ) {
      setIngredientValue(ingredients[0].value);
    }
    if (ingredients.length === 0 && ingredientValue !== "") {
      setIngredientValue("");
    }
  }, [ingredients, ingredientValue]);

  const selectedIngredient =
    ingredients.find((ingredient) => ingredient.value === ingredientValue) ||
    null;

  useEffect(() => {
    if (!selectedIngredient || !amountGrams || nutritionEdited) {
      return;
    }

    setCalories(
      String(nutritionForGrams(selectedIngredient.caloriesPer100g, amountGrams))
    );
    setProtein(
      String(nutritionForGrams(selectedIngredient.proteinPer100g, amountGrams))
    );
  }, [amountGrams, nutritionEdited, selectedIngredient]);

  async function handleAddIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const added = await onAddIngredient({
      recipeID,
      ingredientValue,
      amountGrams: Number(amountGrams),
      calories: Number(calories),
      protein: Number(protein),
    });
    if (added) {
      setAmountGrams("");
      setCalories("");
      setProtein("");
      setNutritionEdited(false);
    }
  }

  return (
    <form
      className="grid gap-3 border-t border-neutral-800 pt-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] lg:items-end"
      onSubmit={handleAddIngredient}
    >
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Ingredient
        <select
          className="input py-2"
          value={ingredientValue}
          onChange={(event) => {
            setIngredientValue(event.target.value);
            setNutritionEdited(false);
          }}
          disabled={ingredients.length === 0}
          required
        >
          {ingredients.length === 0 ? (
            <option value="">No ingredients</option>
          ) : (
            ingredients.map((ingredient) => (
              <option key={ingredient.value} value={ingredient.value}>
                {ingredient.label}
              </option>
            ))
          )}
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Grams
        <input
          className="input py-2"
          type="number"
          min="0.01"
          step="0.01"
          value={amountGrams}
          onChange={(event) => {
            setAmountGrams(event.target.value);
            setNutritionEdited(false);
          }}
          placeholder="100"
          required
        />
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Calories
        <input
          className="input py-2"
          type="number"
          min="0"
          step="0.01"
          value={calories}
          onChange={(event) => {
            setCalories(event.target.value);
            setNutritionEdited(true);
          }}
          placeholder="kcal"
          required
        />
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Protein
        <input
          className="input py-2"
          type="number"
          min="0"
          step="0.01"
          value={protein}
          onChange={(event) => {
            setProtein(event.target.value);
            setNutritionEdited(true);
          }}
          placeholder="g"
          required
        />
      </label>
      <button
        className="h-11 rounded bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700 sm:col-span-2 lg:col-span-1"
        type="submit"
        disabled={ingredients.length === 0 || adding}
      >
        {adding ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
