import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { handleValidation, validateSchema } from "./common";
import { validateExerciseValue } from "./exerciseValidation";

export type ValidatedTrainingSessionBody = {
  trainingDate: string;
  exerciseType: string;
};

export type ValidatedTrainingSetBody = {
  weight: number;
  reps: number;
};

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
    res.locals.trainingSetBody = validateSchema(trainingSetBodySchema, req.body);
  });
}
