import { pool } from "../../db/pool";
import type { ValidatedPlanDayBody } from "../../middleware/validation";
import { assertRowsAffected, firstRowOrNotFound } from "../helpers";
import {
  loadPlanExercises,
  mapPlanDay,
  type PlanDayRow,
} from "./planDayRows";

export class PlanDayRecordsService {
  static async list(userID: string) {
    const result = await pool.query<PlanDayRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM workout_plan_days
        WHERE user_id = $1
        ORDER BY created_at, id
      `,
      [userID]
    );
    const days = result.rows.map(mapPlanDay);
    await loadPlanExercises(userID, days);
    return days;
  }

  static async create(userID: string, { name }: ValidatedPlanDayBody) {
    const result = await pool.query<PlanDayRow>(
      `
        INSERT INTO workout_plan_days (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [userID, name]
    );

    return mapPlanDay(
      firstRowOrNotFound(result.rows, "workout plan day was not created")
    );
  }

  static async delete(userID: string, dayID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_plan_days
        WHERE id = $1 AND user_id = $2
      `,
      [dayID, userID]
    );
    assertRowsAffected(result, "workout plan day was not found");
  }
}
