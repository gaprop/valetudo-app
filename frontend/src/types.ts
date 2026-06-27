export type ExerciseType = "bench" | "dumbell-shoulder" | "dips";

export type ExerciseOption = {
  value: ExerciseType;
  label: string;
};

export type WorkoutSet = {
  id: number;
  setNumber: number;
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
