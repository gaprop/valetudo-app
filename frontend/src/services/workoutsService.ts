import { api } from "../api";
import type {
  CreateWorkoutRequest,
  CreateWorkoutSetRequest,
  ID,
  UpdateWorkoutSetRequest,
  Workout,
  WorkoutSet,
} from "../types";

export const workoutsService = {
  async list(): Promise<Workout[]> {
    const response = await api.get<Workout[]>("/api/workouts");
    return response.data;
  },

  async create(input: CreateWorkoutRequest): Promise<Workout> {
    const response = await api.post<Workout>("/api/workouts", input);
    return response.data;
  },

  async delete(input: { workoutID: ID }): Promise<void> {
    await api.delete(`/api/workouts/${input.workoutID}`);
  },

  async addSet(input: CreateWorkoutSetRequest): Promise<WorkoutSet> {
    const response = await api.post<WorkoutSet>(
      `/api/workouts/${input.workoutID}/sets`,
      { weight: input.weight, reps: input.reps }
    );
    return response.data;
  },

  async updateSet(input: UpdateWorkoutSetRequest): Promise<WorkoutSet> {
    const response = await api.patch<WorkoutSet>(
      `/api/workouts/${input.workoutID}/sets/${input.setID}`,
      { weight: input.weight, reps: input.reps }
    );
    return response.data;
  },

  async deleteSet(input: { workoutID: ID; setID: ID }): Promise<void> {
    await api.delete(`/api/workouts/${input.workoutID}/sets/${input.setID}`);
  },
};
