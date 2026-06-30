import { nutritionForGrams } from "./recipeNutrition";

describe("nutritionForGrams", () => {
  it("scales a per-100g value by the provided grams", () => {
    expect(nutritionForGrams(200, 150)).toBe(300);
  });

  it("accepts gram input as a string", () => {
    expect(nutritionForGrams(25, "40")).toBe(10);
  });

  it("returns zero for invalid gram input", () => {
    expect(nutritionForGrams(25, "not-a-number")).toBe(0);
  });
});
