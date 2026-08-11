import { pool } from "../../db/pool";
import { HttpError } from "../../middleware/errors";
import type { ValidatedTrainingSessionBody } from "../../middleware/validation";
import {
  loadTrainingSets,
  mapTrainingSession,
  type TrainingSessionRow,
} from "./trainingSessionRows";

export class TrainingSessionEntriesService {
  static async list(userID: string) {
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

  static async create(
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

    return TrainingSessionEntriesService.get(userID, result.rows[0].id);
  }

  static async delete(userID: string, trainingSessionID: string) {
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

  static async get(userID: string, id: string) {
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
}
