import axios from "axios";
import type { ApiError, ExerciseType, Workout, WorkoutSet } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const api = axios.create({ baseURL: API_URL });

export async function listWorkouts(): Promise<Workout[]> {
  const response = await api.get<Workout[]>("/api/workouts");
  return response.data;
}

export async function createWorkout(input: {
  trainingDate: string;
  exerciseType: ExerciseType;
}): Promise<Workout> {
  const response = await api.post<Workout>("/api/workouts", input);
  return response.data;
}

export async function addWorkoutSet(input: {
  workoutID: number;
  weight: number;
}): Promise<WorkoutSet> {
  const response = await api.post<WorkoutSet>(
    `/api/workouts/${input.workoutID}/sets`,
    { weight: input.weight }
  );
  return response.data;
}

export async function deleteWorkoutSet(input: {
  workoutID: number;
  setID: number;
}): Promise<void> {
  await api.delete(`/api/workouts/${input.workoutID}/sets/${input.setID}`);
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
