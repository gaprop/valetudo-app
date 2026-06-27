CREATE TABLE IF NOT EXISTS exercise_types (
	value TEXT PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (length(trim(label)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO exercise_types (value, label)
VALUES
	('bench', 'Bænk'),
	('upper-dumbell', 'Upper dumbell'),
	('dips', 'Dips'),
	('skulderpress', 'Skulderpress'),
	('side-laterals', 'Side Laterals'),
	('tricep-extensions', 'Tricep extensions'),
	('pullups', 'Pullups'),
	('dumbell-rows', 'Dumbell Rows'),
	('pulldown-wide', 'Pulldown wide'),
	('upright-row', 'Upright row'),
	('ryg', 'Ryg'),
	('bicep-curl', 'Bicep curl'),
	('doedloeft', 'Dødløft'),
	('squat', 'Squat'),
	('calf-raises', 'Calf raises'),
	('mave-hjul', 'Mave hjul'),
	('pulldown-short', 'Pulldown short'),
	('rows', 'Rows'),
	('rows-dumbell', 'Rows dumbell')
ON CONFLICT (value) DO UPDATE
SET label = EXCLUDED.label;

CREATE TABLE IF NOT EXISTS workout_entries (
	id BIGSERIAL PRIMARY KEY,
	training_date DATE NOT NULL,
	exercise_type TEXT NOT NULL,
	legacy_workout_id BIGINT UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_entries
	DROP CONSTRAINT IF EXISTS workout_entries_exercise_type_check;

CREATE TABLE IF NOT EXISTS workout_sets (
	id BIGSERIAL PRIMARY KEY,
	workout_id BIGINT NOT NULL REFERENCES workout_entries(id) ON DELETE CASCADE,
	weight NUMERIC(8, 2) NOT NULL CHECK (weight >= 0),
	reps INTEGER NOT NULL DEFAULT 1 CHECK (reps > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_sets
	ADD COLUMN IF NOT EXISTS reps INTEGER NOT NULL DEFAULT 1 CHECK (reps > 0);

ALTER TABLE workout_sets
	DROP CONSTRAINT IF EXISTS workout_sets_workout_id_set_number_key;

ALTER TABLE workout_sets
	DROP COLUMN IF EXISTS set_number;

CREATE INDEX IF NOT EXISTS workout_entries_exercise_date_idx
	ON workout_entries (exercise_type, training_date DESC, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS workout_sets_workout_idx
	ON workout_sets (workout_id, created_at, id);

CREATE TABLE IF NOT EXISTS workout_plan_days (
	id BIGSERIAL PRIMARY KEY,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_plan_items (
	id BIGSERIAL PRIMARY KEY,
	day_id BIGINT NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
	exercise_type TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_plan_items
	DROP CONSTRAINT IF EXISTS workout_plan_items_exercise_type_check;

DELETE FROM exercise_types
WHERE value = 'dumbell-shoulder'
	AND NOT EXISTS (
		SELECT 1
		FROM workout_entries
		WHERE exercise_type = 'dumbell-shoulder'
	)
	AND NOT EXISTS (
		SELECT 1
		FROM workout_plan_items
		WHERE exercise_type = 'dumbell-shoulder'
	);

CREATE INDEX IF NOT EXISTS workout_plan_days_created_idx
	ON workout_plan_days (created_at, id);

CREATE INDEX IF NOT EXISTS workout_plan_items_day_idx
	ON workout_plan_items (day_id, created_at, id);

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
		INSERT INTO workout_sets (workout_id, weight, reps, created_at)
		SELECT inserted.id, legacy.weight, 1, legacy.created_at + ((series.set_index - 1) * interval '1 millisecond')
		FROM inserted
		JOIN legacy ON legacy.id = inserted.legacy_workout_id
		CROSS JOIN LATERAL generate_series(1, legacy.sets) AS series(set_index);
	END IF;
END $$;
