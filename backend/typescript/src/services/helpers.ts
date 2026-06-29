import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";

export function requireString(value: unknown, message: string) {
  if (typeof value !== "string") {
    throw new HttpError(400, message);
  }
  return value.trim();
}

export function requireNumber(value: unknown, message: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new HttpError(400, message);
  }
  return number;
}

export async function validateExerciseValue(value: string) {
  const exerciseValue = value.trim();
  if (!exerciseValue) {
    throw new HttpError(400, "exercise is required");
  }

  const result = await pool.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM exercise_types
        WHERE value = $1
      )
    `,
    [exerciseValue]
  );
  if (!result.rows[0]?.exists) {
    throw new HttpError(400, "exercise does not exist");
  }

  return exerciseValue;
}

export function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
