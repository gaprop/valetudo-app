import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "./errors";

const nonSlugCharacters = /[^a-z0-9]+/g;

export type ValidatedExerciseBody = {
  label: string;
  value: string;
};

export type ValidatedWorkoutBody = {
  trainingDate: string;
  exerciseType: string;
};

export type ValidatedWorkoutSetBody = {
  weight: number;
  reps: number;
};

export type ValidatedWorkoutPlanDayBody = {
  name: string;
};

export type ValidatedWorkoutPlanItemBody = {
  exerciseType: string;
};

function requireString(value: unknown, message: string) {
  if (typeof value !== "string") {
    throw new HttpError(400, message);
  }
  return value.trim();
}

function requireNumber(value: unknown, message: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new HttpError(400, message);
  }
  return number;
}

function slugifyExerciseLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(nonSlugCharacters, "-")
    .replace(/^-+|-+$/g, "");
}

function validateExerciseLabel(labelInput: unknown): ValidatedExerciseBody {
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

function validateWorkoutSetInput(body: unknown): ValidatedWorkoutSetBody {
  const input = body && typeof body === "object" ? body : {};
  const weight = requireNumber(
    (input as { weight?: unknown }).weight,
    "weight must be a number"
  );
  const reps = requireNumber(
    (input as { reps?: unknown }).reps,
    "reps must be a number"
  );

  if (weight < 0) {
    throw new HttpError(400, "weight cannot be negative");
  }
  if (weight > 999999.99) {
    throw new HttpError(400, "weight is too large");
  }
  if (!Number.isInteger(reps) || reps <= 0) {
    throw new HttpError(400, "reps must be greater than zero");
  }

  return { weight, reps };
}

function validateWorkoutPlanDayName(value: unknown): ValidatedWorkoutPlanDayBody {
  const name = requireString(value, "day name is required");
  if (!name) {
    throw new HttpError(400, "day name is required");
  }
  if (name.length > 80) {
    throw new HttpError(400, "day name is too long");
  }
  return { name };
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

export function validatePositivePathID(name: string, label: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    handleValidation(res, next, () => {
      const value = Number(req.params[name]);
      if (!Number.isInteger(value) || value <= 0) {
        throw new HttpError(400, `${label} must be a positive number`);
      }
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
    const value = req.params.value?.trim();
    if (!value) {
      throw new HttpError(400, "exercise is required");
    }
    res.locals.exerciseValue = value;
  });
}

export function validateWorkoutBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, async () => {
    const trainingDate = requireString(
      req.body?.trainingDate,
      "trainingDate must use YYYY-MM-DD format"
    );
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trainingDate)) {
      throw new HttpError(400, "trainingDate must use YYYY-MM-DD format");
    }

    const exerciseType = await validateExerciseValue(
      requireString(req.body?.exerciseType, "exercise is required")
    );
    res.locals.workoutBody = { trainingDate, exerciseType };
  });
}

export function validateWorkoutSetBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.workoutSetBody = validateWorkoutSetInput(req.body);
  });
}

export function validateWorkoutPlanDayBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, () => {
    res.locals.workoutPlanDayBody = validateWorkoutPlanDayName(req.body?.name);
  });
}

export function validateWorkoutPlanItemBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  handleValidation(res, next, async () => {
    const exerciseType = await validateExerciseValue(
      requireString(req.body?.exerciseType, "exercise is required")
    );
    res.locals.workoutPlanItemBody = { exerciseType };
  });
}
