import { pool } from "../../db/pool";
import type { ValidatedTrainingSetBody } from "../../middleware/validation";
import {
  assertExists,
  assertRowsAffected,
  firstRowOrNotFound,
  withTransaction,
} from "../helpers";
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
    return withTransaction(async (client) => {
      await assertExists(
        client,
        `
          SELECT EXISTS (
            SELECT 1
            FROM workout_entries
            WHERE id = $1 AND user_id = $2
          )
        `,
        [trainingSessionID, userID],
        "training session was not found"
      );

      const result = await client.query<TrainingSetRow>(
        `
          INSERT INTO workout_sets (workout_id, weight, reps)
          VALUES ($1, $2, $3)
          RETURNING id, weight, reps, created_at AS "createdAt"
        `,
        [trainingSessionID, weight, reps]
      );
      return mapTrainingSet(result.rows[0]);
    });
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

    return mapTrainingSet(
      firstRowOrNotFound(result.rows, "training set was not found")
    );
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
    assertRowsAffected(result, "training set was not found");
  }
}
