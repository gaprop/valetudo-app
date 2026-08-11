import { pool } from "../../db/pool";
import type { Recipe, RecipeIngredient } from "../../types/api";
import { loadChildrenForParents } from "../helpers";

export type RecipeRow = {
  id: string;
  name: string;
  createdAt: Date;
};

export type RecipeIngredientRow = {
  id: string;
  ingredientValue: string;
  amountGrams: string;
  calories: string;
  protein: string;
  createdAt: Date;
};

export function mapRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    ingredients: [],
    createdAt: row.createdAt,
  };
}

export function mapRecipeIngredient(
  row: RecipeIngredientRow
): RecipeIngredient {
  return {
    id: row.id,
    ingredientValue: row.ingredientValue,
    amountGrams: Number(row.amountGrams),
    calories: Number(row.calories),
    protein: Number(row.protein),
    createdAt: row.createdAt,
  };
}

export async function loadRecipeIngredients(userID: string, recipes: Recipe[]) {
  await loadChildrenForParents(
    recipes,
    async (recipe) => {
      const result = await pool.query<RecipeIngredientRow>(
        `
          SELECT
            id,
            ingredient_value AS "ingredientValue",
            amount_grams AS "amountGrams",
            calories,
            protein,
            created_at AS "createdAt"
          FROM recipe_ingredients
          WHERE recipe_id = $1 AND user_id = $2
          ORDER BY created_at, id
      `,
        [recipe.id, userID]
      );
      return result.rows.map(mapRecipeIngredient);
    },
    (recipe, ingredients) => {
      recipe.ingredients = ingredients;
    }
  );
}
