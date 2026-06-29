import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type { WorkoutPlanDay, WorkoutPlanItem } from "../types/api";
import {
  parsePositivePathID,
  requireString,
  validateExerciseValue,
} from "./helpers";

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
    id: Number(row.id),
    name: row.name,
    items: [],
    createdAt: row.createdAt,
  };
}

function mapPlanItem(row: WorkoutPlanItemRow): WorkoutPlanItem {
  return {
    id: Number(row.id),
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

function validateWorkoutPlanDayName(value: unknown) {
  const name = requireString(value, "day name is required");
  if (!name) {
    throw new HttpError(400, "day name is required");
  }
  if (name.length > 80) {
    throw new HttpError(400, "day name is too long");
  }
  return name;
}

export class WorkoutPlanController {
  static async listWorkoutPlanDays(_req: Request, res: Response) {
    const result = await pool.query<WorkoutPlanDayRow>(
      `
        SELECT id, name, created_at AS "createdAt"
        FROM workout_plan_days
        ORDER BY created_at, id
      `
    );
    const days = result.rows.map(mapPlanDay);
    await loadWorkoutPlanItems(days);
    res.json(days);
  }

  static async createWorkoutPlanDay(req: Request, res: Response) {
    const name = validateWorkoutPlanDayName(req.body?.name);
    const result = await pool.query<WorkoutPlanDayRow>(
      `
        INSERT INTO workout_plan_days (name)
        VALUES ($1)
        RETURNING id, name, created_at AS "createdAt"
      `,
      [name]
    );

    res.status(201).json(mapPlanDay(result.rows[0]));
  }

  static async deleteWorkoutPlanDay(req: Request, res: Response) {
    const dayID = parsePositivePathID(req, "id", "day id");
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

    res.status(204).send();
  }

  static async createWorkoutPlanItem(req: Request, res: Response) {
    const dayID = parsePositivePathID(req, "id", "day id");
    const exerciseType = await validateExerciseValue(
      requireString(req.body?.exerciseType, "exercise is required")
    );

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
      res.status(201).json(mapPlanItem(result.rows[0]));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteWorkoutPlanItem(req: Request, res: Response) {
    const dayID = parsePositivePathID(req, "id", "day id");
    const itemID = parsePositivePathID(req, "itemID", "item id");
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

    res.status(204).send();
  }
}
