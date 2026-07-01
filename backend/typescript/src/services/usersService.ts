import bcrypt from "bcryptjs";
import { pool } from "../db/pool";
import { seededAuthCredentials } from "../config/auth";
import { defaultExercises } from "./defaultExercises";

export type AuthUser = {
  id: string;
  username: string;
};

type UserRow = AuthUser & {
  passwordHash: string;
};

export class UsersService {
  static async seedConfiguredUser() {
    const { username, password } = seededAuthCredentials();
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query<AuthUser>(
      `
        INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            updated_at = now()
        RETURNING id, username
      `,
      [username, passwordHash]
    );

    const user = result.rows[0];
    await UsersService.seedDefaultExercises(user.id);
    return user;
  }

  static async seedDefaultExercises(userID: string) {
    for (const exercise of defaultExercises) {
      await pool.query(
        `
          INSERT INTO exercise_types (user_id, value, label)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, value) DO UPDATE
          SET label = EXCLUDED.label
        `,
        [userID, exercise.value, exercise.label]
      );
    }
  }

  static async findByUsername(username: string) {
    const result = await pool.query<UserRow>(
      `
        SELECT id, username, password_hash AS "passwordHash"
        FROM users
        WHERE username = $1
      `,
      [username]
    );
    return result.rows[0] ?? null;
  }

  static async findByID(userID: string) {
    const result = await pool.query<AuthUser>(
      `
        SELECT id, username
        FROM users
        WHERE id = $1
      `,
      [userID]
    );
    return result.rows[0] ?? null;
  }

  static async verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }
}
