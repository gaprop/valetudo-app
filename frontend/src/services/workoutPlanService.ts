import { api } from "../api";
import type {
  CreateWorkoutPlanDayRequest,
  CreateWorkoutPlanItemRequest,
  WorkoutPlanDay,
  WorkoutPlanItem,
} from "../types";

export const workoutPlanService = {
  async listDays(): Promise<WorkoutPlanDay[]> {
    const response = await api.get<WorkoutPlanDay[]>("/api/workout-plan/days");
    return response.data;
  },

  async createDay(
    input: CreateWorkoutPlanDayRequest
  ): Promise<WorkoutPlanDay> {
    const response = await api.post<WorkoutPlanDay>(
      "/api/workout-plan/days",
      input
    );
    return response.data;
  },

  async deleteDay(input: { dayID: number }): Promise<void> {
    await api.delete(`/api/workout-plan/days/${input.dayID}`);
  },

  async createItem(
    input: CreateWorkoutPlanItemRequest
  ): Promise<WorkoutPlanItem> {
    const response = await api.post<WorkoutPlanItem>(
      `/api/workout-plan/days/${input.dayID}/items`,
      { exerciseType: input.exerciseType }
    );
    return response.data;
  },

  async deleteItem(input: { dayID: number; itemID: number }): Promise<void> {
    await api.delete(
      `/api/workout-plan/days/${input.dayID}/items/${input.itemID}`
    );
  },
};
