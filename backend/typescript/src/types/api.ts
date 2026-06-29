export type WorkoutSet = {
  id: number;
  weight: number;
  reps: number;
  createdAt: Date;
};

export type Workout = {
  id: number;
  trainingDate: string;
  exerciseType: string;
  sets: WorkoutSet[];
  createdAt: Date;
};

export type WorkoutPlanItem = {
  id: number;
  exerciseType: string;
  createdAt: Date;
};

export type WorkoutPlanDay = {
  id: number;
  name: string;
  items: WorkoutPlanItem[];
  createdAt: Date;
};
