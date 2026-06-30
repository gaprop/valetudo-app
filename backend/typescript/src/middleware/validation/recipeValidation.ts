import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { handleValidation, validateSchema } from "./common";
import { validateIngredientValue } from "./ingredientValidation";

export type ValidatedRecipeBody = {
  name: string;
};

export type ValidatedRecipeIngredientBody = {
  ingredientValue: string;
  amountGrams: number;
  calories: number;
  protein: number;
};

const recipeBodySchema = Joi.object({
  name: Joi.string().trim().max(120).required().messages({
    "any.required": "recipe name is required",
    "string.base": "recipe name is required",
    "string.empty": "recipe name is required",
    "string.max": "recipe name is too long",
  }),
});

const recipeIngredientBodySchema = Joi.object({
  ingredientValue: Joi.string().trim().required().messages({
    "any.required": "ingredient is required",
    "string.base": "ingredient is required",
    "string.empty": "ingredient is required",
  }),
  amountGrams: Joi.number().greater(0).max(999999.99).required().messages({
    "any.required": "grams must be a number",
    "number.base": "grams must be a number",
    "number.greater": "grams must be greater than zero",
    "number.max": "grams is too large",
  }),
  calories: Joi.number().min(0).max(999999.99).required().messages({
    "any.required": "calories must be a number",
    "number.base": "calories must be a number",
    "number.min": "calories cannot be negative",
    "number.max": "calories is too large",
  }),
  protein: Joi.number().min(0).max(999999.99).required().messages({
    "any.required": "protein must be a number",
    "number.base": "protein must be a number",
    "number.min": "protein cannot be negative",
    "number.max": "protein is too large",
  }),
});

export function validateRecipeInput(body: unknown): ValidatedRecipeBody {
  return validateSchema(recipeBodySchema, { name: (body as { name?: unknown })?.name });
}

export function validateRecipeIngredientInput(body: unknown) {
  return validateSchema(recipeIngredientBodySchema, body);
}

export function validateRecipeBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.recipeBody = validateRecipeInput(req.body);
  });
}

export function validateRecipeIngredientBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, async () => {
    const {
      ingredientValue: ingredientInput,
      amountGrams,
      calories,
      protein,
    } = validateRecipeIngredientInput(req.body);
    const ingredientValue = await validateIngredientValue(ingredientInput);
    res.locals.recipeIngredientBody = {
      ingredientValue,
      amountGrams,
      calories,
      protein,
    };
  });
}
