import { api } from "../api";
import type { Exercise } from "../types";
import { expectArrayResponse } from "./responseGuards";

export const exerciseCatalogService = {
  async list(): Promise<Exercise[]> {
    const response = await api.get<unknown>("/api/exercises");
    return expectArrayResponse<Exercise>(response.data, "Exercises");
  },

  async create(input: { label: string }): Promise<Exercise> {
    const response = await api.post<Exercise>("/api/exercises", input);
    return response.data;
  },

  async delete(input: { value: string }): Promise<void> {
    await api.delete(`/api/exercises/${encodeURIComponent(input.value)}`);
  },
};
