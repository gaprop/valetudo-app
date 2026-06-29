export type TrainingSet = {
  id: string;
  weight: number;
  reps: number;
  createdAt: Date;
};

export type TrainingSession = {
  id: string;
  trainingDate: string;
  exerciseType: string;
  sets: TrainingSet[];
  createdAt: Date;
};

export type PlanExercise = {
  id: string;
  exerciseType: string;
  createdAt: Date;
};

export type PlanDay = {
  id: string;
  name: string;
  items: PlanExercise[];
  createdAt: Date;
};
