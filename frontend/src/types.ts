export type ExerciseType = string;

export type ExerciseOption = {
  value: ExerciseType;
  label: string;
  createdAt: string;
};

export type WorkoutSet = {
  id: number;
  weight: number;
  reps: number;
  createdAt: string;
};

export type Workout = {
  id: number;
  trainingDate: string;
  exerciseType: ExerciseType;
  sets: WorkoutSet[];
  createdAt: string;
};

export type ApiError = { error: string };

export type WorkoutForm = {
  trainingDate: string;
  exerciseType: ExerciseType;
};

export type SetForm = {
  weight: string;
  reps: string;
};

export type CreateWorkoutRequest = WorkoutForm;

export type WorkoutSetRequest = {
  weight: number;
  reps: number;
};

export type CreateWorkoutSetRequest = WorkoutSetRequest & {
  workoutID: number;
};

export type UpdateWorkoutSetRequest = WorkoutSetRequest & {
  workoutID: number;
  setID: number;
};

export type WorkoutPlanItem = {
  id: number;
  exerciseType: ExerciseType;
  createdAt: string;
};

export type WorkoutPlanDay = {
  id: number;
  name: string;
  items: WorkoutPlanItem[];
  createdAt: string;
};

export type CreateWorkoutPlanDayRequest = {
  name: string;
};

export type CreateWorkoutPlanItemRequest = {
  dayID: number;
  exerciseType: ExerciseType;
};
