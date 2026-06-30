import { Router } from "express";
import { IngredientsController } from "../controllers/ingredientsController";
import { asyncHandler } from "../middleware/errors";
import {
  validateIngredientBody,
  validateIngredientPathValue,
} from "../middleware/validation";

export const ingredientsRoutes = Router();

ingredientsRoutes.get("/", asyncHandler(IngredientsController.listIngredients));
ingredientsRoutes.post(
  "/",
  validateIngredientBody,
  asyncHandler(IngredientsController.createIngredient)
);
ingredientsRoutes.patch(
  "/:value",
  validateIngredientPathValue,
  validateIngredientBody,
  asyncHandler(IngredientsController.updateIngredient)
);
ingredientsRoutes.delete(
  "/:value",
  validateIngredientPathValue,
  asyncHandler(IngredientsController.deleteIngredient)
);
