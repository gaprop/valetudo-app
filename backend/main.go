package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var nonSlugCharacters = regexp.MustCompile(`[^a-z0-9]+`)

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

type ExerciseType struct {
	Value     string    `json:"value"`
	Label     string    `json:"label"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateExerciseTypeRequest struct {
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

	server := &Server{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", server.health)
	mux.HandleFunc("GET /api/exercises", server.listExerciseTypes)
	mux.HandleFunc("POST /api/exercises", server.createExerciseType)
	mux.HandleFunc("DELETE /api/exercises/{value}", server.deleteExerciseType)
	mux.HandleFunc("GET /api/workouts", server.listWorkouts)
	mux.HandleFunc("POST /api/workouts", server.createWorkout)
	mux.HandleFunc("DELETE /api/workouts/{id}", server.deleteWorkout)
	mux.HandleFunc("POST /api/workouts/{id}/sets", server.createWorkoutSet)
	mux.HandleFunc("PATCH /api/workouts/{id}/sets/{setID}", server.updateWorkoutSet)
	mux.HandleFunc("DELETE /api/workouts/{id}/sets/{setID}", server.deleteWorkoutSet)
	mux.HandleFunc("GET /api/workout-plan/days", server.listWorkoutPlanDays)
	mux.HandleFunc("POST /api/workout-plan/days", server.createWorkoutPlanDay)
	mux.HandleFunc("DELETE /api/workout-plan/days/{id}", server.deleteWorkoutPlanDay)
	mux.HandleFunc("POST /api/workout-plan/days/{id}/items", server.createWorkoutPlanItem)
	mux.HandleFunc("DELETE /api/workout-plan/days/{id}/items/{itemID}", server.deleteWorkoutPlanItem)

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

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) listExerciseTypes(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
		SELECT value, label, created_at
		FROM exercise_types
		ORDER BY label, value
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list exercises")
		return
	}
	defer rows.Close()

	exercises := []ExerciseType{}
	for rows.Next() {
		var exercise ExerciseType
		if err := rows.Scan(&exercise.Value, &exercise.Label, &exercise.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "could not read exercise")
			return
		}
		exercises = append(exercises, exercise)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read exercises")
		return
	}

	writeJSON(w, http.StatusOK, exercises)
}

func (s *Server) createExerciseType(w http.ResponseWriter, r *http.Request) {
	var req CreateExerciseTypeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	label, value, err := validateExerciseType(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var exercise ExerciseType
	err = s.db.QueryRow(r.Context(), `
		INSERT INTO exercise_types (value, label)
		VALUES ($1, $2)
		RETURNING value, label, created_at
	`, value, label).Scan(&exercise.Value, &exercise.Label, &exercise.CreatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			writeError(w, http.StatusConflict, "exercise already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not create exercise")
		return
	}

	writeJSON(w, http.StatusCreated, exercise)
}

func (s *Server) deleteExerciseType(w http.ResponseWriter, r *http.Request) {
	value := strings.TrimSpace(r.PathValue("value"))
	if value == "" {
		writeError(w, http.StatusBadRequest, "exercise is required")
		return
	}

	var used bool
	err := s.db.QueryRow(r.Context(), `
		SELECT EXISTS (
			SELECT 1 FROM workout_entries WHERE exercise_type = $1
			UNION ALL
			SELECT 1 FROM workout_plan_items WHERE exercise_type = $1
		)
	`, value).Scan(&used)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete exercise")
		return
	}
	if used {
		writeError(w, http.StatusBadRequest, "exercise is used by workouts or plans")
		return
	}

	commandTag, err := s.db.Exec(r.Context(), `
		DELETE FROM exercise_types
		WHERE value = $1
	`, value)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete exercise")
		return
	}
	if commandTag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "exercise was not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
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
	req.ExerciseType = strings.TrimSpace(req.ExerciseType)

	trainingDate, err := s.validateWorkout(r.Context(), req)
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
		INSERT INTO workout_sets (workout_id, weight, reps)
		VALUES ($1, $2, $3)
		RETURNING id, weight, reps, created_at
	`, workoutID, req.Weight, req.Reps).Scan(
		&workoutSet.ID,
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
		RETURNING id, weight, reps, created_at
	`, workoutID, setID, req.Weight, req.Reps).Scan(
		&workoutSet.ID,
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

	commandTag, err := s.db.Exec(r.Context(), `
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

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) listWorkoutPlanDays(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
		SELECT id, name, created_at
		FROM workout_plan_days
		ORDER BY created_at, id
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list workout plan")
		return
	}
	defer rows.Close()

	days := []WorkoutPlanDay{}
	for rows.Next() {
		var day WorkoutPlanDay
		if err := rows.Scan(&day.ID, &day.Name, &day.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "could not read workout plan")
			return
		}
		day.Items = []WorkoutPlanItem{}
		days = append(days, day)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read workout plan")
		return
	}

	if err := s.loadWorkoutPlanItems(r.Context(), days); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read workout plan items")
		return
	}

	writeJSON(w, http.StatusOK, days)
}

func (s *Server) createWorkoutPlanDay(w http.ResponseWriter, r *http.Request) {
	var req CreateWorkoutPlanDayRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	name, err := validateWorkoutPlanDay(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var day WorkoutPlanDay
	err = s.db.QueryRow(r.Context(), `
		INSERT INTO workout_plan_days (name)
		VALUES ($1)
		RETURNING id, name, created_at
	`, name).Scan(&day.ID, &day.Name, &day.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout plan day")
		return
	}
	day.Items = []WorkoutPlanItem{}

	writeJSON(w, http.StatusCreated, day)
}

func (s *Server) deleteWorkoutPlanDay(w http.ResponseWriter, r *http.Request) {
	dayID, err := parsePositivePathID(r, "id", "day id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	commandTag, err := s.db.Exec(r.Context(), `
		DELETE FROM workout_plan_days
		WHERE id = $1
	`, dayID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workout plan day")
		return
	}
	if commandTag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "workout plan day was not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) createWorkoutPlanItem(w http.ResponseWriter, r *http.Request) {
	dayID, err := parsePositivePathID(r, "id", "day id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var req CreateWorkoutPlanItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.ExerciseType = strings.TrimSpace(req.ExerciseType)
	if err := s.validateWorkoutPlanItem(r.Context(), req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout plan item")
		return
	}
	defer tx.Rollback(r.Context())

	var exists bool
	err = tx.QueryRow(r.Context(), `
		SELECT EXISTS (
			SELECT 1
			FROM workout_plan_days
			WHERE id = $1
		)
	`, dayID).Scan(&exists)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout plan item")
		return
	}
	if !exists {
		writeError(w, http.StatusNotFound, "workout plan day was not found")
		return
	}

	var item WorkoutPlanItem
	err = tx.QueryRow(r.Context(), `
		INSERT INTO workout_plan_items (day_id, exercise_type)
		VALUES ($1, $2)
		RETURNING id, exercise_type, created_at
	`, dayID, req.ExerciseType).Scan(&item.ID, &item.ExerciseType, &item.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout plan item")
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workout plan item")
		return
	}

	writeJSON(w, http.StatusCreated, item)
}

func (s *Server) deleteWorkoutPlanItem(w http.ResponseWriter, r *http.Request) {
	dayID, err := parsePositivePathID(r, "id", "day id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	itemID, err := parsePositivePathID(r, "itemID", "item id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	commandTag, err := s.db.Exec(r.Context(), `
		DELETE FROM workout_plan_items
		WHERE day_id = $1 AND id = $2
	`, dayID, itemID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workout plan item")
		return
	}
	if commandTag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "workout plan item was not found")
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
			SELECT id, weight, reps, created_at
			FROM workout_sets
			WHERE workout_id = $1
			ORDER BY created_at, id
		`, workouts[index].ID)
		if err != nil {
			return err
		}

		for rows.Next() {
			var workoutSet WorkoutSet
			if err := rows.Scan(
				&workoutSet.ID,
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

func (s *Server) loadWorkoutPlanItems(ctx context.Context, days []WorkoutPlanDay) error {
	for index := range days {
		rows, err := s.db.Query(ctx, `
			SELECT id, exercise_type, created_at
			FROM workout_plan_items
			WHERE day_id = $1
			ORDER BY created_at, id
		`, days[index].ID)
		if err != nil {
			return err
		}

		for rows.Next() {
			var item WorkoutPlanItem
			if err := rows.Scan(&item.ID, &item.ExerciseType, &item.CreatedAt); err != nil {
				rows.Close()
				return err
			}
			days[index].Items = append(days[index].Items, item)
		}

		if err := rows.Err(); err != nil {
			rows.Close()
			return err
		}
		rows.Close()
	}

	return nil
}

func (s *Server) validateWorkout(ctx context.Context, req CreateWorkoutRequest) (time.Time, error) {
	if err := s.validateExerciseValue(ctx, req.ExerciseType); err != nil {
		return time.Time{}, err
	}

	trainingDate, err := time.Parse("2006-01-02", req.TrainingDate)
	if err != nil {
		return time.Time{}, errors.New("trainingDate must use YYYY-MM-DD format")
	}

	return trainingDate, nil
}

func validateExerciseType(req CreateExerciseTypeRequest) (string, string, error) {
	label := strings.TrimSpace(req.Label)
	if label == "" {
		return "", "", errors.New("exercise name is required")
	}
	if len(label) > 80 {
		return "", "", errors.New("exercise name is too long")
	}

	value := slugifyExerciseLabel(label)
	if value == "" {
		return "", "", errors.New("exercise name must include letters or numbers")
	}

	return label, value, nil
}

func slugifyExerciseLabel(label string) string {
	value := strings.ToLower(strings.TrimSpace(label))
	value = nonSlugCharacters.ReplaceAllString(value, "-")
	return strings.Trim(value, "-")
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

func validateWorkoutPlanDay(req CreateWorkoutPlanDayRequest) (string, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return "", errors.New("day name is required")
	}
	if len(name) > 80 {
		return "", errors.New("day name is too long")
	}

	return name, nil
}

func (s *Server) validateWorkoutPlanItem(ctx context.Context, req CreateWorkoutPlanItemRequest) error {
	return s.validateExerciseValue(ctx, req.ExerciseType)
}

func (s *Server) validateExerciseValue(ctx context.Context, value string) error {
	value = strings.TrimSpace(value)
	if value == "" {
		return errors.New("exercise is required")
	}

	var exists bool
	err := s.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM exercise_types
			WHERE value = $1
		)
	`, value).Scan(&exists)
	if err != nil {
		return errors.New("could not validate exercise")
	}
	if !exists {
		return errors.New("exercise does not exist")
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
