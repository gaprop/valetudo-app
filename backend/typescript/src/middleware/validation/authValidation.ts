import type { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { handleValidation, validateSchema } from "./common";

export type ValidatedLoginBody = {
  username: string;
  password: string;
};

const loginSchema = Joi.object<ValidatedLoginBody>({
  username: Joi.string().trim().min(1).required().messages({
    "any.required": "username is required",
    "string.base": "username is required",
    "string.empty": "username is required",
  }),
  password: Joi.string().min(1).required().messages({
    "any.required": "password is required",
    "string.base": "password is required",
    "string.empty": "password is required",
  }),
});

export function validateLoginBody(req: Request, res: Response, next: NextFunction) {
  handleValidation(res, next, () => {
    res.locals.loginBody = validateSchema(loginSchema, req.body);
  });
}
