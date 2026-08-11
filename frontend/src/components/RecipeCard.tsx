import { useMemo } from "react";
import { X } from "lucide-react";
import type {
  CreateRecipeIngredientRequest,
  ID,
  Ingredient,
  Recipe,
  UpdateRecipeIngredientRequest,
} from "../types";
import type { RecipesPendingState } from "../hooks";
import { IconButton } from "./IconButton";
import { RecipeIngredientForm } from "./RecipeIngredientForm";
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

  return (
    <article className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="grid grid-cols-[1fr_auto] gap-3 border-l-4 border-primary-600 bg-neutral-800/40 px-3 py-3 sm:px-5 sm:py-4">
        <h3 className="min-w-0 text-lg font-semibold text-white">{recipe.name}</h3>
        <IconButton
          label="Delete recipe"
          title="Delete recipe"
          onClick={onDeleteRecipe}
          disabled={pending.deletingRecipeId === recipe.id}
        >
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </IconButton>
      </div>

      <div className="grid gap-4 p-3 sm:p-5">
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

        <RecipeIngredientForm
          recipeID={recipe.id}
          ingredients={ingredients}
          adding={pending.addingIngredientRecipeId === recipe.id}
          onAddIngredient={onAddIngredient}
        />

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
