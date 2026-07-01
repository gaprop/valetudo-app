import jwt from "jsonwebtoken";
import { authJwtSecret, authSessionMaxAgeMs } from "../config/auth";
import { HttpError } from "../middleware/errors";
import { UsersService, type AuthUser } from "./usersService";

type AuthTokenPayload = {
  userID: string;
};

export class AuthService {
  static async login(username: string, password: string) {
    const user = await UsersService.findByUsername(username);
    if (!user) {
      throw new HttpError(401, "invalid username or password");
    }

    const validPassword = await UsersService.verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      throw new HttpError(401, "invalid username or password");
    }

    return {
      user: { id: user.id, username: user.username },
      token: await AuthService.createSessionToken(user),
    };
  }

  static async createSessionToken(user: AuthUser) {
    return jwt.sign({ userID: user.id } satisfies AuthTokenPayload, authJwtSecret(), {
      expiresIn: Math.floor(authSessionMaxAgeMs / 1000),
      subject: user.id,
    });
  }

  static async verifySessionToken(token: string) {
    try {
      const payload = jwt.verify(token, authJwtSecret());
      const userID =
        typeof payload === "string" ? null : typeof payload.sub === "string" ? payload.sub : null;
      if (!userID || typeof userID !== "string") {
        throw new HttpError(401, "authentication is required");
      }

      const user = await UsersService.findByID(userID);
      if (!user) {
        throw new HttpError(401, "authentication is required");
      }
      return user;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(401, "authentication is required");
    }
  }
}
