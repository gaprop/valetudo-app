import { api } from "../api";
import type {
  CreatePlanDayRequest,
  CreatePlanExerciseRequest,
  ID,
  PlanDay,
  PlanExercise,
  UpdatePlanDayRequest,
  UpdatePlanExerciseRequest,
} from "../types";
import { expectArrayResponse } from "./responseGuards";

export const planDaysService = {
  async listDays(): Promise<PlanDay[]> {
    const response = await api.get<unknown>("/api/workout-plan/days");
    return expectArrayResponse<PlanDay>(response.data, "Workout plan days");
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

  async updateDay(input: UpdatePlanDayRequest): Promise<PlanDay> {
    const response = await api.put<PlanDay>(
      `/api/workout-plan/days/${input.dayID}`,
      { name: input.name }
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

  async updateItem(
    input: UpdatePlanExerciseRequest
  ): Promise<PlanExercise> {
    const response = await api.put<PlanExercise>(
      `/api/workout-plan/days/${input.dayID}/items/${input.itemID}`,
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
