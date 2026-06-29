import type { Response } from "express";
import { HttpError } from "../middleware/errors";

export function handleControllerError(error: unknown, res: Response) {
  console.error(error);

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "internal server error" });
}
