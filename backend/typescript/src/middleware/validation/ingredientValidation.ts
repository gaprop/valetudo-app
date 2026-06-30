import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { pool } from "../../db/pool";
import { HttpError } from "../errors";
import { handleValidation, slugifyLabel, validateSchema } from "./common";

export type ValidatedIngredientBody = {
  label: string;
  value: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

const ingredientBodySchema = Joi.object({
  label: Joi.string().trim().max(120).required().messages({
    "any.required": "ingredient name is required",
    "string.base": "ingredient name is required",
    "string.empty": "ingredient name is required",
    "string.max": "ingredient name is too long",
  }),
  caloriesPer100g: Joi.number().min(0).max(999999.99).required().messages({
    "any.required": "calories per 100g must be a number",
    "number.base": "calories per 100g must be a number",
    "number.min": "calories per 100g cannot be negative",
    "number.max": "calories per 100g is too large",
  }),
  proteinPer100g: Joi.number().min(0).max(999999.99).required().messages({
    "any.required": "protein per 100g must be a number",
    "number.base": "protein per 100g must be a number",
    "number.min": "protein per 100g cannot be negative",
    "number.max": "protein per 100g is too large",
  }),
});

const ingredientPathSchema = Joi.object({
  value: Joi.string().trim().required().messages({
    "any.required": "ingredient is required",
    "string.base": "ingredient is required",
    "string.empty": "ingredient is required",
  }),
});

function validateIngredientInput(body: unknown): ValidatedIngredientBody {
  const { label, caloriesPer100g, proteinPer100g } = validateSchema(
    ingredientBodySchema,
    body
  );
  const value = slugifyLabel(label);
  if (!value) {
    throw new HttpError(400, "ingredient name must include letters or numbers");
  }

  return { label, value, caloriesPer100g, proteinPer100g };
}

export async function validateIngredientValue(value: string) {
  const ingredientValue = value.trim();
  if (!ingredientValue) {
    throw new HttpError(400, "ingredient is required");
  }

  const result = await pool.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM ingredients
        WHERE value = $1
      )
    `,
    [ingredientValue]
  );
  if (!result.rows[0]?.exists) {
    throw new HttpError(400, "ingredient does not exist");
  }

  return ingredientValue;
}

export function validateIngredientBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.ingredientBody = validateIngredientInput(req.body);
  });
}

export function validateIngredientPathValue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    const { value } = validateSchema(ingredientPathSchema, req.params);
    res.locals.ingredientValue = value;
  });
}
