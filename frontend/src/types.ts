export type ExerciseType = "bench" | "dumbell-shoulder" | "dips";

export type ExerciseOption = {
  value: ExerciseType;
  label: string;
};

export type WorkoutSet = {
  id: number;
  setNumber: number;
  weight: number;
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
