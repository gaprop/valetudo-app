package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
)

var nonSlugCharacters = regexp.MustCompile(`[^a-z0-9]+`)

func (s *Server) listExercises(w http.ResponseWriter, r *http.Request) {
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

	exercises := []Exercise{}
	for rows.Next() {
		var exercise Exercise
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

func (s *Server) createExercise(w http.ResponseWriter, r *http.Request) {
	var req CreateExerciseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	label, value, err := validateExercise(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var exercise Exercise
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

func (s *Server) deleteExercise(w http.ResponseWriter, r *http.Request) {
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

func validateExercise(req CreateExerciseRequest) (string, string, error) {
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
