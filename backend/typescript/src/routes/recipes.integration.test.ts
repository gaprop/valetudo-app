import request from "supertest";
import { startIntegrationApp } from "../test/integrationApp";

describe("recipes API integration", () => {
  let closeApp: (() => Promise<void>) | null = null;
  let agent: request.Agent;
  let loginAgent: (username?: string, password?: string) => Promise<request.Agent>;
  let seedUser: (username: string, password: string) => Promise<void>;

  beforeAll(async () => {
    const integration = await startIntegrationApp();
    closeApp = integration.close;
    loginAgent = integration.loginAgent;
    seedUser = integration.seedUser;
    agent = await integration.loginAgent();
  }, 60000);

  afterAll(async () => {
    await closeApp?.();
  }, 30000);

  it("creates ingredients, recipes, recipe ingredients, and cascades recipe ingredients on delete", async () => {
    const ingredientResponse = await agent
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

    const recipeResponse = await agent
      .post("/api/recipes")
      .send({ name: "Chicken bowl" })
      .expect(201);

    const recipeID = recipeResponse.body.id as string;

    const recipeIngredientResponse = await agent
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

    await agent.delete(`/api/recipes/${recipeID}`).expect(204);
    await agent.delete("/api/ingredients/chicken-breast").expect(204);
  });

  it("rejects duplicate ingredients and invalid recipe ingredient input", async () => {
    await agent
      .post("/api/ingredients")
      .send({
        label: "Rice",
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
      })
      .expect(201);

    await agent
      .post("/api/ingredients")
      .send({
        label: "Rice",
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
      })
      .expect(409);

    const recipeResponse = await agent
      .post("/api/recipes")
      .send({ name: "Rice bowl" })
      .expect(201);

    await agent
      .post(`/api/recipes/${recipeResponse.body.id}/ingredients`)
      .send({
        ingredientValue: "rice",
        amountGrams: 0,
        calories: 0,
        protein: 0,
      })
      .expect(400);
  });

  it("isolates recipe and ingredient data between users", async () => {
    await seedUser("second", "password");
    const secondAgent = await loginAgent("second", "password");

    await agent
      .post("/api/ingredients")
      .send({
        label: "Isolated oats",
        caloriesPer100g: 389,
        proteinPer100g: 16.9,
      })
      .expect(201);

    await agent.post("/api/recipes").send({ name: "Admin oats" }).expect(201);

    const secondIngredients = await secondAgent.get("/api/ingredients").expect(200);
    const secondRecipes = await secondAgent.get("/api/recipes").expect(200);

    expect(secondIngredients.body).toEqual([]);
    expect(secondRecipes.body).toEqual([]);

    await secondAgent
      .post("/api/ingredients")
      .send({
        label: "Isolated oats",
        caloriesPer100g: 389,
        proteinPer100g: 16.9,
      })
      .expect(201);
  });
});
