import type {
  CreateRecipeIngredientRequest,
  ID,
  Ingredient,
  IngredientRequest,
  Recipe,
  UpdateRecipeIngredientRequest,
} from "../types";
import type { RecipesPendingState } from "../hooks";
import { IngredientCatalog } from "./IngredientCatalog";
import { RecipeCard } from "./RecipeCard";
import { RecipeForm } from "./RecipeForm";

type RecipesPageProps = {
  recipes: Recipe[];
  ingredients: Ingredient[];
  loading: boolean;
  error: string;
  pending: RecipesPendingState;
  ingredientLoading: boolean;
  ingredientError: string;
  creatingIngredient: boolean;
  updatingIngredientValue: string | null;
  deletingIngredientValue: string | null;
  onAddRecipe: (input: { name: string }) => Promise<boolean>;
  onDeleteRecipe: (recipeID: ID) => void;
  onAddRecipeIngredient: (
    input: CreateRecipeIngredientRequest
  ) => Promise<boolean>;
  onUpdateRecipeIngredient: (
    input: UpdateRecipeIngredientRequest
  ) => Promise<boolean>;
  onDeleteRecipeIngredient: (recipeID: ID, ingredientID: ID) => void;
  onAddIngredient: (input: IngredientRequest) => Promise<boolean>;
  onUpdateIngredient: (
    value: string,
    input: IngredientRequest
  ) => Promise<boolean>;
  onDeleteIngredient: (value: string) => void;
};

export function RecipesPage({
  recipes,
  ingredients,
  loading,
  error,
  pending,
  ingredientLoading,
  ingredientError,
  creatingIngredient,
  updatingIngredientValue,
  deletingIngredientValue,
  onAddRecipe,
  onDeleteRecipe,
  onAddRecipeIngredient,
  onUpdateRecipeIngredient,
  onDeleteRecipeIngredient,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}: RecipesPageProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="grid content-start gap-6">
        <RecipeForm
          creating={pending.creatingRecipe}
          onAddRecipe={onAddRecipe}
        />
        <IngredientCatalog
          ingredients={ingredients}
          loading={ingredientLoading}
          error={ingredientError}
          creating={creatingIngredient}
          updatingValue={updatingIngredientValue}
          deletingValue={deletingIngredientValue}
          onAddIngredient={onAddIngredient}
          onUpdateIngredient={onUpdateIngredient}
          onDeleteIngredient={onDeleteIngredient}
        />
      </div>

      <div className="grid content-start gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recipes</h2>
        </div>

        {error && (
          <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-neutral-400">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-500">
            No recipes yet.
          </p>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              ingredients={ingredients}
              pending={pending}
              onDeleteRecipe={() => onDeleteRecipe(recipe.id)}
              onAddIngredient={onAddRecipeIngredient}
              onUpdateIngredient={onUpdateRecipeIngredient}
              onDeleteIngredient={onDeleteRecipeIngredient}
            />
          ))
        )}
      </div>
    </section>
  );
}
