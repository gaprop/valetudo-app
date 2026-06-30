import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { HttpError } from "../errors";

const nonSlugCharacters = /[^a-z0-9]+/g;

export function validateSchema<T>(schema: Joi.ObjectSchema<T>, value: unknown) {
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

export function slugifyLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(nonSlugCharacters, "-")
    .replace(/^-+|-+$/g, "");
}

export function handleValidation(
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
