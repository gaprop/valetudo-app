package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
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
	ID           int64        `json:"id"`
	TrainingDate string       `json:"trainingDate"`
	ExerciseType string       `json:"exerciseType"`
	Sets         []WorkoutSet `json:"sets"`
	CreatedAt    time.Time    `json:"createdAt"`
}

type WorkoutSet struct {
	ID        int64     `json:"id"`
	SetNumber int       `json:"setNumber"`
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
	mux.HandleFunc("DELETE /api/workouts/{id}", server.deleteWorkout)
	mux.HandleFunc("POST /api/workouts/{id}/sets", server.createWorkoutSet)
	mux.HandleFunc("PATCH /api/workouts/{id}/sets/{setID}", server.updateWorkoutSet)
	mux.HandleFunc("DELETE /api/workouts/{id}/sets/{setID}", server.deleteWorkoutSet)

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
		CREATE TABLE IF NOT EXISTS workout_entries (
			id BIGSERIAL PRIMARY KEY,
			training_date DATE NOT NULL,
			exercise_type TEXT NOT NULL CHECK (exercise_type IN ('bench', 'dumbell-shoulder', 'dips')),
			legacy_workout_id BIGINT UNIQUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE IF NOT EXISTS workout_sets (
			id BIGSERIAL PRIMARY KEY,
			workout_id BIGINT NOT NULL REFERENCES workout_entries(id) ON DELETE CASCADE,
			set_number INTEGER NOT NULL CHECK (set_number > 0),
			weight NUMERIC(8, 2) NOT NULL CHECK (weight >= 0),
			reps INTEGER NOT NULL DEFAULT 1 CHECK (reps > 0),
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			UNIQUE (workout_id, set_number)
		);

		ALTER TABLE workout_sets
			ADD COLUMN IF NOT EXISTS reps INTEGER NOT NULL DEFAULT 1 CHECK (reps > 0);

		CREATE INDEX IF NOT EXISTS workout_entries_exercise_date_idx
			ON workout_entries (exercise_type, training_date DESC, created_at DESC, id DESC);

		CREATE INDEX IF NOT EXISTS workout_sets_workout_idx
			ON workout_sets (workout_id, set_number);

		DO $$
		BEGIN
			IF to_regclass('public.workouts') IS NOT NULL THEN
				WITH legacy AS (
					SELECT id, training_date, exercise_type, sets, weight, created_at
					FROM workouts old
					WHERE NOT EXISTS (
						SELECT 1
						FROM workout_entries entry
						WHERE entry.legacy_workout_id = old.id
					)
				),
				inserted AS (
					INSERT INTO workout_entries (training_date, exercise_type, legacy_workout_id, created_at)
					SELECT training_date, exercise_type, id, created_at
					FROM legacy
					RETURNING id, legacy_workout_id
				)
		INSERT INTO workout_sets (workout_id, set_number, weight, reps, created_at)
		SELECT inserted.id, series.set_number, legacy.weight, 1, legacy.created_at
				FROM inserted
				JOIN legacy ON legacy.id = inserted.legacy_workout_id
				CROSS JOIN LATERAL generate_series(1, legacy.sets) AS series(set_number)
				ON CONFLICT DO NOTHING;
			END IF;
		END $$;
	`)
	return err
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) listWorkouts(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
		SELECT id, training_date, exercise_type, created_at
		FROM workout_entries
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
			&workout.CreatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "could not read workout")
			return
		}
		workout.TrainingDate = trainingDate.Format("2006-01-02")
		workout.Sets = []WorkoutSet{}
		workouts = append(workouts, workout)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read workouts")
		return
	}

	if err := s.loadSets(r.Context(), workouts); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read workout sets")
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
		INSERT INTO workout_entries (training_date, exercise_type)
		VALUES ($1, $2)
		RETURNING id
	`, trainingDate, req.ExerciseType).Scan(&id)
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

func (s *Server) deleteWorkout(w http.ResponseWriter, r *http.Request) {
	workoutID, err := parsePositivePathID(r, "id", "workout id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	commandTag, err := s.db.Exec(r.Context(), `
		DELETE FROM workout_entries
		WHERE id = $1
	`, workoutID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workout")
		return
	}
	if commandTag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "workout was not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) createWorkoutSet(w http.ResponseWriter, r *http.Request) {
	workoutID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || workoutID <= 0 {
		writeError(w, http.StatusBadRequest, "workout id must be a positive number")
		return
	}

	var req CreateWorkoutSetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := validateWorkoutSet(req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout set")
		return
	}
	defer tx.Rollback(r.Context())

	var exists bool
	err = tx.QueryRow(r.Context(), `
		SELECT EXISTS (
			SELECT 1
			FROM workout_entries
			WHERE id = $1
		)
	`, workoutID).Scan(&exists)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout set")
		return
	}
	if !exists {
		writeError(w, http.StatusNotFound, "workout was not found")
		return
	}

	var workoutSet WorkoutSet
	err = tx.QueryRow(r.Context(), `
		INSERT INTO workout_sets (workout_id, set_number, weight, reps)
		SELECT $1, COALESCE(MAX(set_number), 0) + 1, $2, $3
		FROM workout_sets
		WHERE workout_id = $1
		RETURNING id, set_number, weight, reps, created_at
	`, workoutID, req.Weight, req.Reps).Scan(
		&workoutSet.ID,
		&workoutSet.SetNumber,
		&workoutSet.Weight,
		&workoutSet.Reps,
		&workoutSet.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout set")
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout set")
		return
	}

	writeJSON(w, http.StatusCreated, workoutSet)
}

func (s *Server) updateWorkoutSet(w http.ResponseWriter, r *http.Request) {
	workoutID, err := parsePositivePathID(r, "id", "workout id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	setID, err := parsePositivePathID(r, "setID", "set id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var req CreateWorkoutSetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := validateWorkoutSet(req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var workoutSet WorkoutSet
	err = s.db.QueryRow(r.Context(), `
		UPDATE workout_sets
		SET weight = $3, reps = $4
		WHERE workout_id = $1 AND id = $2
		RETURNING id, set_number, weight, reps, created_at
	`, workoutID, setID, req.Weight, req.Reps).Scan(
		&workoutSet.ID,
		&workoutSet.SetNumber,
		&workoutSet.Weight,
		&workoutSet.Reps,
		&workoutSet.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusNotFound, "workout set was not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not update workout set")
		return
	}

	writeJSON(w, http.StatusOK, workoutSet)
}

func (s *Server) deleteWorkoutSet(w http.ResponseWriter, r *http.Request) {
	workoutID, err := parsePositivePathID(r, "id", "workout id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	setID, err := parsePositivePathID(r, "setID", "set id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workout set")
		return
	}
	defer tx.Rollback(r.Context())

	commandTag, err := tx.Exec(r.Context(), `
		DELETE FROM workout_sets
		WHERE workout_id = $1 AND id = $2
	`, workoutID, setID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workout set")
		return
	}
	if commandTag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "workout set was not found")
		return
	}

	if _, err := tx.Exec(r.Context(), `
		WITH numbered AS (
			SELECT
				id,
				ROW_NUMBER() OVER (ORDER BY set_number, created_at, id) AS next_set_number
			FROM workout_sets
			WHERE workout_id = $1
		)
		UPDATE workout_sets sets
		SET set_number = numbered.next_set_number
		FROM numbered
		WHERE sets.id = numbered.id
	`, workoutID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not reorder workout sets")
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workout set")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) getWorkout(ctx context.Context, id int64) (Workout, error) {
	var workout Workout
	var trainingDate time.Time
	err := s.db.QueryRow(ctx, `
		SELECT id, training_date, exercise_type, created_at
		FROM workout_entries
		WHERE id = $1
	`, id).Scan(
		&workout.ID,
		&trainingDate,
		&workout.ExerciseType,
		&workout.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Workout{}, err
	}
	if err != nil {
		return Workout{}, err
	}

	workout.TrainingDate = trainingDate.Format("2006-01-02")
	workouts := []Workout{workout}
	workouts[0].Sets = []WorkoutSet{}
	if err := s.loadSets(ctx, workouts); err != nil {
		return Workout{}, err
	}

	return workouts[0], nil
}

func (s *Server) loadSets(ctx context.Context, workouts []Workout) error {
	for index := range workouts {
		rows, err := s.db.Query(ctx, `
			SELECT id, set_number, weight, reps, created_at
			FROM workout_sets
			WHERE workout_id = $1
			ORDER BY set_number
		`, workouts[index].ID)
		if err != nil {
			return err
		}

		for rows.Next() {
			var workoutSet WorkoutSet
			if err := rows.Scan(
				&workoutSet.ID,
				&workoutSet.SetNumber,
				&workoutSet.Weight,
				&workoutSet.Reps,
				&workoutSet.CreatedAt,
			); err != nil {
				rows.Close()
				return err
			}
			workouts[index].Sets = append(workouts[index].Sets, workoutSet)
		}

		if err := rows.Err(); err != nil {
			rows.Close()
			return err
		}
		rows.Close()
	}

	return nil
}

func validateWorkout(req CreateWorkoutRequest) (time.Time, error) {
	if !allowedExerciseTypes[req.ExerciseType] {
		return time.Time{}, errors.New("exercise type must be bench, dumbell-shoulder, or dips")
	}

	trainingDate, err := time.Parse("2006-01-02", req.TrainingDate)
	if err != nil {
		return time.Time{}, errors.New("trainingDate must use YYYY-MM-DD format")
	}

	return trainingDate, nil
}

func validateWorkoutSet(req CreateWorkoutSetRequest) error {
	if req.Weight < 0 {
		return errors.New("weight cannot be negative")
	}
	if req.Weight > 999999.99 {
		return errors.New("weight is too large")
	}
	if req.Reps <= 0 {
		return errors.New("reps must be greater than zero")
	}

	return nil
}

func parsePositivePathID(r *http.Request, name string, label string) (int64, error) {
	id, err := strconv.ParseInt(r.PathValue(name), 10, 64)
	if err != nil || id <= 0 {
		return 0, errors.New(label + " must be a positive number")
	}

	return id, nil
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")

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
