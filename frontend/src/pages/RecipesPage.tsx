import {
  IngredientCatalog,
  PageNavigation,
  RecipeCard,
  RecipeForm,
} from "../components";
import { useIngredients, useRecipes } from "../hooks";

export function RecipesPage() {
  const ingredients = useIngredients();
  const recipes = useRecipes();

  return (
    <div className="grid gap-8">
      <header className="border-b border-neutral-800 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
          Valetudo
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Recipes
        </h1>
        <PageNavigation />
      </header>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="grid content-start gap-6">
          <RecipeForm
            creating={recipes.pending.creatingRecipe}
            onAddRecipe={recipes.addRecipe}
          />
          <IngredientCatalog
            ingredients={ingredients.ingredients}
            loading={ingredients.loading}
            error={ingredients.error}
            creating={ingredients.creating}
            updatingValue={ingredients.updatingValue}
            deletingValue={ingredients.deletingValue}
            onAddIngredient={ingredients.addIngredient}
            onUpdateIngredient={ingredients.updateIngredient}
            onDeleteIngredient={(value) => void ingredients.removeIngredient(value)}
          />
        </div>

        <div className="grid content-start gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recipes</h2>
          </div>

          {recipes.error && (
            <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
              {recipes.error}
            </p>
          )}

          {recipes.loading ? (
            <p className="text-sm text-neutral-400">Loading recipes...</p>
          ) : recipes.recipes.length === 0 ? (
            <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-500">
              No recipes yet.
            </p>
          ) : (
            recipes.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                ingredients={ingredients.ingredients}
                pending={recipes.pending}
                onDeleteRecipe={() => void recipes.removeRecipe(recipe.id)}
                onAddIngredient={recipes.addRecipeIngredient}
                onUpdateIngredient={recipes.updateRecipeIngredient}
                onDeleteIngredient={(recipeID, ingredientID) =>
                  void recipes.removeRecipeIngredient(recipeID, ingredientID)
                }
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
