import request from "supertest";
import type { Express } from "express";
import { startIntegrationApp } from "../test/integrationApp";

describe("workout plan API integration", () => {
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

  it("creates and updates workout plan days and exercises", async () => {
    const dayResponse = await agent
      .post("/api/workout-plan/days")
      .send({ name: "Push" })
      .expect(201);

    expect(dayResponse.body).toMatchObject({
      name: "Push",
      items: [],
    });

    const dayID = dayResponse.body.id as string;

    const updatedDayResponse = await agent
      .put(`/api/workout-plan/days/${dayID}`)
      .send({ name: "Upper" })
      .expect(200);

    expect(updatedDayResponse.body).toMatchObject({
      id: dayID,
      name: "Upper",
      items: [],
    });

    const itemResponse = await agent
      .post(`/api/workout-plan/days/${dayID}/items`)
      .send({ exerciseType: "bench" })
      .expect(201);

    expect(itemResponse.body).toMatchObject({
      exerciseType: "bench",
    });

    const itemID = itemResponse.body.id as string;

    const updatedItemResponse = await agent
      .put(`/api/workout-plan/days/${dayID}/items/${itemID}`)
      .send({ exerciseType: "dips" })
      .expect(200);

    expect(updatedItemResponse.body).toMatchObject({
      id: itemID,
      exerciseType: "dips",
    });

    const listResponse = await agent.get("/api/workout-plan/days").expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: dayID,
      name: "Upper",
      items: [
        {
          id: itemID,
          exerciseType: "dips",
        },
      ],
    });
  });
});
