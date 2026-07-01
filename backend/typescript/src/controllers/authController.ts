import type { Request, Response } from "express";
import {
  authCookieName,
  authSessionMaxAgeMs,
  useSecureAuthCookie,
} from "../config/auth";
import type { ValidatedLoginBody } from "../middleware/validation";
import { AuthService } from "../services/authService";
import { handleControllerError } from "./helpers";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: authSessionMaxAgeMs,
    sameSite: "lax" as const,
    secure: useSecureAuthCookie(),
  };
}

function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: useSecureAuthCookie(),
  };
}

export class AuthController {
  static async login(_req: Request, res: Response) {
    try {
      const { username, password } = res.locals.loginBody as ValidatedLoginBody;
      const { user, token } = await AuthService.login(username, password);
      res.cookie(authCookieName, token, sessionCookieOptions());
      res.json(user);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie(authCookieName, clearSessionCookieOptions());
    res.status(204).send();
  }

  static async me(_req: Request, res: Response) {
    res.json(res.locals.user);
  }
}
