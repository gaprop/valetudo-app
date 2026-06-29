package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

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
	dayID, err := parseUUIDPathID(r, "id", "day id")
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
	dayID, err := parseUUIDPathID(r, "id", "day id")
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
	dayID, err := parseUUIDPathID(r, "id", "day id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	itemID, err := parseUUIDPathID(r, "itemID", "item id")
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
