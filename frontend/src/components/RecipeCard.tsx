import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type {
  CreateRecipeIngredientRequest,
  ID,
  Ingredient,
  Recipe,
  UpdateRecipeIngredientRequest,
} from "../types";
import type { RecipesPendingState } from "../hooks";
import { nutritionForGrams } from "../recipeNutrition";
import { IconButton } from "./IconButton";
import { RecipeIngredientRow } from "./RecipeIngredientRow";

type RecipeCardProps = {
  recipe: Recipe;
  ingredients: Ingredient[];
  pending: RecipesPendingState;
  onDeleteRecipe: () => void;
  onAddIngredient: (
    input: CreateRecipeIngredientRequest
  ) => Promise<boolean>;
  onUpdateIngredient: (
    input: UpdateRecipeIngredientRequest
  ) => Promise<boolean>;
  onDeleteIngredient: (recipeID: ID, ingredientID: ID) => void;
};

export function RecipeCard({
  recipe,
  ingredients,
  pending,
  onDeleteRecipe,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}: RecipeCardProps) {
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

  const totals = useMemo(
    () =>
      recipe.ingredients.reduce(
        (sum, ingredient) => ({
          calories: sum.calories + ingredient.calories,
          protein: sum.protein + ingredient.protein,
        }),
        { calories: 0, protein: 0 }
      ),
    [recipe.ingredients]
  );

  async function handleAddIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const added = await onAddIngredient({
      recipeID: recipe.id,
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
    <article className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="grid gap-3 border-l-4 border-primary-600 bg-neutral-800/40 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <h3 className="text-lg font-semibold text-white">{recipe.name}</h3>
        <IconButton
          label="Delete recipe"
          title="Delete recipe"
          onClick={onDeleteRecipe}
          disabled={pending.deletingRecipeId === recipe.id}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
      </div>

      <div className="grid gap-4 p-5">
        {recipe.ingredients.length === 0 ? (
          <p className="text-sm text-neutral-500">No ingredients yet.</p>
        ) : (
          <div className="grid gap-3">
            {recipe.ingredients.map((ingredient) => (
              <RecipeIngredientRow
                key={ingredient.id}
                recipeID={recipe.id}
                ingredient={ingredient}
                ingredients={ingredients}
                saving={pending.updatingIngredientId === ingredient.id}
                deleting={pending.deletingIngredientId === ingredient.id}
                onUpdateIngredient={onUpdateIngredient}
                onDeleteIngredient={() =>
                  onDeleteIngredient(recipe.id, ingredient.id)
                }
              />
            ))}
          </div>
        )}

        <form
          className="grid gap-3 border-t border-neutral-800 pt-4 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] lg:items-end"
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
            className="h-11 rounded bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
            type="submit"
            disabled={
              ingredients.length === 0 ||
              pending.addingIngredientRecipeId === recipe.id
            }
          >
            {pending.addingIngredientRecipeId === recipe.id ? "Adding..." : "Add"}
          </button>
        </form>

        <div className="grid gap-3 border-t border-neutral-800 pt-4 text-sm sm:grid-cols-2">
          <div className="rounded border border-neutral-800 bg-neutral-950 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Calories
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {totals.calories.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="rounded border border-neutral-800 bg-neutral-950 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Protein
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {totals.protein.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              g
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
