import { Router } from "express";
import { RecipesController } from "../controllers/recipesController";
import { asyncHandler } from "../middleware/errors";
import {
  validateRecipeBody,
  validateRecipeIngredientBody,
  validateUUIDPathID,
} from "../middleware/validation";

export const recipesRoutes = Router();

recipesRoutes.get("/", asyncHandler(RecipesController.listRecipes));
recipesRoutes.post(
  "/",
  validateRecipeBody,
  asyncHandler(RecipesController.createRecipe)
);
recipesRoutes.delete(
  "/:id",
  validateUUIDPathID("id", "recipe id"),
  asyncHandler(RecipesController.deleteRecipe)
);
recipesRoutes.post(
  "/:id/ingredients",
  validateUUIDPathID("id", "recipe id"),
  validateRecipeIngredientBody,
  asyncHandler(RecipesController.createRecipeIngredient)
);
recipesRoutes.patch(
  "/:id/ingredients/:ingredientID",
  validateUUIDPathID("id", "recipe id"),
  validateUUIDPathID("ingredientID", "ingredient id"),
  validateRecipeIngredientBody,
  asyncHandler(RecipesController.updateRecipeIngredient)
);
recipesRoutes.delete(
  "/:id/ingredients/:ingredientID",
  validateUUIDPathID("id", "recipe id"),
  validateUUIDPathID("ingredientID", "ingredient id"),
  asyncHandler(RecipesController.deleteRecipeIngredient)
);
