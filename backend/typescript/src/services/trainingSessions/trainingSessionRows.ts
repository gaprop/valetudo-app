import { pool } from "../../db/pool";
import type { TrainingSession, TrainingSet } from "../../types/api";
import { loadChildrenForParents } from "../helpers";

export type TrainingSessionRow = {
  id: string;
  trainingDate: string;
  exerciseType: string;
  createdAt: Date;
};

export type TrainingSetRow = {
  id: string;
  weight: string;
  reps: number;
  createdAt: Date;
};

export function mapTrainingSession(row: TrainingSessionRow): TrainingSession {
  return {
    id: row.id,
    trainingDate: row.trainingDate,
    exerciseType: row.exerciseType,
    sets: [],
    createdAt: row.createdAt,
  };
}

export function mapTrainingSet(row: TrainingSetRow): TrainingSet {
  return {
    id: row.id,
    weight: Number(row.weight),
    reps: row.reps,
    createdAt: row.createdAt,
  };
}

export async function loadTrainingSets(
  userID: string,
  trainingSessions: TrainingSession[]
) {
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
