import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedWorkoutPlanDayBody,
  ValidatedWorkoutPlanItemBody,
} from "../middleware/validation";
import type { WorkoutPlanDay, WorkoutPlanItem } from "../types/api";

type WorkoutPlanDayRow = {
  id: string;
  name: string;
  createdAt: Date;
};

type WorkoutPlanItemRow = {
  id: string;
  exerciseType: string;
  createdAt: Date;
};

function mapPlanDay(row: WorkoutPlanDayRow): WorkoutPlanDay {
  return {
    id: row.id,
    name: row.name,
    items: [],
    createdAt: row.createdAt,
  };
}

function mapPlanItem(row: WorkoutPlanItemRow): WorkoutPlanItem {
  return {
    id: row.id,
    exerciseType: row.exerciseType,
    createdAt: row.createdAt,
  };
}

async function loadWorkoutPlanItems(days: WorkoutPlanDay[]) {
  for (const day of days) {
    const result = await pool.query<WorkoutPlanItemRow>(
      `
        SELECT
          id,
          exercise_type AS "exerciseType",
          created_at AS "createdAt"
        FROM workout_plan_items
        WHERE day_id = $1
        ORDER BY created_at, id
      `,
      [day.id]
    );
    day.items = result.rows.map(mapPlanItem);
  }
}

export class WorkoutPlanService {
  static async listWorkoutPlanDays() {
    const result = await pool.query<WorkoutPlanDayRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM workout_plan_days
        ORDER BY created_at, id
      `
    );
    const days = result.rows.map(mapPlanDay);
    await loadWorkoutPlanItems(days);
    return days;
  }

  static async createWorkoutPlanDay({ name }: ValidatedWorkoutPlanDayBody) {
    const result = await pool.query<WorkoutPlanDayRow>(
      `
        INSERT INTO workout_plan_days (name)
        VALUES ($1)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [name]
    );

    return mapPlanDay(result.rows[0]);
  }

  static async deleteWorkoutPlanDay(dayID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_plan_days
        WHERE id = $1
      `,
      [dayID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "workout plan day was not found");
    }
  }

  static async createWorkoutPlanItem(
    dayID: string,
    { exerciseType }: ValidatedWorkoutPlanItemBody
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const exists = await client.query<{ exists: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM workout_plan_days
            WHERE id = $1
          )
        `,
        [dayID]
      );
      if (!exists.rows[0]?.exists) {
        throw new HttpError(404, "workout plan day was not found");
      }

      const result = await client.query<WorkoutPlanItemRow>(
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
      return mapPlanItem(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteWorkoutPlanItem(dayID: string, itemID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_plan_items
        WHERE day_id = $1 AND id = $2
      `,
      [dayID, itemID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "workout plan item was not found");
    }
  }
}
