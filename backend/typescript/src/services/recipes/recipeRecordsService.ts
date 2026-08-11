import { pool } from "../../db/pool";
import type { ValidatedRecipeBody } from "../../middleware/validation";
import {
  assertRowsAffected,
  firstRowOrNotFound,
} from "../helpers";
import {
  loadRecipeIngredients,
  mapRecipe,
  type RecipeRow,
} from "./recipeRows";

export class RecipeRecordsService {
  static async list(userID: string) {
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

  static async create(userID: string, { name }: ValidatedRecipeBody) {
    const result = await pool.query<RecipeRow>(
      `
        INSERT INTO recipes (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [userID, name]
    );

    return mapRecipe(firstRowOrNotFound(result.rows, "recipe was not created"));
  }

  static async delete(userID: string, recipeID: string) {
    const result = await pool.query(
      `
        DELETE FROM recipes
        WHERE id = $1 AND user_id = $2
      `,
      [recipeID, userID]
    );
    assertRowsAffected(result, "recipe was not found");
  }

  static async get(userID: string, recipeID: string) {
    const result = await pool.query<RecipeRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM recipes
        WHERE id = $1 AND user_id = $2
      `,
      [recipeID, userID]
    );
    const recipe = mapRecipe(
      firstRowOrNotFound(result.rows, "recipe was not found")
    );
    await loadRecipeIngredients(userID, [recipe]);
    return recipe;
  }
}
