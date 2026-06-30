export type ExerciseValue = string;
export type ID = string;

export type Exercise = {
  value: ExerciseValue;
  label: string;
  createdAt: string;
};

export type TrainingSet = {
  id: ID;
  weight: number;
  reps: number;
  createdAt: string;
};

export type TrainingSession = {
  id: ID;
  trainingDate: string;
  exerciseType: ExerciseValue;
  sets: TrainingSet[];
  createdAt: string;
};

export type ApiError = { error: string };

export type TrainingSessionForm = {
  trainingDate: string;
  exerciseType: ExerciseValue;
};

export type CreateTrainingSessionRequest = {
  trainingDate: string;
  exerciseType: ExerciseValue;
};

export type SetForm = {
  weight: string;
  reps: string;
};

export type TrainingSetRequest = {
  weight: number;
  reps: number;
};

export type CreateTrainingSetRequest = TrainingSetRequest & {
  trainingSessionID: ID;
};

export type UpdateTrainingSetRequest = TrainingSetRequest & {
  trainingSessionID: ID;
  setID: ID;
};

export type PlanExercise = {
  id: ID;
  exerciseType: ExerciseValue;
  createdAt: string;
};

export type PlanDay = {
  id: ID;
  name: string;
  items: PlanExercise[];
  createdAt: string;
};

export type CreatePlanDayRequest = {
  name: string;
};

export type CreatePlanExerciseRequest = {
  dayID: ID;
  exerciseType: ExerciseValue;
};

export type IngredientValue = string;

export type Ingredient = {
  value: IngredientValue;
  label: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  createdAt: string;
};

export type RecipeIngredient = {
  id: ID;
  ingredientValue: IngredientValue;
  amountGrams: number;
  calories: number;
  protein: number;
  createdAt: string;
};

export type Recipe = {
  id: ID;
  name: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
};

export type CreateRecipeRequest = {
  name: string;
};

export type IngredientRequest = {
  label: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

export type RecipeIngredientRequest = {
  ingredientValue: IngredientValue;
  amountGrams: number;
  calories: number;
  protein: number;
};

export type CreateRecipeIngredientRequest = RecipeIngredientRequest & {
  recipeID: ID;
};

export type UpdateRecipeIngredientRequest = RecipeIngredientRequest & {
  recipeID: ID;
  ingredientID: ID;
};
