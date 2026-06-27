import axios from "axios";
import type {
  ApiError,
  ExerciseOption,
  CreateWorkoutRequest,
  CreateWorkoutPlanDayRequest,
  CreateWorkoutPlanItemRequest,
  CreateWorkoutSetRequest,
  UpdateWorkoutSetRequest,
  Workout,
  WorkoutPlanDay,
  WorkoutPlanItem,
  WorkoutSet,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const api = axios.create({ baseURL: API_URL });

export async function listExercises(): Promise<ExerciseOption[]> {
  const response = await api.get<ExerciseOption[]>("/api/exercises");
  return response.data;
}

export async function createExercise(input: {
  label: string;
}): Promise<ExerciseOption> {
  const response = await api.post<ExerciseOption>("/api/exercises", input);
  return response.data;
}

export async function deleteExercise(input: { value: string }): Promise<void> {
  await api.delete(`/api/exercises/${encodeURIComponent(input.value)}`);
}

export async function listWorkouts(): Promise<Workout[]> {
  const response = await api.get<Workout[]>("/api/workouts");
  return response.data;
}

export async function createWorkout(input: CreateWorkoutRequest): Promise<Workout> {
  const response = await api.post<Workout>("/api/workouts", input);
  return response.data;
}

export async function addWorkoutSet(
  input: CreateWorkoutSetRequest
): Promise<WorkoutSet> {
  const response = await api.post<WorkoutSet>(
    `/api/workouts/${input.workoutID}/sets`,
    { weight: input.weight, reps: input.reps }
  );
  return response.data;
}

export async function updateWorkoutSet(
  input: UpdateWorkoutSetRequest
): Promise<WorkoutSet> {
  const response = await api.patch<WorkoutSet>(
    `/api/workouts/${input.workoutID}/sets/${input.setID}`,
    { weight: input.weight, reps: input.reps }
  );
  return response.data;
}

export async function deleteWorkout(input: { workoutID: number }): Promise<void> {
  await api.delete(`/api/workouts/${input.workoutID}`);
}

export async function deleteWorkoutSet(input: {
  workoutID: number;
  setID: number;
}): Promise<void> {
  await api.delete(`/api/workouts/${input.workoutID}/sets/${input.setID}`);
}

export async function listWorkoutPlanDays(): Promise<WorkoutPlanDay[]> {
  const response = await api.get<WorkoutPlanDay[]>("/api/workout-plan/days");
  return response.data;
}

export async function createWorkoutPlanDay(
  input: CreateWorkoutPlanDayRequest
): Promise<WorkoutPlanDay> {
  const response = await api.post<WorkoutPlanDay>(
    "/api/workout-plan/days",
    input
  );
  return response.data;
}

export async function deleteWorkoutPlanDay(input: {
  dayID: number;
}): Promise<void> {
  await api.delete(`/api/workout-plan/days/${input.dayID}`);
}

export async function createWorkoutPlanItem(
  input: CreateWorkoutPlanItemRequest
): Promise<WorkoutPlanItem> {
  const response = await api.post<WorkoutPlanItem>(
    `/api/workout-plan/days/${input.dayID}/items`,
    { exerciseType: input.exerciseType }
  );
  return response.data;
}

export async function deleteWorkoutPlanItem(input: {
  dayID: number;
  itemID: number;
}): Promise<void> {
  await api.delete(`/api/workout-plan/days/${input.dayID}/items/${input.itemID}`);
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
