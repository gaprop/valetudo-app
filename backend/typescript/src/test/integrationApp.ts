import request from "supertest";
import type { Express } from "express";
import { startIntegrationDatabase } from "./integrationDatabase";

type IntegrationApp = {
  app: Express;
  close: () => Promise<void>;
  loginAgent: (username?: string, password?: string) => Promise<request.Agent>;
  seedUser: (username: string, password: string) => Promise<void>;
};

export async function startIntegrationApp(): Promise<IntegrationApp> {
  const database = await startIntegrationDatabase();
  process.env.DATABASE_URL = database.connectionString;
  process.env.AUTH_USERNAME = "admin";
  process.env.AUTH_PASSWORD = "password";
  process.env.AUTH_JWT_SECRET = "integration-test-secret";
  process.env.AUTH_COOKIE_SECURE = "false";

  const appModule = await import("../app");
  const poolModule = await import("../db/pool");
  const usersModule = await import("../services/usersService");
  await usersModule.UsersService.seedConfiguredUser();

  const app = appModule.createApp();

  return {
    app,
    close: async () => {
      await poolModule.pool.end();
      await database.stop();
    },
    loginAgent: async (username = "admin", password = "password") => {
      const agent = request.agent(app);
      await agent.post("/api/auth/login").send({ username, password }).expect(200);
      return agent;
    },
    seedUser: async (username: string, password: string) => {
      const previousUsername = process.env.AUTH_USERNAME;
      const previousPassword = process.env.AUTH_PASSWORD;
      process.env.AUTH_USERNAME = username;
      process.env.AUTH_PASSWORD = password;
      await usersModule.UsersService.seedConfiguredUser();
      process.env.AUTH_USERNAME = previousUsername;
      process.env.AUTH_PASSWORD = previousPassword;
    },
  };
}
