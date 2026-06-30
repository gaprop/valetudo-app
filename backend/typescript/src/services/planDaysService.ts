import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedPlanDayBody,
  ValidatedPlanExerciseBody,
} from "../middleware/validation";
import type { PlanDay, PlanExercise } from "../types/api";
import { loadChildrenForParents } from "./helpers";

type PlanDayRow = {
  id: string;
  name: string;
  createdAt: Date;
};

type PlanExerciseRow = {
  id: string;
  exerciseType: string;
  createdAt: Date;
};

function mapPlanDay(row: PlanDayRow): PlanDay {
  return {
    id: row.id,
    name: row.name,
    items: [],
    createdAt: row.createdAt,
  };
}

function mapPlanExercise(row: PlanExerciseRow): PlanExercise {
  return {
    id: row.id,
    exerciseType: row.exerciseType,
    createdAt: row.createdAt,
  };
}

async function loadPlanExercises(days: PlanDay[]) {
  await loadChildrenForParents(
    days,
    async (day) => {
    const result = await pool.query<PlanExerciseRow>(
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
      return result.rows.map(mapPlanExercise);
    },
    (day, items) => {
      day.items = items;
    }
  );
}

export class PlanDaysService {
  static async listPlanDays() {
    const result = await pool.query<PlanDayRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM workout_plan_days
        ORDER BY created_at, id
      `
    );
    const days = result.rows.map(mapPlanDay);
    await loadPlanExercises(days);
    return days;
  }

  static async createPlanDay({ name }: ValidatedPlanDayBody) {
    const result = await pool.query<PlanDayRow>(
      `
        INSERT INTO workout_plan_days (name)
        VALUES ($1)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [name]
    );

    return mapPlanDay(result.rows[0]);
  }

  static async deletePlanDay(dayID: string) {
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

  static async createPlanExercise(
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
            WHERE id = $1
          )
        `,
        [dayID]
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

  static async deletePlanExercise(dayID: string, itemID: string) {
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
