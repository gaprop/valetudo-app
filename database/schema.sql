CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	training_date DATE NOT NULL,
	exercise_type TEXT NOT NULL,
	legacy_workout_id BIGINT UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_entries
	DROP CONSTRAINT IF EXISTS workout_entries_exercise_type_check;

CREATE TABLE IF NOT EXISTS workout_sets (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	workout_id UUID NOT NULL REFERENCES workout_entries(id) ON DELETE CASCADE,
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
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_plan_items (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	day_id UUID NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
	exercise_type TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_plan_items
	DROP CONSTRAINT IF EXISTS workout_plan_items_exercise_type_check;

DROP INDEX IF EXISTS workout_entries_exercise_date_idx;
DROP INDEX IF EXISTS workout_sets_workout_idx;
DROP INDEX IF EXISTS workout_plan_days_created_idx;
DROP INDEX IF EXISTS workout_plan_items_day_idx;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'workout_entries'
			AND column_name = 'id'
			AND data_type <> 'uuid'
	) THEN
		ALTER TABLE workout_entries ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
		UPDATE workout_entries SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
		ALTER TABLE workout_entries ALTER COLUMN uuid_id SET NOT NULL;

		ALTER TABLE workout_sets ADD COLUMN workout_uuid UUID;
		UPDATE workout_sets sets
		SET workout_uuid = entries.uuid_id
		FROM workout_entries entries
		WHERE sets.workout_id = entries.id;
		ALTER TABLE workout_sets ALTER COLUMN workout_uuid SET NOT NULL;

		ALTER TABLE workout_sets DROP CONSTRAINT IF EXISTS workout_sets_workout_id_fkey;
		ALTER TABLE workout_entries DROP CONSTRAINT IF EXISTS workout_entries_pkey;
		ALTER TABLE workout_sets DROP COLUMN workout_id;
		ALTER TABLE workout_entries DROP COLUMN id;
		ALTER TABLE workout_entries RENAME COLUMN uuid_id TO id;
		ALTER TABLE workout_sets RENAME COLUMN workout_uuid TO workout_id;
		ALTER TABLE workout_entries ADD PRIMARY KEY (id);
		ALTER TABLE workout_sets
			ADD CONSTRAINT workout_sets_workout_id_fkey
			FOREIGN KEY (workout_id) REFERENCES workout_entries(id) ON DELETE CASCADE;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'workout_sets'
			AND column_name = 'id'
			AND data_type <> 'uuid'
	) THEN
		ALTER TABLE workout_sets ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
		UPDATE workout_sets SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
		ALTER TABLE workout_sets ALTER COLUMN uuid_id SET NOT NULL;

		ALTER TABLE workout_sets DROP CONSTRAINT IF EXISTS workout_sets_pkey;
		ALTER TABLE workout_sets DROP COLUMN id;
		ALTER TABLE workout_sets RENAME COLUMN uuid_id TO id;
		ALTER TABLE workout_sets ADD PRIMARY KEY (id);
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'workout_plan_days'
			AND column_name = 'id'
			AND data_type <> 'uuid'
	) THEN
		ALTER TABLE workout_plan_days ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
		UPDATE workout_plan_days SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
		ALTER TABLE workout_plan_days ALTER COLUMN uuid_id SET NOT NULL;

		ALTER TABLE workout_plan_items ADD COLUMN day_uuid UUID;
		UPDATE workout_plan_items items
		SET day_uuid = days.uuid_id
		FROM workout_plan_days days
		WHERE items.day_id = days.id;
		ALTER TABLE workout_plan_items ALTER COLUMN day_uuid SET NOT NULL;

		ALTER TABLE workout_plan_items DROP CONSTRAINT IF EXISTS workout_plan_items_day_id_fkey;
		ALTER TABLE workout_plan_days DROP CONSTRAINT IF EXISTS workout_plan_days_pkey;
		ALTER TABLE workout_plan_items DROP COLUMN day_id;
		ALTER TABLE workout_plan_days DROP COLUMN id;
		ALTER TABLE workout_plan_days RENAME COLUMN uuid_id TO id;
		ALTER TABLE workout_plan_items RENAME COLUMN day_uuid TO day_id;
		ALTER TABLE workout_plan_days ADD PRIMARY KEY (id);
		ALTER TABLE workout_plan_items
			ADD CONSTRAINT workout_plan_items_day_id_fkey
			FOREIGN KEY (day_id) REFERENCES workout_plan_days(id) ON DELETE CASCADE;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'workout_plan_items'
			AND column_name = 'id'
			AND data_type <> 'uuid'
	) THEN
		ALTER TABLE workout_plan_items ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
		UPDATE workout_plan_items SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
		ALTER TABLE workout_plan_items ALTER COLUMN uuid_id SET NOT NULL;

		ALTER TABLE workout_plan_items DROP CONSTRAINT IF EXISTS workout_plan_items_pkey;
		ALTER TABLE workout_plan_items DROP COLUMN id;
		ALTER TABLE workout_plan_items RENAME COLUMN uuid_id TO id;
		ALTER TABLE workout_plan_items ADD PRIMARY KEY (id);
	END IF;
END $$;

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

CREATE INDEX IF NOT EXISTS workout_entries_exercise_date_idx
	ON workout_entries (exercise_type, training_date DESC, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS workout_sets_workout_idx
	ON workout_sets (workout_id, created_at, id);

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
