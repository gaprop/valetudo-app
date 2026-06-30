import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { handleValidation, validateSchema } from "./common";
import { validateExerciseValue } from "./exerciseValidation";

export type ValidatedPlanDayBody = {
  name: string;
};

export type ValidatedPlanExerciseBody = {
  exerciseType: string;
};

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

export function validatePlanDayBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.planDayBody = validateSchema(planDayBodySchema, {
      name: req.body?.name,
    });
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
