export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
  createdAt: Date;
};

export type Workout = {
  id: string;
  trainingDate: string;
  exerciseType: string;
  sets: WorkoutSet[];
  createdAt: Date;
};

export type WorkoutPlanItem = {
  id: string;
  exerciseType: string;
  createdAt: Date;
};

export type WorkoutPlanDay = {
  id: string;
  name: string;
  items: WorkoutPlanItem[];
  createdAt: Date;
};
