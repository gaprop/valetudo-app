import { api } from "../api";
import type {
  CreatePlanDayRequest,
  CreatePlanExerciseRequest,
  ID,
  PlanDay,
  PlanExercise,
} from "../types";

export const planDaysService = {
  async listDays(): Promise<PlanDay[]> {
    const response = await api.get<PlanDay[]>("/api/workout-plan/days");
    return response.data;
  },

  async createDay(
    input: CreatePlanDayRequest
  ): Promise<PlanDay> {
    const response = await api.post<PlanDay>(
      "/api/workout-plan/days",
      input
    );
    return response.data;
  },

  async deleteDay(input: { dayID: ID }): Promise<void> {
    await api.delete(`/api/workout-plan/days/${input.dayID}`);
  },

  async createItem(
    input: CreatePlanExerciseRequest
  ): Promise<PlanExercise> {
    const response = await api.post<PlanExercise>(
      `/api/workout-plan/days/${input.dayID}/items`,
      { exerciseType: input.exerciseType }
    );
    return response.data;
  },

  async deleteItem(input: { dayID: ID; itemID: ID }): Promise<void> {
    await api.delete(
      `/api/workout-plan/days/${input.dayID}/items/${input.itemID}`
    );
  },
};
