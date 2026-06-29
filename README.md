# Fitness App

A small full-stack fitness tracker for logging strength training entries. The app records the training date and exercise first, then lets you add as many weighted sets as needed to that entry.

## Stack

- React 18, TypeScript, Vite, and Tailwind CSS frontend
- TypeScript/Express HTTP API, with the previous Go implementation available under `backend/go`
- PostgreSQL 16 database
- Docker Compose for local orchestration

## Features

- Create your own exercises
- Add workout entries for any configured exercise
- Add any number of set weights and reps to each training entry
- Build a reusable workout plan made of day names and planned exercises
- List entries oldest first so the newest entries appear at the bottom
- Show recent set history per exercise
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

## Project Docs

- Backend setup, configuration, and API: [backend/README.md](backend/README.md)
- Frontend setup, configuration, and scripts: [frontend/README.md](frontend/README.md)

## Project Structure

```text
.
├── backend/          # Backend implementations
│   ├── go/           # Previous Go API
│   └── typescript/   # Default Express API
├── database/         # PostgreSQL schema script
├── frontend/         # React/Vite frontend
└── docker-compose.yml
```
