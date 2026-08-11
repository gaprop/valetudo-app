import { pool } from "../../db/pool";
import { HttpError } from "../../middleware/errors";
import type { ValidatedTrainingSetBody } from "../../middleware/validation";
import {
  mapTrainingSet,
  type TrainingSetRow,
} from "./trainingSessionRows";

export class TrainingSessionSetsService {
  static async create(
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

  static async update(
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

  static async delete(userID: string, trainingSessionID: string, setID: string) {
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
