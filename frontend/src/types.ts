export type ExerciseValue = string;
export type ID = string;

export type Exercise = {
  value: ExerciseValue;
  label: string;
  createdAt: string;
};

export type WorkoutSet = {
  id: ID;
  weight: number;
  reps: number;
  createdAt: string;
};

export type Workout = {
  id: ID;
  trainingDate: string;
  exerciseType: ExerciseValue;
  sets: WorkoutSet[];
  createdAt: string;
};

export type ApiError = { error: string };

export type WorkoutForm = {
  trainingDate: string;
  exerciseType: ExerciseValue;
};

export type CreateWorkoutRequest = {
  trainingDate: string;
  exerciseType: ExerciseValue;
};

export type SetForm = {
  weight: string;
  reps: string;
};

export type WorkoutSetRequest = {
  weight: number;
  reps: number;
};

export type CreateWorkoutSetRequest = WorkoutSetRequest & {
  workoutID: ID;
};

export type UpdateWorkoutSetRequest = WorkoutSetRequest & {
  workoutID: ID;
  setID: ID;
};

export type WorkoutPlanItem = {
  id: ID;
  exerciseType: ExerciseValue;
  createdAt: string;
};

export type WorkoutPlanDay = {
  id: ID;
  name: string;
  items: WorkoutPlanItem[];
  createdAt: string;
};

export type CreateWorkoutPlanDayRequest = {
  name: string;
};

export type CreateWorkoutPlanItemRequest = {
  dayID: ID;
  exerciseType: ExerciseValue;
};
