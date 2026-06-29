import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type { ValidatedExerciseBody } from "../middleware/validation";

export class ExerciseCatalogService {
  static async listExercises() {
    const result = await pool.query(
      `
        SELECT value, label, created_at AS "createdAt"
        FROM exercise_types
        ORDER BY label, value
      `
    );
    return result.rows;
  }

  static async createExercise({ label, value }: ValidatedExerciseBody) {
    try {
      const result = await pool.query(
        `
          INSERT INTO exercise_types (value, label)
          VALUES ($1, $2)
          RETURNING value, label, created_at AS "createdAt"
        `,
        [value, label]
      );
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new HttpError(409, "exercise already exists");
      }
      throw error;
    }
  }

  static async deleteExercise(value: string) {
    const used = await pool.query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1 FROM workout_entries WHERE exercise_type = $1
          UNION ALL
          SELECT 1 FROM workout_plan_items WHERE exercise_type = $1
        )
      `,
      [value]
    );
    if (used.rows[0]?.exists) {
      throw new HttpError(400, "exercise is used by trainingSessions or plans");
    }

    const result = await pool.query(
      `
        DELETE FROM exercise_types
        WHERE value = $1
      `,
      [value]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "exercise was not found");
    }
  }
}
