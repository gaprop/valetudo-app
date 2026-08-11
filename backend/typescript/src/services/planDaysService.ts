import type {
  ValidatedPlanDayBody,
  ValidatedPlanExerciseBody,
} from "../middleware/validation";
import { PlanDayItemsService } from "./planDays/planDayItemsService";
import { PlanDayRecordsService } from "./planDays/planDayRecordsService";

export class PlanDaysService {
  static async listPlanDays(userID: string) {
    return PlanDayRecordsService.list(userID);
  }

  static async createPlanDay(userID: string, planDay: ValidatedPlanDayBody) {
    return PlanDayRecordsService.create(userID, planDay);
  }

  static async deletePlanDay(userID: string, dayID: string) {
    return PlanDayRecordsService.delete(userID, dayID);
  }

  static async createPlanExercise(
    userID: string,
    dayID: string,
    planExercise: ValidatedPlanExerciseBody
  ) {
    return PlanDayItemsService.create(userID, dayID, planExercise);
  }

  static async deletePlanExercise(userID: string, dayID: string, itemID: string) {
    return PlanDayItemsService.delete(userID, dayID, itemID);
  }
}
