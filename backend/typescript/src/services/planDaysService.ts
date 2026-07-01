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

async function loadPlanExercises(userID: string, days: PlanDay[]) {
  await loadChildrenForParents(
    days,
    async (day) => {
      const result = await pool.query<PlanExerciseRow>(
        `
          SELECT
            item.id,
            item.exercise_type AS "exerciseType",
            item.created_at AS "createdAt"
          FROM workout_plan_items item
          JOIN workout_plan_days day ON day.id = item.day_id
          WHERE item.day_id = $1 AND day.user_id = $2
          ORDER BY item.created_at, item.id
      `,
        [day.id, userID]
      );
      return result.rows.map(mapPlanExercise);
    },
    (day, items) => {
      day.items = items;
    }
  );
}

export class PlanDaysService {
  static async listPlanDays(userID: string) {
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

  static async createPlanDay(userID: string, { name }: ValidatedPlanDayBody) {
    const result = await pool.query<PlanDayRow>(
      `
        INSERT INTO workout_plan_days (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [userID, name]
    );

    return mapPlanDay(result.rows[0]);
  }

  static async deletePlanDay(userID: string, dayID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_plan_days
        WHERE id = $1 AND user_id = $2
      `,
      [dayID, userID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "workout plan day was not found");
    }
  }

  static async createPlanExercise(
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

  static async deletePlanExercise(userID: string, dayID: string, itemID: string) {
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
