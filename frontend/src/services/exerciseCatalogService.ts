import { api } from "../api";
import type { Exercise } from "../types";

export const exerciseCatalogService = {
  async list(): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>("/api/exercises");
    return response.data;
  },

  async create(input: { label: string }): Promise<Exercise> {
    const response = await api.post<Exercise>("/api/exercises", input);
    return response.data;
  },

  async delete(input: { value: string }): Promise<void> {
    await api.delete(`/api/exercises/${encodeURIComponent(input.value)}`);
  },
};
