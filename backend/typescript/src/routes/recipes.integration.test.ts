import request from "supertest";
import type { Express } from "express";
import { startIntegrationDatabase } from "../test/integrationDatabase";

describe("recipes API integration", () => {
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

  it("creates ingredients, recipes, recipe ingredients, and cascades recipe ingredients on delete", async () => {
    const ingredientResponse = await request(app)
      .post("/api/ingredients")
      .send({
        label: "Chicken breast",
        caloriesPer100g: 165,
        proteinPer100g: 31,
      })
      .expect(201);

    expect(ingredientResponse.body).toMatchObject({
      value: "chicken-breast",
      label: "Chicken breast",
      caloriesPer100g: "165.00",
      proteinPer100g: "31.00",
    });

    const recipeResponse = await request(app)
      .post("/api/recipes")
      .send({ name: "Chicken bowl" })
      .expect(201);

    const recipeID = recipeResponse.body.id as string;

    const recipeIngredientResponse = await request(app)
      .post(`/api/recipes/${recipeID}/ingredients`)
      .send({
        ingredientValue: "chicken-breast",
        amountGrams: 150,
        calories: 247.5,
        protein: 46.5,
      })
      .expect(201);

    expect(recipeIngredientResponse.body).toMatchObject({
      ingredientValue: "chicken-breast",
      amountGrams: 150,
      calories: 247.5,
      protein: 46.5,
    });

    await request(app).delete(`/api/recipes/${recipeID}`).expect(204);

    await request(app).delete("/api/ingredients/chicken-breast").expect(204);
  });

  it("rejects duplicate ingredients and invalid recipe ingredient input", async () => {
    await request(app)
      .post("/api/ingredients")
      .send({
        label: "Rice",
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
      })
      .expect(201);

    await request(app)
      .post("/api/ingredients")
      .send({
        label: "Rice",
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
      })
      .expect(409);

    const recipeResponse = await request(app)
      .post("/api/recipes")
      .send({ name: "Rice bowl" })
      .expect(201);

    await request(app)
      .post(`/api/recipes/${recipeResponse.body.id}/ingredients`)
      .send({
        ingredientValue: "rice",
        amountGrams: 0,
        calories: 0,
        protein: 0,
      })
      .expect(400);
  });
});
