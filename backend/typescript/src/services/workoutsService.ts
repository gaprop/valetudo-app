import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedWorkoutBody,
  ValidatedWorkoutSetBody,
} from "../middleware/validation";
import type { Workout, WorkoutSet } from "../types/api";
import { formatDate } from "./helpers";

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

export class WorkoutsService {
  static async listWorkouts() {
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
    return workouts;
  }

  static async createWorkout({ trainingDate, exerciseType }: ValidatedWorkoutBody) {
    const result = await pool.query<{ id: string }>(
      `
        INSERT INTO workout_entries (training_date, exercise_type)
        VALUES ($1, $2)
        RETURNING id
      `,
      [trainingDate, exerciseType]
    );

    return getWorkout(Number(result.rows[0].id));
  }

  static async deleteWorkout(workoutID: number) {
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
  }

  static async createWorkoutSet(
    workoutID: number,
    { weight, reps }: ValidatedWorkoutSetBody
  ) {
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
      return mapWorkoutSet(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateWorkoutSet(
    workoutID: number,
    setID: number,
    { weight, reps }: ValidatedWorkoutSetBody
  ) {
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

    return mapWorkoutSet(result.rows[0]);
  }

  static async deleteWorkoutSet(workoutID: number, setID: number) {
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
  }
}
