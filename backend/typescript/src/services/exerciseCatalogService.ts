import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type { ValidatedExerciseBody } from "../middleware/validation";

export class ExerciseCatalogService {
  static async listExercises(userID: string) {
    const result = await pool.query(
      `
        SELECT value, label, created_at AS "createdAt"
        FROM exercise_types
        WHERE user_id = $1
        ORDER BY label, value
      `,
      [userID]
    );
    return result.rows;
  }

  static async createExercise(userID: string, { label, value }: ValidatedExerciseBody) {
    try {
      const result = await pool.query(
        `
          INSERT INTO exercise_types (user_id, value, label)
          VALUES ($1, $2, $3)
          RETURNING value, label, created_at AS "createdAt"
        `,
        [userID, value, label]
      );
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new HttpError(409, "exercise already exists");
      }
      throw error;
    }
  }

  static async deleteExercise(userID: string, value: string) {
    const used = await pool.query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1 FROM workout_entries WHERE user_id = $1 AND exercise_type = $2
          UNION ALL
          SELECT 1
          FROM workout_plan_items item
          JOIN workout_plan_days day ON day.id = item.day_id
          WHERE day.user_id = $1 AND item.exercise_type = $2
        )
      `,
      [userID, value]
    );
    if (used.rows[0]?.exists) {
      throw new HttpError(400, "exercise is used by trainingSessions or plans");
    }

    const result = await pool.query(
      `
        DELETE FROM exercise_types
        WHERE user_id = $1 AND value = $2
      `,
      [userID, value]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "exercise was not found");
    }
  }
}
