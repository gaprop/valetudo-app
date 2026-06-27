# Fitness App

A small full-stack fitness tracker for logging strength training entries. The app records the training date, exercise type, sets, and weight, then shows the previous value for each exercise so progress is easy to compare.

## Stack

- React 18, TypeScript, Vite, and Tailwind CSS frontend
- Go 1.22 HTTP API
- PostgreSQL 16 database
- Docker Compose for local orchestration

## Features

- Add workout entries for bench, dumbell shoulder, and dips
- List all entries newest first
- Show previous sets and weight per exercise type
- Basic API validation for exercise type, date, sets, and weight
- Automatic database table creation on backend startup

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

Start PostgreSQL first. The easiest way is to run only the database service:

```sh
docker compose up database
```

In a second terminal, start the backend:

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

Returns workout entries ordered by newest training date first.

### `POST /api/workouts`

Creates a workout entry.

```json
{
  "trainingDate": "2026-06-27",
  "exerciseType": "bench",
  "sets": 3,
  "weight": 80
}
```

Allowed `exerciseType` values:

- `bench`
- `dumbell-shoulder`
- `dips`

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
├── backend/          # Go API and database migration
├── frontend/         # React/Vite frontend
└── docker-compose.yml
```
