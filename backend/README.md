# Backend

This directory contains two backend implementations:

- `typescript/`: default Express API with routes and controllers split by resource
- `go/`: previous Go 1.22 HTTP API

## Local Development

Start PostgreSQL and run the schema init service from the project root:

```sh
docker compose up database
```

In a second terminal, apply the schema:

```sh
docker compose run --rm database-init
```

Then start the default TypeScript/Express backend:

```sh
cd backend/typescript
npm install
npm run dev
```

The API defaults to `http://localhost:8080`.

When running outside Docker, set the authentication environment variables before starting the backend:

```sh
export AUTH_USERNAME=admin
export AUTH_PASSWORD=password
export AUTH_JWT_SECRET=change-this-secret
export AUTH_COOKIE_SECURE=false
```

To run the Go backend instead:

```sh
cd backend/go
go run .
```

The TypeScript backend route tree is:

```text
src/
├── routes.ts
├── routes/
│   ├── exercisesRoutes.ts
│   ├── workoutsRoutes.ts
│   └── workoutPlanRoutes.ts
└── controllers/
    ├── exercisesController.ts
    ├── workoutsController.ts
    └── workoutPlanController.ts
```

## Configuration

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: HTTP port, default `8080`
- `AUTH_USERNAME`: Seeded login username
- `AUTH_PASSWORD`: Seeded login password
- `AUTH_JWT_SECRET`: Secret used to sign session cookies
- `AUTH_COOKIE_SECURE`: Set to `true` when serving the app over HTTPS

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

### `POST /api/auth/login`

Logs in and sets an HttpOnly session cookie.

```json
{
  "username": "admin",
  "password": "password"
}
```

### `GET /api/auth/me`

Returns the logged-in user.

### `POST /api/auth/logout`

Clears the session cookie.

All other `/api/*` routes require a valid login session.

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
