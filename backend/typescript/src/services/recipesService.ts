import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedRecipeBody,
  ValidatedRecipeIngredientBody,
} from "../middleware/validation";
import type { Recipe, RecipeIngredient } from "../types/api";
import { loadChildrenForParents } from "./helpers";

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

async function loadRecipeIngredients(userID: string, recipes: Recipe[]) {
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

async function getRecipe(userID: string, recipeID: string) {
  const result = await pool.query<RecipeRow>(
    `
      SELECT id, name, created_at AS "createdAt"
      FROM recipes
      WHERE id = $1 AND user_id = $2
    `,
    [recipeID, userID]
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "recipe was not found");
  }

  const recipe = mapRecipe(row);
  await loadRecipeIngredients(userID, [recipe]);
  return recipe;
}

export class RecipesService {
  static async listRecipes(userID: string) {
    const result = await pool.query<RecipeRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM recipes
        WHERE user_id = $1
        ORDER BY created_at, id
      `,
      [userID]
    );
    const recipes = result.rows.map(mapRecipe);
    await loadRecipeIngredients(userID, recipes);
    return recipes;
  }

  static async createRecipe(userID: string, { name }: ValidatedRecipeBody) {
    const result = await pool.query<RecipeRow>(
      `
        INSERT INTO recipes (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [userID, name]
    );

    return mapRecipe(result.rows[0]);
  }

  static async deleteRecipe(userID: string, recipeID: string) {
    const result = await pool.query(
      `
        DELETE FROM recipes
        WHERE id = $1 AND user_id = $2
      `,
      [recipeID, userID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "recipe was not found");
    }
  }

  static async createRecipeIngredient(
    userID: string,
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
            WHERE id = $1 AND user_id = $2
          )
        `,
        [recipeID, userID]
      );
      if (!exists.rows[0]?.exists) {
        throw new HttpError(404, "recipe was not found");
      }

      const result = await client.query<RecipeIngredientRow>(
        `
          INSERT INTO recipe_ingredients (
            user_id,
            recipe_id,
            ingredient_value,
            amount_grams,
            calories,
            protein
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            id,
            ingredient_value AS "ingredientValue",
            amount_grams AS "amountGrams",
            calories,
            protein,
            created_at AS "createdAt"
        `,
        [userID, recipeID, ingredientValue, amountGrams, calories, protein]
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
    userID: string,
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
        WHERE recipe_id = $1 AND id = $2 AND user_id = $7
        RETURNING
          id,
          ingredient_value AS "ingredientValue",
          amount_grams AS "amountGrams",
          calories,
          protein,
          created_at AS "createdAt"
      `,
      [recipeID, ingredientID, ingredientValue, amountGrams, calories, protein, userID]
    );
    if (!result.rows[0]) {
      throw new HttpError(404, "recipe ingredient was not found");
    }

    return mapRecipeIngredient(result.rows[0]);
  }

  static async deleteRecipeIngredient(userID: string, recipeID: string, ingredientID: string) {
    const result = await pool.query(
      `
        DELETE FROM recipe_ingredients
        WHERE recipe_id = $1 AND id = $2 AND user_id = $3
      `,
      [recipeID, ingredientID, userID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "recipe ingredient was not found");
    }
  }

  static async getRecipe(userID: string, recipeID: string) {
    return getRecipe(userID, recipeID);
  }
}
