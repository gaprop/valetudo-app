import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedTrainingSessionBody,
  ValidatedTrainingSetBody,
} from "../middleware/validation";
import type { TrainingSession, TrainingSet } from "../types/api";
import { loadChildrenForParents } from "./helpers";

type TrainingSessionRow = {
  id: string;
  trainingDate: string;
  exerciseType: string;
  createdAt: Date;
};

type TrainingSetRow = {
  id: string;
  weight: string;
  reps: number;
  createdAt: Date;
};

function mapTrainingSession(row: TrainingSessionRow): TrainingSession {
  return {
    id: row.id,
    trainingDate: row.trainingDate,
    exerciseType: row.exerciseType,
    sets: [],
    createdAt: row.createdAt,
  };
}

function mapTrainingSet(row: TrainingSetRow): TrainingSet {
  return {
    id: row.id,
    weight: Number(row.weight),
    reps: row.reps,
    createdAt: row.createdAt,
  };
}

async function loadTrainingSets(userID: string, trainingSessions: TrainingSession[]) {
  await loadChildrenForParents(
    trainingSessions,
    async (trainingSession) => {
      const result = await pool.query<TrainingSetRow>(
        `
          SELECT set.id, set.weight, set.reps, set.created_at AS "createdAt"
          FROM workout_sets set
          JOIN workout_entries entry ON entry.id = set.workout_id
          WHERE set.workout_id = $1 AND entry.user_id = $2
          ORDER BY set.created_at, set.id
      `,
        [trainingSession.id, userID]
      );
      return result.rows.map(mapTrainingSet);
    },
    (trainingSession, sets) => {
      trainingSession.sets = sets;
    }
  );
}

async function getTrainingSession(userID: string, id: string) {
  const result = await pool.query<TrainingSessionRow>(
    `
      SELECT
        id,
        training_date::text AS "trainingDate",
        exercise_type AS "exerciseType",
        created_at AS "createdAt"
      FROM workout_entries
      WHERE id = $1 AND user_id = $2
    `,
    [id, userID]
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "training session was not found");
  }

  const trainingSession = mapTrainingSession(row);
  await loadTrainingSets(userID, [trainingSession]);
  return trainingSession;
}

export class TrainingSessionsService {
  static async listTrainingSessions(userID: string) {
    const result = await pool.query<TrainingSessionRow>(
      `
        SELECT
          id,
          training_date::text AS "trainingDate",
          exercise_type AS "exerciseType",
          created_at AS "createdAt"
        FROM workout_entries
        WHERE user_id = $1
        ORDER BY training_date, created_at, id
      `,
      [userID]
    );
    const trainingSessions = result.rows.map(mapTrainingSession);
    await loadTrainingSets(userID, trainingSessions);
    return trainingSessions;
  }

  static async createTrainingSession(
    userID: string,
    { trainingDate, exerciseType }: ValidatedTrainingSessionBody
  ) {
    const result = await pool.query<{ id: string }>(
      `
        INSERT INTO workout_entries (user_id, training_date, exercise_type)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [userID, trainingDate, exerciseType]
    );

    return getTrainingSession(userID, result.rows[0].id);
  }

  static async deleteTrainingSession(userID: string, trainingSessionID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_entries
        WHERE id = $1 AND user_id = $2
      `,
      [trainingSessionID, userID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "training session was not found");
    }
  }

  static async createTrainingSet(
    userID: string,
    trainingSessionID: string,
    { weight, reps }: ValidatedTrainingSetBody
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const exists = await client.query<{ exists: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM workout_entries
            WHERE id = $1 AND user_id = $2
          )
        `,
        [trainingSessionID, userID]
      );
      if (!exists.rows[0]?.exists) {
        throw new HttpError(404, "training session was not found");
      }

      const result = await client.query<TrainingSetRow>(
        `
          INSERT INTO workout_sets (workout_id, weight, reps)
          VALUES ($1, $2, $3)
          RETURNING id, weight, reps, created_at AS "createdAt"
        `,
        [trainingSessionID, weight, reps]
      );
      await client.query("COMMIT");
      return mapTrainingSet(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateTrainingSet(
    userID: string,
    trainingSessionID: string,
    setID: string,
    { weight, reps }: ValidatedTrainingSetBody
  ) {
    const result = await pool.query<TrainingSetRow>(
      `
        UPDATE workout_sets
        SET weight = $3, reps = $4
        FROM workout_entries entry
        WHERE workout_sets.workout_id = $1
          AND workout_sets.id = $2
          AND entry.id = workout_sets.workout_id
          AND entry.user_id = $5
        RETURNING workout_sets.id, workout_sets.weight, workout_sets.reps, workout_sets.created_at AS "createdAt"
      `,
      [trainingSessionID, setID, weight, reps, userID]
    );
    if (!result.rows[0]) {
      throw new HttpError(404, "training set was not found");
    }

    return mapTrainingSet(result.rows[0]);
  }

  static async deleteTrainingSet(userID: string, trainingSessionID: string, setID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_sets
        USING workout_entries entry
        WHERE workout_sets.workout_id = $1
          AND workout_sets.id = $2
          AND entry.id = workout_sets.workout_id
          AND entry.user_id = $3
      `,
      [trainingSessionID, setID, userID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "training set was not found");
    }
  }
}
