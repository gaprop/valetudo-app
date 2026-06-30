import { HttpError } from "../errors";
import {
  validateRecipeIngredientInput,
  validateRecipeInput,
} from "./recipeValidation";

describe("recipe validation", () => {
  it("validates recipe input", () => {
    expect(validateRecipeInput({ name: "Chicken bowl", ignored: true })).toEqual({
      name: "Chicken bowl",
    });
  });

  it("validates recipe ingredient input", () => {
    expect(
      validateRecipeIngredientInput({
        ingredientValue: "chicken",
        amountGrams: "150",
        calories: "240",
        protein: "45",
      })
    ).toEqual({
      ingredientValue: "chicken",
      amountGrams: 150,
      calories: 240,
      protein: 45,
    });
  });

  it("rejects zero grams", () => {
    expect(() =>
      validateRecipeIngredientInput({
        ingredientValue: "chicken",
        amountGrams: 0,
        calories: 240,
        protein: 45,
      })
    ).toThrow(HttpError);
  });

  it("rejects negative calories", () => {
    expect(() =>
      validateRecipeIngredientInput({
        ingredientValue: "chicken",
        amountGrams: 150,
        calories: -1,
        protein: 45,
      })
    ).toThrow(HttpError);
  });

  it("rejects negative protein", () => {
    expect(() =>
      validateRecipeIngredientInput({
        ingredientValue: "chicken",
        amountGrams: 150,
        calories: 240,
        protein: -1,
      })
    ).toThrow(HttpError);
  });
});
