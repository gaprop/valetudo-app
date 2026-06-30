import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type {
  ID,
  Ingredient,
  RecipeIngredient,
  UpdateRecipeIngredientRequest,
} from "../types";
import { nutritionForGrams } from "../recipeNutrition";
import { IconButton } from "./IconButton";

type RecipeIngredientRowProps = {
  recipeID: ID;
  ingredient: RecipeIngredient;
  ingredients: Ingredient[];
  saving: boolean;
  deleting: boolean;
  onUpdateIngredient: (
    input: UpdateRecipeIngredientRequest
  ) => Promise<boolean>;
  onDeleteIngredient: () => void;
};

function labelFor(ingredients: Ingredient[], value: string) {
  return (
    ingredients.find((ingredient) => ingredient.value === value)?.label || value
  );
}

export function RecipeIngredientRow({
  recipeID,
  ingredient,
  ingredients,
  saving,
  deleting,
  onUpdateIngredient,
  onDeleteIngredient,
}: RecipeIngredientRowProps) {
  const [ingredientValue, setIngredientValue] = useState(
    ingredient.ingredientValue
  );
  const [amountGrams, setAmountGrams] = useState(String(ingredient.amountGrams));
  const [calories, setCalories] = useState(String(ingredient.calories));
  const [protein, setProtein] = useState(String(ingredient.protein));

  useEffect(() => {
    setIngredientValue(ingredient.ingredientValue);
    setAmountGrams(String(ingredient.amountGrams));
    setCalories(String(ingredient.calories));
    setProtein(String(ingredient.protein));
  }, [ingredient]);

  function applyIngredientDefaults(value: string, gramsInput: string) {
    const catalogIngredient =
      ingredients.find((item) => item.value === value) || null;
    if (!catalogIngredient || !gramsInput) {
      return;
    }
    setCalories(
      String(nutritionForGrams(catalogIngredient.caloriesPer100g, gramsInput))
    );
    setProtein(
      String(nutritionForGrams(catalogIngredient.proteinPer100g, gramsInput))
    );
  }

  const hasChanges =
    ingredientValue !== ingredient.ingredientValue ||
    Number(amountGrams) !== ingredient.amountGrams ||
    Number(calories) !== ingredient.calories ||
    Number(protein) !== ingredient.protein;

  async function handleSave() {
    const saved = await onUpdateIngredient({
      recipeID,
      ingredientID: ingredient.id,
      ingredientValue,
      amountGrams: Number(amountGrams),
      calories: Number(calories),
      protein: Number(protein),
    });
    if (!saved) {
      setIngredientValue(ingredient.ingredientValue);
      setAmountGrams(String(ingredient.amountGrams));
      setCalories(String(ingredient.calories));
      setProtein(String(ingredient.protein));
    }
  }

  return (
    <div className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 p-3 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto_auto] lg:items-end">
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Ingredient
        <select
          className="input py-2"
          value={ingredientValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setIngredientValue(nextValue);
            applyIngredientDefaults(nextValue, amountGrams);
          }}
          disabled={ingredients.length === 0}
        >
          {ingredients.length === 0 ? (
            <option value={ingredientValue}>
              {labelFor(ingredients, ingredientValue)}
            </option>
          ) : (
            ingredients.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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
            const nextAmount = event.target.value;
            setAmountGrams(nextAmount);
            applyIngredientDefaults(ingredientValue, nextAmount);
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
          }}
          placeholder="g"
          required
        />
      </label>
      <IconButton
        label="Save ingredient"
        title="Save ingredient"
        onClick={handleSave}
        disabled={
          !hasChanges || saving || !amountGrams || !calories || !protein
        }
      >
        <Save aria-hidden="true" size={16} strokeWidth={2.25} />
      </IconButton>
      <IconButton
        label="Delete ingredient from recipe"
        title="Delete ingredient"
        onClick={onDeleteIngredient}
        disabled={deleting}
      >
        <X aria-hidden="true" size={16} strokeWidth={2.25} />
      </IconButton>
    </div>
  );
}
