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
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_sets (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	workout_id UUID NOT NULL REFERENCES workout_entries(id) ON DELETE CASCADE,
	weight NUMERIC(8, 2) NOT NULL CHECK (weight >= 0),
	reps INTEGER NOT NULL CHECK (reps > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS workout_entries_exercise_date_idx
	ON workout_entries (exercise_type, training_date DESC, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS workout_sets_workout_idx
	ON workout_sets (workout_id, created_at, id);

CREATE INDEX IF NOT EXISTS workout_plan_days_created_idx
	ON workout_plan_days (created_at, id);

CREATE INDEX IF NOT EXISTS workout_plan_items_day_idx
	ON workout_plan_items (day_id, created_at, id);
