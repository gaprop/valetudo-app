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

- `VITE_API_URL`: Browser API base URL. Use `http://localhost:8080` for Vite development, but leave it empty in Railway so requests use the frontend domain.
- `BACKEND_URL`: nginx proxy target for production Docker/Railway, for example the backend Railway public URL.

## Railway

The frontend includes `frontend/railway.json` for Railway config-as-code.

Use these Railway service settings:

- Root Directory: `/frontend`
- Config File: `/frontend/railway.json`
- Public domain enabled

Set the frontend nginx proxy target to the backend Railway public URL:

```text
BACKEND_URL=https://${{<backend-service-name>.RAILWAY_PUBLIC_DOMAIN}}
VITE_API_URL=
```

## Scripts

Run from `frontend/`:

```sh
npm run dev
npm run build
npm run preview
```

## Docker

The frontend Docker image is built by the root `docker-compose.yml` and serves the production build through nginx.
