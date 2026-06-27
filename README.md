# Fitness App

A small full-stack fitness tracker for logging strength training entries. The app records the training date and exercise type first, then lets you add as many weighted sets as needed to that entry.

## Stack

- React 18, TypeScript, Vite, and Tailwind CSS frontend
- Go 1.22 HTTP API
- PostgreSQL 16 database
- Docker Compose for local orchestration

## Features

- Add workout entries for bench, dumbell shoulder, and dips
- Add any number of set weights to each training entry
- Build a reusable workout plan made of day names and planned training types
- List all entries newest first
- Show recent set history per exercise type
- Basic API validation for exercise type, date, and set weight
- Database schema setup through a Docker Compose init service

## Quick Start

Run the full app with Docker Compose:

```sh
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:8080/health

PostgreSQL is exposed on `localhost:5432` with these local credentials:

```text
user: fitness
password: fitness
database: fitness
```

## Local Development

Start PostgreSQL and run the schema init service first:

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

The backend uses this default database URL when `DATABASE_URL` is not set:

```text
postgres://fitness:fitness@localhost:5432/fitness?sslmode=disable
```

In a third terminal, start the frontend:

```sh
cd frontend
npm install
npm run dev
```

The frontend reads `VITE_API_URL` and defaults to:

```text
http://localhost:8080
```

## API

### `GET /health`

Returns a basic health response:

```json
{
  "status": "ok"
}
```

### `GET /api/workouts`

Returns workout entries ordered by newest training date first. Each entry includes its set list.

### `POST /api/workouts`

Creates a training entry.

```json
{
  "trainingDate": "2026-06-27",
  "exerciseType": "bench"
}
```

Allowed `exerciseType` values:

- `bench`
- `dumbell-shoulder`
- `dips`

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

Returns workout plan days ordered by creation time. Each day includes its planned training types.

### `POST /api/workout-plan/days`

Creates a workout plan day. The day is a schedule label, not a calendar date.

```json
{
  "name": "Push day"
}
```

### `DELETE /api/workout-plan/days/{id}`

Deletes a workout plan day and its planned training types.

### `POST /api/workout-plan/days/{id}/items`

Adds one training type to a workout plan day.

```json
{
  "exerciseType": "bench"
}
```

### `DELETE /api/workout-plan/days/{id}/items/{itemID}`

Removes one training type from a workout plan day.

## Frontend Scripts

Run from `frontend/`:

```sh
npm run dev
npm run build
npm run preview
```

## Configuration

Backend environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: HTTP port, default `8080`

Frontend environment variables:

- `VITE_API_URL`: Backend API base URL, default `http://localhost:8080`

## Project Structure

```text
.
├── backend/          # Go API
├── database/         # PostgreSQL schema script
├── frontend/         # React/Vite frontend
└── docker-compose.yml
```
