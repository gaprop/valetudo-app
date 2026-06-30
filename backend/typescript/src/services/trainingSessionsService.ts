import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";
import type {
  ValidatedTrainingSessionBody,
  ValidatedTrainingSetBody,
} from "../middleware/validation";
import type { TrainingSession, TrainingSet } from "../types/api";
import { formatDate, loadChildrenForParents } from "./helpers";

type TrainingSessionRow = {
  id: string;
  trainingDate: Date;
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
    trainingDate: formatDate(row.trainingDate),
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

async function loadTrainingSets(trainingSessions: TrainingSession[]) {
  await loadChildrenForParents(
    trainingSessions,
    async (trainingSession) => {
    const result = await pool.query<TrainingSetRow>(
      `
        SELECT id, weight, reps, created_at AS "createdAt"
        FROM workout_sets
        WHERE workout_id = $1
        ORDER BY created_at, id
      `,
      [trainingSession.id]
    );
      return result.rows.map(mapTrainingSet);
    },
    (trainingSession, sets) => {
      trainingSession.sets = sets;
    }
  );
}

async function getTrainingSession(id: string) {
  const result = await pool.query<TrainingSessionRow>(
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
    throw new HttpError(404, "training session was not found");
  }

  const trainingSession = mapTrainingSession(row);
  await loadTrainingSets([trainingSession]);
  return trainingSession;
}

export class TrainingSessionsService {
  static async listTrainingSessions() {
    const result = await pool.query<TrainingSessionRow>(
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
    const trainingSessions = result.rows.map(mapTrainingSession);
    await loadTrainingSets(trainingSessions);
    return trainingSessions;
  }

  static async createTrainingSession({ trainingDate, exerciseType }: ValidatedTrainingSessionBody) {
    const result = await pool.query<{ id: string }>(
      `
        INSERT INTO workout_entries (training_date, exercise_type)
        VALUES ($1, $2)
        RETURNING id
      `,
      [trainingDate, exerciseType]
    );

    return getTrainingSession(result.rows[0].id);
  }

  static async deleteTrainingSession(trainingSessionID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_entries
        WHERE id = $1
      `,
      [trainingSessionID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "training session was not found");
    }
  }

  static async createTrainingSet(
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
            WHERE id = $1
          )
        `,
        [trainingSessionID]
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
    trainingSessionID: string,
    setID: string,
    { weight, reps }: ValidatedTrainingSetBody
  ) {
    const result = await pool.query<TrainingSetRow>(
      `
        UPDATE workout_sets
        SET weight = $3, reps = $4
        WHERE workout_id = $1 AND id = $2
        RETURNING id, weight, reps, created_at AS "createdAt"
      `,
      [trainingSessionID, setID, weight, reps]
    );
    if (!result.rows[0]) {
      throw new HttpError(404, "training set was not found");
    }

    return mapTrainingSet(result.rows[0]);
  }

  static async deleteTrainingSet(trainingSessionID: string, setID: string) {
    const result = await pool.query(
      `
        DELETE FROM workout_sets
        WHERE workout_id = $1 AND id = $2
      `,
      [trainingSessionID, setID]
    );
    if (result.rowCount === 0) {
      throw new HttpError(404, "training set was not found");
    }
  }
}
