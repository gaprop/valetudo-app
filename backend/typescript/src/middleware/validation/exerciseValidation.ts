import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { pool } from "../../db/pool";
import { HttpError } from "../errors";
import { handleValidation, slugifyLabel, validateSchema } from "./common";

export type ValidatedExerciseBody = {
  label: string;
  value: string;
};

const exerciseBodySchema = Joi.object({
  label: Joi.string().trim().max(80).required().messages({
    "any.required": "exercise name is required",
    "string.base": "exercise name is required",
    "string.empty": "exercise name is required",
    "string.max": "exercise name is too long",
  }),
});

const exercisePathSchema = Joi.object({
  value: Joi.string().trim().required().messages({
    "any.required": "exercise is required",
    "string.base": "exercise is required",
    "string.empty": "exercise is required",
  }),
});

function validateExerciseLabel(labelInput: unknown): ValidatedExerciseBody {
  const { label } = validateSchema(exerciseBodySchema, { label: labelInput });
  const value = slugifyLabel(label);
  if (!value) {
    throw new HttpError(400, "exercise name must include letters or numbers");
  }

  return { label, value };
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

export function validateExerciseBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.exerciseBody = validateExerciseLabel(req.body?.label);
  });
}

export function validateExercisePathValue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    const { value } = validateSchema(exercisePathSchema, req.params);
    res.locals.exerciseValue = value;
  });
}
