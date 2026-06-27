# Backend

Go 1.22 HTTP API for the fitness tracker.

## Local Development

Start PostgreSQL and run the schema init service from the project root:

```sh
docker compose up database
```

In a second terminal, apply the schema:

```sh
docker compose run --rm database-init
```

Then start the backend:

```sh
cd backend
go run .
```

The API defaults to `http://localhost:8080`.

## Configuration

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: HTTP port, default `8080`

Default database URL when `DATABASE_URL` is not set:

```text
postgres://fitness:fitness@localhost:5432/fitness?sslmode=disable
```

## API

### `GET /health`

Returns a basic health response:

```json
{
  "status": "ok"
}
```

### `GET /api/exercises`

Returns configured exercises ordered by label.

### `POST /api/exercises`

Creates an exercise. The API derives the stored `value` from the label.

```json
{
  "label": "Squat"
}
```

### `DELETE /api/exercises/{value}`

Deletes an exercise if it is not used by workouts or workout plans.

### `GET /api/workouts`

Returns workout entries ordered oldest first. Each entry includes its set list.

### `POST /api/workouts`

Creates a training entry.

```json
{
  "trainingDate": "2026-06-27",
  "exerciseType": "bench"
}
```

`exerciseType` must match an exercise returned by `GET /api/exercises`.

### `DELETE /api/workouts/{id}`

Deletes a training entry and all of its sets.

### `POST /api/workouts/{id}/sets`

Adds one set to a training entry. Sets are ordered by creation time.

```json
{
  "weight": 80,
  "reps": 8
}
```

### `PATCH /api/workouts/{id}/sets/{setID}`

Updates one set's weight and reps.

```json
{
  "weight": 82.5,
  "reps": 7
}
```

### `DELETE /api/workouts/{id}/sets/{setID}`

Removes one set from a training entry.

### `GET /api/workout-plan/days`

Returns workout plan days ordered by creation time. Each day includes its planned exercises.

### `POST /api/workout-plan/days`

Creates a workout plan day. The day is a schedule label, not a calendar date.

```json
{
  "name": "Push day"
}
```

### `DELETE /api/workout-plan/days/{id}`

Deletes a workout plan day and its planned exercises.

### `POST /api/workout-plan/days/{id}/items`

Adds one exercise to a workout plan day.

```json
{
  "exerciseType": "bench"
}
```

### `DELETE /api/workout-plan/days/{id}/items/{itemID}`

Removes one exercise from a workout plan day.
