import request from "supertest";
import type { Express } from "express";
import { startIntegrationDatabase } from "../test/integrationDatabase";

describe("training sessions API integration", () => {
  let app: Express;
  let stopDatabase: (() => Promise<void>) | null = null;
  let closePool: (() => Promise<void>) | null = null;

  beforeAll(async () => {
    const database = await startIntegrationDatabase();
    stopDatabase = database.stop;
    process.env.DATABASE_URL = database.connectionString;

    const appModule = await import("../app");
    const poolModule = await import("../db/pool");
    app = appModule.createApp();
    closePool = () => poolModule.pool.end();
  }, 60000);

  afterAll(async () => {
    await closePool?.();
    await stopDatabase?.();
  }, 30000);

  it("creates a training session and manages its sets", async () => {
    const sessionResponse = await request(app)
      .post("/api/workouts")
      .send({ trainingDate: "2026-06-30", exerciseType: "bench" })
      .expect(201);

    expect(sessionResponse.body).toMatchObject({
      trainingDate: "2026-06-30",
      exerciseType: "bench",
      sets: [],
    });

    const sessionID = sessionResponse.body.id as string;

    const setResponse = await request(app)
      .post(`/api/workouts/${sessionID}/sets`)
      .send({ weight: 100, reps: 5 })
      .expect(201);

    expect(setResponse.body).toMatchObject({
      weight: 100,
      reps: 5,
    });

    const updatedSetResponse = await request(app)
      .patch(`/api/workouts/${sessionID}/sets/${setResponse.body.id}`)
      .send({ weight: 105, reps: 4 })
      .expect(200);

    expect(updatedSetResponse.body).toMatchObject({
      weight: 105,
      reps: 4,
    });

    const listResponse = await request(app).get("/api/workouts").expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].sets).toHaveLength(1);

    await request(app)
      .delete(`/api/workouts/${sessionID}/sets/${setResponse.body.id}`)
      .expect(204);

    await request(app).delete(`/api/workouts/${sessionID}`).expect(204);
  });

  it("returns validation and not-found errors", async () => {
    await request(app)
      .post("/api/workouts")
      .send({ trainingDate: "30-06-2026", exerciseType: "bench" })
      .expect(400);

    await request(app)
      .delete("/api/workouts/00000000-0000-0000-0000-000000000000")
      .expect(404);
  });
});
