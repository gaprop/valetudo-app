import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedRecipeBody,
  ValidatedRecipeIngredientBody,
} from "../middleware/validation";
import type { Recipe, RecipeIngredient } from "../types/api";

type RecipeRow = {
  id: string;
  name: string;
  createdAt: Date;
};

type RecipeIngredientRow = {
  id: string;
  ingredientValue: string;
  amountGrams: string;
  calories: string;
  protein: string;
  createdAt: Date;
};

function mapRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    ingredients: [],
    createdAt: row.createdAt,
  };
}

function mapRecipeIngredient(row: RecipeIngredientRow): RecipeIngredient {
  return {
    id: row.id,
    ingredientValue: row.ingredientValue,
    amountGrams: Number(row.amountGrams),
    calories: Number(row.calories),
    protein: Number(row.protein),
    createdAt: row.createdAt,
  };
}

async function loadRecipeIngredients(recipes: Recipe[]) {
  for (const recipe of recipes) {
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
        WHERE recipe_id = $1
        ORDER BY created_at, id
      `,
      [recipe.id]
    );
    recipe.ingredients = result.rows.map(mapRecipeIngredient);
  }
}

async function getRecipe(recipeID: string) {
  const result = await pool.query<RecipeRow>(
    `
      SELECT id, name, created_at AS "createdAt"
      FROM recipes
      WHERE id = $1
    `,
    [recipeID]
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "recipe was not found");
  }

  const recipe = mapRecipe(row);
  await loadRecipeIngredients([recipe]);
  return recipe;
}

export class RecipesService {
  static async listRecipes() {
    const result = await pool.query<RecipeRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM recipes
        ORDER BY created_at, id
      `
    );
    const recipes = result.rows.map(mapRecipe);
    await loadRecipeIngredients(recipes);
    return recipes;
  }

  static async createRecipe({ name }: ValidatedRecipeBody) {
    const result = await pool.query<RecipeRow>(
      `
        INSERT INTO recipes (name)
        VALUES ($1)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [name]
    );

    return mapRecipe(result.rows[0]);
  }

  static async deleteRecipe(recipeID: string) {
    const result = await pool.query(
      `
        DELETE FROM recipes
        WHERE id = $1
      `,
      [recipeID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "recipe was not found");
    }
  }

  static async createRecipeIngredient(
    recipeID: string,
    { ingredientValue, amountGrams, calories, protein }: ValidatedRecipeIngredientBody
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const exists = await client.query<{ exists: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM recipes
            WHERE id = $1
          )
        `,
        [recipeID]
      );
      if (!exists.rows[0]?.exists) {
        throw new HttpError(404, "recipe was not found");
      }

      const result = await client.query<RecipeIngredientRow>(
        `
          INSERT INTO recipe_ingredients (
            recipe_id,
            ingredient_value,
            amount_grams,
            calories,
            protein
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            id,
            ingredient_value AS "ingredientValue",
            amount_grams AS "amountGrams",
            calories,
            protein,
            created_at AS "createdAt"
        `,
        [recipeID, ingredientValue, amountGrams, calories, protein]
      );
      await client.query("COMMIT");
      return mapRecipeIngredient(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateRecipeIngredient(
    recipeID: string,
    ingredientID: string,
    { ingredientValue, amountGrams, calories, protein }: ValidatedRecipeIngredientBody
  ) {
    const result = await pool.query<RecipeIngredientRow>(
      `
        UPDATE recipe_ingredients
        SET
          ingredient_value = $3,
          amount_grams = $4,
          calories = $5,
          protein = $6
        WHERE recipe_id = $1 AND id = $2
        RETURNING
          id,
          ingredient_value AS "ingredientValue",
          amount_grams AS "amountGrams",
          calories,
          protein,
          created_at AS "createdAt"
      `,
      [recipeID, ingredientID, ingredientValue, amountGrams, calories, protein]
    );
    if (!result.rows[0]) {
      throw new HttpError(404, "recipe ingredient was not found");
    }

    return mapRecipeIngredient(result.rows[0]);
  }

  static async deleteRecipeIngredient(recipeID: string, ingredientID: string) {
    const result = await pool.query(
      `
        DELETE FROM recipe_ingredients
        WHERE recipe_id = $1 AND id = $2
      `,
      [recipeID, ingredientID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "recipe ingredient was not found");
    }
  }

  static async getRecipe(recipeID: string) {
    return getRecipe(recipeID);
  }
}
