CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS workout_plan_items;
DROP TABLE IF EXISTS workout_plan_days;
DROP TABLE IF EXISTS workout_sets;
DROP TABLE IF EXISTS workout_entries;
DROP TABLE IF EXISTS exercise_types;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	username TEXT NOT NULL UNIQUE CHECK (length(trim(username)) > 0),
	password_hash TEXT NOT NULL CHECK (length(password_hash) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercise_types (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	value TEXT NOT NULL,
	label TEXT NOT NULL CHECK (length(trim(label)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (user_id, value),
	UNIQUE (user_id, label)
);

CREATE TABLE IF NOT EXISTS workout_entries (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_plan_items (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	day_id UUID NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
	exercise_type TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	value TEXT NOT NULL,
	label TEXT NOT NULL CHECK (length(trim(label)) > 0),
	calories_per_100g NUMERIC(8, 2) NOT NULL CHECK (calories_per_100g >= 0),
	protein_per_100g NUMERIC(8, 2) NOT NULL CHECK (protein_per_100g >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (user_id, value),
	UNIQUE (user_id, label)
);

CREATE TABLE IF NOT EXISTS recipes (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
	ingredient_value TEXT NOT NULL,
	amount_grams NUMERIC(8, 2) NOT NULL CHECK (amount_grams > 0),
	calories NUMERIC(8, 2) NOT NULL CHECK (calories >= 0),
	protein NUMERIC(8, 2) NOT NULL CHECK (protein >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	FOREIGN KEY (user_id, ingredient_value)
		REFERENCES ingredients(user_id, value)
		ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS workout_entries_exercise_date_idx
	ON workout_entries (user_id, exercise_type, training_date DESC, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS workout_sets_workout_idx
	ON workout_sets (workout_id, created_at, id);

CREATE INDEX IF NOT EXISTS workout_plan_days_created_idx
	ON workout_plan_days (user_id, created_at, id);

CREATE INDEX IF NOT EXISTS workout_plan_items_day_idx
	ON workout_plan_items (day_id, created_at, id);

CREATE INDEX IF NOT EXISTS ingredients_label_idx
	ON ingredients (user_id, label, value);

CREATE INDEX IF NOT EXISTS recipes_created_idx
	ON recipes (user_id, created_at, id);

CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_idx
	ON recipe_ingredients (recipe_id, created_at, id);
