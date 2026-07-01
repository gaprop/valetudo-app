import request from "supertest";
import type { Express } from "express";
import { startIntegrationApp } from "../test/integrationApp";

describe("training sessions API integration", () => {
  let app: Express;
  let closeApp: (() => Promise<void>) | null = null;
  let agent: request.Agent;

  beforeAll(async () => {
    const integration = await startIntegrationApp();
    app = integration.app;
    closeApp = integration.close;
    agent = await integration.loginAgent();
  }, 60000);

  afterAll(async () => {
    await closeApp?.();
  }, 30000);

  it("requires authentication", async () => {
    await request(app).get("/api/workouts").expect(401);
  });

  it("returns the current user and clears the session on logout", async () => {
    const authAgent = request.agent(app);
    const loginResponse = await authAgent
      .post("/api/auth/login")
      .send({ username: "admin", password: "password" })
      .expect(200);

    expect(loginResponse.body).toMatchObject({ username: "admin" });

    const meResponse = await authAgent.get("/api/auth/me").expect(200);
    expect(meResponse.body).toMatchObject({ username: "admin" });

    await authAgent.post("/api/auth/logout").expect(204);
    await authAgent.get("/api/auth/me").expect(401);
  });

  it("creates a training session and manages its sets", async () => {
    const sessionResponse = await agent
      .post("/api/workouts")
      .send({ trainingDate: "2026-06-30", exerciseType: "bench" })
      .expect(201);

    expect(sessionResponse.body).toMatchObject({
      trainingDate: "2026-06-30",
      exerciseType: "bench",
      sets: [],
    });

    const sessionID = sessionResponse.body.id as string;

    const setResponse = await agent
      .post(`/api/workouts/${sessionID}/sets`)
      .send({ weight: 100, reps: 5 })
      .expect(201);

    expect(setResponse.body).toMatchObject({
      weight: 100,
      reps: 5,
    });

    const updatedSetResponse = await agent
      .patch(`/api/workouts/${sessionID}/sets/${setResponse.body.id}`)
      .send({ weight: 105, reps: 4 })
      .expect(200);

    expect(updatedSetResponse.body).toMatchObject({
      weight: 105,
      reps: 4,
    });

    const listResponse = await agent.get("/api/workouts").expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].sets).toHaveLength(1);

    await agent.delete(`/api/workouts/${sessionID}/sets/${setResponse.body.id}`).expect(204);
    await agent.delete(`/api/workouts/${sessionID}`).expect(204);
  });

  it("returns validation and not-found errors", async () => {
    await agent
      .post("/api/workouts")
      .send({ trainingDate: "30-06-2026", exerciseType: "bench" })
      .expect(400);

    await agent
      .delete("/api/workouts/00000000-0000-0000-0000-000000000000")
      .expect(404);
  });
});
