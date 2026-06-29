import { Router } from "express";
import { PlanDaysController } from "../controllers/planDaysController";
import { asyncHandler } from "../middleware/errors";
import {
  validateUUIDPathID,
  validatePlanDayBody,
  validatePlanExerciseBody,
} from "../middleware/validation";

export const planDaysRoutes = Router();

planDaysRoutes.get(
  "/days",
  asyncHandler(PlanDaysController.listPlanDays)
);
planDaysRoutes.post(
  "/days",
  validatePlanDayBody,
  asyncHandler(PlanDaysController.createPlanDay)
);
planDaysRoutes.delete(
  "/days/:id",
  validateUUIDPathID("id", "day id"),
  asyncHandler(PlanDaysController.deletePlanDay)
);
planDaysRoutes.post(
  "/days/:id/items",
  validateUUIDPathID("id", "day id"),
  validatePlanExerciseBody,
  asyncHandler(PlanDaysController.createPlanExercise)
);
planDaysRoutes.delete(
  "/days/:id/items/:itemID",
  validateUUIDPathID("id", "day id"),
  validateUUIDPathID("itemID", "item id"),
  asyncHandler(PlanDaysController.deletePlanExercise)
);
