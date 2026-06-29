import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type { Workout, WorkoutSet } from "../types/api";
import {
  formatDate,
  parsePositivePathID,
  requireNumber,
  requireString,
  validateExerciseValue,
} from "./helpers";

type WorkoutRow = {
  id: string;
  trainingDate: Date;
  exerciseType: string;
  createdAt: Date;
};

type WorkoutSetRow = {
  id: string;
  weight: string;
  reps: number;
  createdAt: Date;
};

function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: Number(row.id),
    trainingDate: formatDate(row.trainingDate),
    exerciseType: row.exerciseType,
    sets: [],
    createdAt: row.createdAt,
  };
}

function mapWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: Number(row.id),
    weight: Number(row.weight),
    reps: row.reps,
    createdAt: row.createdAt,
  };
}

async function loadSets(workouts: Workout[]) {
  for (const workout of workouts) {
    const result = await pool.query<WorkoutSetRow>(
      `
        SELECT id, weight, reps, created_at AS "createdAt"
        FROM workout_sets
        WHERE workout_id = $1
        ORDER BY created_at, id
      `,
      [workout.id]
    );
    workout.sets = result.rows.map(mapWorkoutSet);
  }
}

async function getWorkout(id: number) {
  const result = await pool.query<WorkoutRow>(
    `
      SELECT
        id,
        training_date AS "trainingDate",
        exercise_type AS "exerciseType",
        created_at AS "createdAt"
      FROM workout_entries
      WHERE id = $1
    `,
    [id]
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "workout was not found");
  }

  const workout = mapWorkout(row);
  await loadSets([workout]);
  return workout;
}

function validateWorkoutSetInput(body: unknown) {
  const input = body && typeof body === "object" ? body : {};
  const weight = requireNumber(
    (input as { weight?: unknown }).weight,
    "weight must be a number"
  );
  const reps = requireNumber((input as { reps?: unknown }).reps, "reps must be a number");

  if (weight < 0) {
    throw new HttpError(400, "weight cannot be negative");
  }
  if (weight > 999999.99) {
    throw new HttpError(400, "weight is too large");
  }
  if (!Number.isInteger(reps) || reps <= 0) {
    throw new HttpError(400, "reps must be greater than zero");
  }

  return { weight, reps };
}

export class WorkoutsController {
  static async listWorkouts(_req: Request, res: Response) {
    const result = await pool.query<WorkoutRow>(
      `
        SELECT
          id,
          training_date AS "trainingDate",
          exercise_type AS "exerciseType",
          created_at AS "createdAt"
        FROM workout_entries
        ORDER BY training_date, created_at, id
      `
    );
    const workouts = result.rows.map(mapWorkout);
    await loadSets(workouts);
    res.json(workouts);
  }

  static async createWorkout(req: Request, res: Response) {
    const trainingDate = requireString(
      req.body?.trainingDate,
      "trainingDate must use YYYY-MM-DD format"
    );
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trainingDate)) {
      throw new HttpError(400, "trainingDate must use YYYY-MM-DD format");
    }

    const exerciseType = await validateExerciseValue(
      requireString(req.body?.exerciseType, "exercise is required")
    );

    const result = await pool.query<{ id: string }>(
      `
        INSERT INTO workout_entries (training_date, exercise_type)
        VALUES ($1, $2)
        RETURNING id
      `,
      [trainingDate, exerciseType]
    );

    const workout = await getWorkout(Number(result.rows[0].id));
    res.status(201).json(workout);
  }

  static async deleteWorkout(req: Request, res: Response) {
    const workoutID = parsePositivePathID(req, "id", "workout id");
    const result = await pool.query(
      `
        DELETE FROM workout_entries
        WHERE id = $1
      `,
      [workoutID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "workout was not found");
    }
    res.status(204).send();
  }

  static async createWorkoutSet(req: Request, res: Response) {
    const workoutID = parsePositivePathID(req, "id", "workout id");
    const { weight, reps } = validateWorkoutSetInput(req.body);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const exists = await client.query<{ exists: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM workout_entries
            WHERE id = $1
          )
        `,
        [workoutID]
      );
      if (!exists.rows[0]?.exists) {
        throw new HttpError(404, "workout was not found");
      }

      const result = await client.query<WorkoutSetRow>(
        `
          INSERT INTO workout_sets (workout_id, weight, reps)
          VALUES ($1, $2, $3)
          RETURNING id, weight, reps, created_at AS "createdAt"
        `,
        [workoutID, weight, reps]
      );
      await client.query("COMMIT");
      res.status(201).json(mapWorkoutSet(result.rows[0]));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateWorkoutSet(req: Request, res: Response) {
    const workoutID = parsePositivePathID(req, "id", "workout id");
    const setID = parsePositivePathID(req, "setID", "set id");
    const { weight, reps } = validateWorkoutSetInput(req.body);

    const result = await pool.query<WorkoutSetRow>(
      `
        UPDATE workout_sets
        SET weight = $3, reps = $4
        WHERE workout_id = $1 AND id = $2
        RETURNING id, weight, reps, created_at AS "createdAt"
      `,
      [workoutID, setID, weight, reps]
    );
    if (!result.rows[0]) {
      throw new HttpError(404, "workout set was not found");
    }

    res.json(mapWorkoutSet(result.rows[0]));
  }

  static async deleteWorkoutSet(req: Request, res: Response) {
    const workoutID = parsePositivePathID(req, "id", "workout id");
    const setID = parsePositivePathID(req, "setID", "set id");

    const result = await pool.query(
      `
        DELETE FROM workout_sets
        WHERE workout_id = $1 AND id = $2
      `,
      [workoutID, setID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "workout set was not found");
    }

    res.status(204).send();
  }
}
