import type { NextFunction, Request, Response } from "express";
import { authCookieName } from "../config/auth";
import { AuthService } from "../services/authService";
import { HttpError } from "./errors";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[authCookieName];
    if (!token || typeof token !== "string") {
      throw new HttpError(401, "authentication is required");
    }

    const user = await AuthService.verifySessionToken(token);
    res.locals.user = user;
    res.locals.userID = user.id;
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "internal server error" });
  }
}
