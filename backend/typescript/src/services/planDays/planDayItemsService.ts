import { pool } from "../../db/pool";
import { HttpError } from "../../middleware/errors";
import type { ValidatedPlanExerciseBody } from "../../middleware/validation";
import { mapPlanExercise, type PlanExerciseRow } from "./planDayRows";

export class PlanDayItemsService {
  static async create(
    userID: string,
    dayID: string,
    { exerciseType }: ValidatedPlanExerciseBody
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const exists = await client.query<{ exists: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM workout_plan_days
            WHERE id = $1 AND user_id = $2
          )
        `,
        [dayID, userID]
      );
      if (!exists.rows[0]?.exists) {
        throw new HttpError(404, "workout plan day was not found");
      }

      const result = await client.query<PlanExerciseRow>(
        `
          INSERT INTO workout_plan_items (day_id, exercise_type)
          VALUES ($1, $2)
          RETURNING
            id,
            exercise_type AS "exerciseType",
            created_at AS "createdAt"
        `,
        [dayID, exerciseType]
      );
      await client.query("COMMIT");
      return mapPlanExercise(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(userID: string, dayID: string, itemID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_plan_items
        USING workout_plan_days day
        WHERE workout_plan_items.day_id = $1
          AND workout_plan_items.id = $2
          AND day.id = workout_plan_items.day_id
          AND day.user_id = $3
      `,
      [dayID, itemID, userID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "workout plan item was not found");
    }
  }
}
