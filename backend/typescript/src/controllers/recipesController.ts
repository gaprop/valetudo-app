import type { Request, Response } from "express";
import type {
  ValidatedRecipeBody,
  ValidatedRecipeIngredientBody,
} from "../middleware/validation";
import { RecipesService } from "../services/recipesService";
import { handleControllerError } from "./helpers";

export class RecipesController {
  static async listRecipes(_req: Request, res: Response) {
    try {
      const recipes = await RecipesService.listRecipes(res.locals.userID as string);
      res.json(recipes);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createRecipe(_req: Request, res: Response) {
    try {
      const recipe = await RecipesService.createRecipe(
        res.locals.userID as string,
        res.locals.recipeBody as ValidatedRecipeBody
      );
      res.status(201).json(recipe);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteRecipe(_req: Request, res: Response) {
    try {
      const recipeID = res.locals.id as string;
      await RecipesService.deleteRecipe(res.locals.userID as string, recipeID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createRecipeIngredient(_req: Request, res: Response) {
    try {
      const recipeID = res.locals.id as string;
      const ingredient = await RecipesService.createRecipeIngredient(
        res.locals.userID as string,
        recipeID,
        res.locals.recipeIngredientBody as ValidatedRecipeIngredientBody
      );
      res.status(201).json(ingredient);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async updateRecipeIngredient(_req: Request, res: Response) {
    try {
      const recipeID = res.locals.id as string;
      const ingredientID = res.locals.ingredientID as string;
      const ingredient = await RecipesService.updateRecipeIngredient(
        res.locals.userID as string,
        recipeID,
        ingredientID,
        res.locals.recipeIngredientBody as ValidatedRecipeIngredientBody
      );
      res.json(ingredient);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteRecipeIngredient(_req: Request, res: Response) {
    try {
      const recipeID = res.locals.id as string;
      const ingredientID = res.locals.ingredientID as string;
      await RecipesService.deleteRecipeIngredient(
        res.locals.userID as string,
        recipeID,
        ingredientID
      );
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
