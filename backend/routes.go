package main

import "net/http"

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.health)
	mux.HandleFunc("GET /api/exercises", s.listExercises)
	mux.HandleFunc("POST /api/exercises", s.createExercise)
	mux.HandleFunc("DELETE /api/exercises/{value}", s.deleteExercise)
	mux.HandleFunc("GET /api/workouts", s.listWorkouts)
	mux.HandleFunc("POST /api/workouts", s.createWorkout)
	mux.HandleFunc("DELETE /api/workouts/{id}", s.deleteWorkout)
	mux.HandleFunc("POST /api/workouts/{id}/sets", s.createWorkoutSet)
	mux.HandleFunc("PATCH /api/workouts/{id}/sets/{setID}", s.updateWorkoutSet)
	mux.HandleFunc("DELETE /api/workouts/{id}/sets/{setID}", s.deleteWorkoutSet)
	mux.HandleFunc("GET /api/workout-plan/days", s.listWorkoutPlanDays)
	mux.HandleFunc("POST /api/workout-plan/days", s.createWorkoutPlanDay)
	mux.HandleFunc("DELETE /api/workout-plan/days/{id}", s.deleteWorkoutPlanDay)
	mux.HandleFunc("POST /api/workout-plan/days/{id}/items", s.createWorkoutPlanItem)
	mux.HandleFunc("DELETE /api/workout-plan/days/{id}/items/{itemID}", s.deleteWorkoutPlanItem)
	return cors(mux)
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
