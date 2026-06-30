import { PageNavigation, RecipesPage } from "../components";
import { useIngredients, useRecipes } from "../hooks";

export function RecipesRoutePage() {
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

      <RecipesPage
        recipes={recipes.recipes}
        ingredients={ingredients.ingredients}
        loading={recipes.loading}
        error={recipes.error}
        pending={recipes.pending}
        ingredientLoading={ingredients.loading}
        ingredientError={ingredients.error}
        creatingIngredient={ingredients.creating}
        updatingIngredientValue={ingredients.updatingValue}
        deletingIngredientValue={ingredients.deletingValue}
        onAddRecipe={recipes.addRecipe}
        onDeleteRecipe={(recipeID) => void recipes.removeRecipe(recipeID)}
        onAddRecipeIngredient={recipes.addRecipeIngredient}
        onUpdateRecipeIngredient={recipes.updateRecipeIngredient}
        onDeleteRecipeIngredient={(recipeID, ingredientID) =>
          void recipes.removeRecipeIngredient(recipeID, ingredientID)
        }
        onAddIngredient={ingredients.addIngredient}
        onUpdateIngredient={ingredients.updateIngredient}
        onDeleteIngredient={(value) => void ingredients.removeIngredient(value)}
      />
    </div>
  );
}
