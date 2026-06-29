import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { HttpError } from "../middleware/errors.js";
import { requireString } from "./helpers.js";

const nonSlugCharacters = /[^a-z0-9]+/g;

function slugifyExerciseLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(nonSlugCharacters, "-")
    .replace(/^-+|-+$/g, "");
}

function validateExercise(labelInput: unknown) {
  const label = requireString(labelInput, "exercise name is required");
  if (!label) {
    throw new HttpError(400, "exercise name is required");
  }
  if (label.length > 80) {
    throw new HttpError(400, "exercise name is too long");
  }

  const value = slugifyExerciseLabel(label);
  if (!value) {
    throw new HttpError(400, "exercise name must include letters or numbers");
  }

  return { label, value };
}

export async function listExercises(_req: Request, res: Response) {
  const result = await pool.query(
    `
      SELECT value, label, created_at AS "createdAt"
      FROM exercise_types
      ORDER BY label, value
    `
  );
  res.json(result.rows);
}

export async function createExercise(req: Request, res: Response) {
  const { label, value } = validateExercise(req.body?.label);

  try {
    const result = await pool.query(
      `
        INSERT INTO exercise_types (value, label)
        VALUES ($1, $2)
        RETURNING value, label, created_at AS "createdAt"
      `,
      [value, label]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      throw new HttpError(409, "exercise already exists");
    }
    throw error;
  }
}

export async function deleteExercise(req: Request, res: Response) {
  const value = req.params.value?.trim();
  if (!value) {
    throw new HttpError(400, "exercise is required");
  }

  const used = await pool.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1 FROM workout_entries WHERE exercise_type = $1
        UNION ALL
        SELECT 1 FROM workout_plan_items WHERE exercise_type = $1
      )
    `,
    [value]
  );
  if (used.rows[0]?.exists) {
    throw new HttpError(400, "exercise is used by workouts or plans");
  }

  const result = await pool.query(
    `
      DELETE FROM exercise_types
      WHERE value = $1
    `,
    [value]
  );
  if (result.rowCount === 0) {
    throw new HttpError(404, "exercise was not found");
  }

  res.status(204).send();
}
