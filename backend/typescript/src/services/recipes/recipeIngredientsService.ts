import { pool } from "../../db/pool";
import { HttpError } from "../../middleware/errors";
import type { ValidatedRecipeIngredientBody } from "../../middleware/validation";
import {
  mapRecipeIngredient,
  type RecipeIngredientRow,
} from "./recipeRows";

export class RecipeIngredientsService {
  static async create(
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

  static async update(
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

  static async delete(userID: string, recipeID: string, ingredientID: string) {
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
}
