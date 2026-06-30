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

export type Ingredient = {
  value: string;
  label: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  createdAt: Date;
};

export type RecipeIngredient = {
  id: string;
  ingredientValue: string;
  amountGrams: number;
  calories: number;
  protein: number;
  createdAt: Date;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  createdAt: Date;
};
