package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var allowedExerciseTypes = map[string]bool{
	"bench":            true,
	"dumbell-shoulder": true,
	"dips":             true,
}

type Server struct {
	db *pgxpool.Pool
}

type Workout struct {
	ID             int64     `json:"id"`
	TrainingDate   string    `json:"trainingDate"`
	ExerciseType   string    `json:"exerciseType"`
	Sets           int       `json:"sets"`
	Weight         float64   `json:"weight"`
	PreviousSets   *int      `json:"previousSets"`
	PreviousWeight *float64  `json:"previousWeight"`
	CreatedAt      time.Time `json:"createdAt"`
}

type CreateWorkoutRequest struct {
	TrainingDate string  `json:"trainingDate"`
	ExerciseType string  `json:"exerciseType"`
	Sets         int     `json:"sets"`
	Weight       float64 `json:"weight"`
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://fitness:fitness@localhost:5432/fitness?sslmode=disable"
	}

	ctx := context.Background()
	db, err := connectWithRetry(ctx, databaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer db.Close()

	if err := migrate(ctx, db); err != nil {
		log.Fatalf("migrate database: %v", err)
	}

	server := &Server{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", server.health)
	mux.HandleFunc("GET /api/workouts", server.listWorkouts)
	mux.HandleFunc("POST /api/workouts", server.createWorkout)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	handler := cors(mux)
	log.Printf("fitness backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func connectWithRetry(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	var lastErr error
	for attempt := 1; attempt <= 20; attempt++ {
		db, err := pgxpool.New(ctx, databaseURL)
		if err == nil {
			if pingErr := db.Ping(ctx); pingErr == nil {
				return db, nil
			} else {
				lastErr = pingErr
				db.Close()
			}
		} else {
			lastErr = err
		}
		time.Sleep(1 * time.Second)
	}
	return nil, lastErr
}

func migrate(ctx context.Context, db *pgxpool.Pool) error {
	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS workouts (
			id BIGSERIAL PRIMARY KEY,
			training_date DATE NOT NULL,
			exercise_type TEXT NOT NULL CHECK (exercise_type IN ('bench', 'dumbell-shoulder', 'dips')),
			sets INTEGER NOT NULL CHECK (sets > 0),
			weight NUMERIC(8, 2) NOT NULL CHECK (weight >= 0),
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE INDEX IF NOT EXISTS workouts_exercise_date_idx
			ON workouts (exercise_type, training_date DESC, created_at DESC, id DESC);
	`)
	return err
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) listWorkouts(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
		WITH ordered_workouts AS (
			SELECT
				id,
				training_date,
				exercise_type,
				sets,
				weight,
				created_at,
				LAG(sets) OVER (
					PARTITION BY exercise_type
					ORDER BY training_date, created_at, id
				) AS previous_sets,
				LAG(weight) OVER (
					PARTITION BY exercise_type
					ORDER BY training_date, created_at, id
				) AS previous_weight
			FROM workouts
		)
		SELECT id, training_date, exercise_type, sets, weight, previous_sets, previous_weight, created_at
		FROM ordered_workouts
		ORDER BY training_date DESC, created_at DESC, id DESC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list workouts")
		return
	}
	defer rows.Close()

	workouts := []Workout{}
	for rows.Next() {
		var workout Workout
		var trainingDate time.Time
		if err := rows.Scan(
			&workout.ID,
			&trainingDate,
			&workout.ExerciseType,
			&workout.Sets,
			&workout.Weight,
			&workout.PreviousSets,
			&workout.PreviousWeight,
			&workout.CreatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "could not read workout")
			return
		}
		workout.TrainingDate = trainingDate.Format("2006-01-02")
		workouts = append(workouts, workout)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read workouts")
		return
	}

	writeJSON(w, http.StatusOK, workouts)
}

func (s *Server) createWorkout(w http.ResponseWriter, r *http.Request) {
	var req CreateWorkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	trainingDate, err := validateWorkout(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var id int64
	err = s.db.QueryRow(r.Context(), `
		INSERT INTO workouts (training_date, exercise_type, sets, weight)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, trainingDate, req.ExerciseType, req.Sets, req.Weight).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout")
		return
	}

	workout, err := s.getWorkout(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load created workout")
		return
	}

	writeJSON(w, http.StatusCreated, workout)
}

func (s *Server) getWorkout(ctx context.Context, id int64) (Workout, error) {
	var workout Workout
	var trainingDate time.Time
	err := s.db.QueryRow(ctx, `
		WITH ordered_workouts AS (
			SELECT
				id,
				training_date,
				exercise_type,
				sets,
				weight,
				created_at,
				LAG(sets) OVER (
					PARTITION BY exercise_type
					ORDER BY training_date, created_at, id
				) AS previous_sets,
				LAG(weight) OVER (
					PARTITION BY exercise_type
					ORDER BY training_date, created_at, id
				) AS previous_weight
			FROM workouts
		)
		SELECT id, training_date, exercise_type, sets, weight, previous_sets, previous_weight, created_at
		FROM ordered_workouts
		WHERE id = $1
	`, id).Scan(
		&workout.ID,
		&trainingDate,
		&workout.ExerciseType,
		&workout.Sets,
		&workout.Weight,
		&workout.PreviousSets,
		&workout.PreviousWeight,
		&workout.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Workout{}, err
	}
	if err != nil {
		return Workout{}, err
	}

	workout.TrainingDate = trainingDate.Format("2006-01-02")
	return workout, nil
}

func validateWorkout(req CreateWorkoutRequest) (time.Time, error) {
	if !allowedExerciseTypes[req.ExerciseType] {
		return time.Time{}, errors.New("exercise type must be bench, dumbell-shoulder, or dips")
	}
	if req.Sets <= 0 {
		return time.Time{}, errors.New("sets must be greater than zero")
	}
	if req.Weight < 0 {
		return time.Time{}, errors.New("weight cannot be negative")
	}
	if req.Weight > 999999.99 {
		return time.Time{}, errors.New("weight is too large")
	}

	trainingDate, err := time.Parse("2006-01-02", req.TrainingDate)
	if err != nil {
		return time.Time{}, errors.New("trainingDate must use YYYY-MM-DD format")
	}

	return trainingDate, nil
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("write json: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
