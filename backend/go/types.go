package main

import "time"

type Workout struct {
	ID           int64        `json:"id"`
	TrainingDate string       `json:"trainingDate"`
	ExerciseType string       `json:"exerciseType"`
	Sets         []WorkoutSet `json:"sets"`
	CreatedAt    time.Time    `json:"createdAt"`
}

type WorkoutSet struct {
	ID        int64     `json:"id"`
	Weight    float64   `json:"weight"`
	Reps      int       `json:"reps"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateWorkoutRequest struct {
	TrainingDate string `json:"trainingDate"`
	ExerciseType string `json:"exerciseType"`
}

type CreateWorkoutSetRequest struct {
	Weight float64 `json:"weight"`
	Reps   int     `json:"reps"`
}

type Exercise struct {
	Value     string    `json:"value"`
	Label     string    `json:"label"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateExerciseRequest struct {
	Label string `json:"label"`
}

type WorkoutPlanDay struct {
	ID        int64             `json:"id"`
	Name      string            `json:"name"`
	Items     []WorkoutPlanItem `json:"items"`
	CreatedAt time.Time         `json:"createdAt"`
}

type WorkoutPlanItem struct {
	ID           int64     `json:"id"`
	ExerciseType string    `json:"exerciseType"`
	CreatedAt    time.Time `json:"createdAt"`
}

type CreateWorkoutPlanDayRequest struct {
	Name string `json:"name"`
}

type CreateWorkoutPlanItemRequest struct {
	ExerciseType string `json:"exerciseType"`
}
