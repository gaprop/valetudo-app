import { pool } from "../../db/pool";
import type { ValidatedPlanExerciseBody } from "../../middleware/validation";
import {
  assertExists,
  assertRowsAffected,
  withTransaction,
} from "../helpers";
import { mapPlanExercise, type PlanExerciseRow } from "./planDayRows";

export class PlanDayItemsService {
  static async create(
    userID: string,
    dayID: string,
    { exerciseType }: ValidatedPlanExerciseBody
  ) {
    return withTransaction(async (client) => {
      await assertExists(
        client,
        `
          SELECT EXISTS (
            SELECT 1
            FROM workout_plan_days
            WHERE id = $1 AND user_id = $2
          )
        `,
        [dayID, userID],
        "workout plan day was not found"
      );

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
      return mapPlanExercise(result.rows[0]);
    });
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
    assertRowsAffected(result, "workout plan item was not found");
  }
}
