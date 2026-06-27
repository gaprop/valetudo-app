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
