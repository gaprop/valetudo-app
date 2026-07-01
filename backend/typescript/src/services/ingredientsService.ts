import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type { ValidatedIngredientBody } from "../middleware/validation";

export class IngredientsService {
  static async listIngredients(userID: string) {
    const result = await pool.query(
      `
        SELECT
          value,
          label,
          calories_per_100g AS "caloriesPer100g",
          protein_per_100g AS "proteinPer100g",
          created_at AS "createdAt"
        FROM ingredients
        WHERE user_id = $1
        ORDER BY label, value
      `,
      [userID]
    );
    return result.rows;
  }

  static async createIngredient(
    userID: string,
    { label, value, caloriesPer100g, proteinPer100g }: ValidatedIngredientBody
  ) {
    try {
      const result = await pool.query(
        `
          INSERT INTO ingredients (
            user_id,
            value,
            label,
            calories_per_100g,
            protein_per_100g
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            value,
            label,
            calories_per_100g AS "caloriesPer100g",
            protein_per_100g AS "proteinPer100g",
            created_at AS "createdAt"
        `,
        [userID, value, label, caloriesPer100g, proteinPer100g]
      );
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new HttpError(409, "ingredient already exists");
      }
      throw error;
    }
  }

  static async updateIngredient(
    userID: string,
    currentValue: string,
    { label, value, caloriesPer100g, proteinPer100g }: ValidatedIngredientBody
  ) {
    try {
      const result = await pool.query(
        `
          UPDATE ingredients
          SET
            value = $2,
            label = $3,
            calories_per_100g = $4,
            protein_per_100g = $5
          WHERE value = $1 AND user_id = $6
          RETURNING
            value,
            label,
            calories_per_100g AS "caloriesPer100g",
            protein_per_100g AS "proteinPer100g",
            created_at AS "createdAt"
        `,
        [currentValue, value, label, caloriesPer100g, proteinPer100g, userID]
      );
      if (!result.rows[0]) {
        throw new HttpError(404, "ingredient was not found");
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new HttpError(409, "ingredient already exists");
      }
      throw error;
    }
  }

  static async deleteIngredient(userID: string, value: string) {
    const used = await pool.query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM recipe_ingredients
          WHERE user_id = $1 AND ingredient_value = $2
        )
      `,
      [userID, value]
    );
    if (used.rows[0]?.exists) {
      throw new HttpError(400, "ingredient is used by recipes");
    }

    const result = await pool.query(
      `
        DELETE FROM ingredients
        WHERE user_id = $1 AND value = $2
      `,
      [userID, value]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "ingredient was not found");
    }
  }
}
