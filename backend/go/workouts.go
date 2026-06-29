package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func (s *Server) listWorkouts(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
		SELECT id, training_date, exercise_type, created_at
		FROM workout_entries
		ORDER BY training_date, created_at, id
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
	workoutID, err := parsePositivePathID(r, "id", "workout id")
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
