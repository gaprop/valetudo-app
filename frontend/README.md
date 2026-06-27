# Frontend

React 18, TypeScript, Vite, and Tailwind CSS frontend for the fitness tracker.

## Local Development

Start the backend first, then run:

```sh
cd frontend
npm install
npm run dev
```

The development server defaults to `http://localhost:5173`.

## Configuration

- `VITE_API_URL`: Backend API base URL, default `http://localhost:8080`

## Scripts

Run from `frontend/`:

```sh
npm run dev
npm run build
npm run preview
```

## Docker

The frontend Docker image is built by the root `docker-compose.yml` and serves the production build through nginx.
