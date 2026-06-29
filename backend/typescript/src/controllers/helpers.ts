import type { Request, Response } from "express";
import { HttpError } from "../middleware/errors";

export function parsePositivePathID(req: Request, name: string, label: string) {
  const value = Number(req.params[name]);
  if (!Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, `${label} must be a positive number`);
  }
  return value;
}

export function handleControllerError(error: unknown, res: Response) {
  console.error(error);

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "internal server error" });
}
