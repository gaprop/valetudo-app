import type {
  ValidatedRecipeBody,
  ValidatedRecipeIngredientBody,
} from "../middleware/validation";
import { RecipeIngredientsService } from "./recipes/recipeIngredientsService";
import { RecipeRecordsService } from "./recipes/recipeRecordsService";

export class RecipesService {
  static async listRecipes(userID: string) {
    return RecipeRecordsService.list(userID);
  }

  static async createRecipe(userID: string, recipe: ValidatedRecipeBody) {
    return RecipeRecordsService.create(userID, recipe);
  }

  static async deleteRecipe(userID: string, recipeID: string) {
    return RecipeRecordsService.delete(userID, recipeID);
  }

  static async createRecipeIngredient(
    userID: string,
    recipeID: string,
    ingredient: ValidatedRecipeIngredientBody
  ) {
    return RecipeIngredientsService.create(userID, recipeID, ingredient);
  }

  static async updateRecipeIngredient(
    userID: string,
    recipeID: string,
    ingredientID: string,
    ingredient: ValidatedRecipeIngredientBody
  ) {
    return RecipeIngredientsService.update(
      userID,
      recipeID,
      ingredientID,
      ingredient
    );
  }

  static async deleteRecipeIngredient(
    userID: string,
    recipeID: string,
    ingredientID: string
  ) {
    return RecipeIngredientsService.delete(userID, recipeID, ingredientID);
  }

  static async getRecipe(userID: string, recipeID: string) {
    return RecipeRecordsService.get(userID, recipeID);
  }
}
