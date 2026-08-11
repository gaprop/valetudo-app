import { pool } from "../../db/pool";
import type { PlanDay, PlanExercise } from "../../types/api";
import { loadChildrenForParents } from "../helpers";

export type PlanDayRow = {
  id: string;
  name: string;
  createdAt: Date;
};

export type PlanExerciseRow = {
  id: string;
  exerciseType: string;
  createdAt: Date;
};

export function mapPlanDay(row: PlanDayRow): PlanDay {
  return {
    id: row.id,
    name: row.name,
    items: [],
    createdAt: row.createdAt,
  };
}

export function mapPlanExercise(row: PlanExerciseRow): PlanExercise {
  return {
    id: row.id,
    exerciseType: row.exerciseType,
    createdAt: row.createdAt,
  };
}

export async function loadPlanExercises(userID: string, days: PlanDay[]) {
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
