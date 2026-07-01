import type { Request, Response } from "express";
import type { ValidatedIngredientBody } from "../middleware/validation";
import { IngredientsService } from "../services/ingredientsService";
import { handleControllerError } from "./helpers";

export class IngredientsController {
  static async listIngredients(_req: Request, res: Response) {
    try {
      const ingredients = await IngredientsService.listIngredients(res.locals.userID as string);
      res.json(ingredients);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createIngredient(_req: Request, res: Response) {
    try {
      const ingredient = await IngredientsService.createIngredient(
        res.locals.userID as string,
        res.locals.ingredientBody as ValidatedIngredientBody
      );
      res.status(201).json(ingredient);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async updateIngredient(_req: Request, res: Response) {
    try {
      const ingredientValue = res.locals.ingredientValue as string;
      const ingredient = await IngredientsService.updateIngredient(
        res.locals.userID as string,
        ingredientValue,
        res.locals.ingredientBody as ValidatedIngredientBody
      );
      res.json(ingredient);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteIngredient(_req: Request, res: Response) {
    try {
      const ingredientValue = res.locals.ingredientValue as string;
      await IngredientsService.deleteIngredient(res.locals.userID as string, ingredientValue);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
