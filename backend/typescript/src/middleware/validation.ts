import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { pool } from "../db/pool";
import { HttpError } from "./errors";

const nonSlugCharacters = /[^a-z0-9]+/g;

export type ValidatedExerciseBody = {
  label: string;
  value: string;
};

export type ValidatedTrainingSessionBody = {
  trainingDate: string;
  exerciseType: string;
};

export type ValidatedTrainingSetBody = {
  weight: number;
  reps: number;
};

export type ValidatedPlanDayBody = {
  name: string;
};

export type ValidatedPlanExerciseBody = {
  exerciseType: string;
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

const trainingSessionBodySchema = Joi.object({
  trainingDate: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "any.required": "trainingDate must use YYYY-MM-DD format",
      "string.base": "trainingDate must use YYYY-MM-DD format",
      "string.empty": "trainingDate must use YYYY-MM-DD format",
      "string.pattern.base": "trainingDate must use YYYY-MM-DD format",
    }),
  exerciseType: Joi.string().trim().required().messages({
    "any.required": "exercise is required",
    "string.base": "exercise is required",
    "string.empty": "exercise is required",
  }),
});

const trainingSetBodySchema = Joi.object({
  weight: Joi.number().min(0).max(999999.99).required().messages({
    "any.required": "weight must be a number",
    "number.base": "weight must be a number",
    "number.min": "weight cannot be negative",
    "number.max": "weight is too large",
  }),
  reps: Joi.number().integer().greater(0).required().messages({
    "any.required": "reps must be a number",
    "number.base": "reps must be a number",
    "number.integer": "reps must be greater than zero",
    "number.greater": "reps must be greater than zero",
  }),
});

const planDayBodySchema = Joi.object({
  name: Joi.string().trim().max(80).required().messages({
    "any.required": "day name is required",
    "string.base": "day name is required",
    "string.empty": "day name is required",
    "string.max": "day name is too long",
  }),
});

const planExerciseBodySchema = Joi.object({
  exerciseType: Joi.string().trim().required().messages({
    "any.required": "exercise is required",
    "string.base": "exercise is required",
    "string.empty": "exercise is required",
  }),
});

function validateSchema<T>(schema: Joi.ObjectSchema<T>, value: unknown) {
  const result = schema.validate(value, {
    abortEarly: true,
    allowUnknown: true,
    convert: true,
    stripUnknown: true,
  });
  if (result.error) {
    throw new HttpError(400, result.error.details[0].message);
  }
  return result.value;
}

function slugifyExerciseLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(nonSlugCharacters, "-")
    .replace(/^-+|-+$/g, "");
}

function validateExerciseLabel(labelInput: unknown): ValidatedExerciseBody {
  const { label } = validateSchema(exerciseBodySchema, { label: labelInput });
  const value = slugifyExerciseLabel(label);
  if (!value) {
    throw new HttpError(400, "exercise name must include letters or numbers");
  }

  return { label, value };
}

function validateTrainingSetInput(body: unknown): ValidatedTrainingSetBody {
  return validateSchema(trainingSetBodySchema, body);
}

function validatePlanDayName(value: unknown): ValidatedPlanDayBody {
  return validateSchema(planDayBodySchema, { name: value });
}

async function validateExerciseValue(value: string) {
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

function handleValidation(
  res: Response,
  next: NextFunction,
  validate: () => void | Promise<void>
) {
  Promise.resolve()
    .then(validate)
    .then(next)
    .catch((error) => {
      console.error(error);
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "internal server error" });
    });
}

export function validateUUIDPathID(name: string, label: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    handleValidation(res, next, () => {
      const schema = Joi.object({
        [name]: Joi.string().uuid().required().messages({
          "any.required": `${label} must be a valid id`,
          "string.base": `${label} must be a valid id`,
          "string.empty": `${label} must be a valid id`,
          "string.guid": `${label} must be a valid id`,
        }),
      });
      const { [name]: value } = validateSchema<Record<string, string>>(
        schema,
        req.params
      );
      res.locals[name] = value;
    });
  };
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

export function validateTrainingSessionBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, async () => {
    const { trainingDate, exerciseType: exerciseInput } = validateSchema(
      trainingSessionBodySchema,
      req.body
    );
    const exerciseType = await validateExerciseValue(exerciseInput);
    res.locals.trainingSessionBody = { trainingDate, exerciseType };
  });
}

export function validateTrainingSetBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.trainingSetBody = validateTrainingSetInput(req.body);
  });
}

export function validatePlanDayBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.planDayBody = validatePlanDayName(req.body?.name);
  });
}

export function validatePlanExerciseBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, async () => {
    const { exerciseType: exerciseInput } = validateSchema(
      planExerciseBodySchema,
      req.body
    );
    const exerciseType = await validateExerciseValue(exerciseInput);
    res.locals.planExerciseBody = { exerciseType };
  });
}
