# Development Guide

## Prerequisites

- Docker + Docker Compose v2.17+

## Running

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs

DB is seeded on startup with 5 users (alice, bob, charlie, diana, eve — password: "password") and 55 images.

## Testing

```bash
docker compose exec backend python -m pytest tests/ -v
```

Single file: `docker compose exec backend python -m pytest tests/test_auth.py -v`

Single test: `docker compose exec backend python -m pytest tests/test_auth.py::test_register_success -v`

Tests use an in-memory SQLite DB — isolated per test, no seed data.

## Formatting

```bash
./format.sh
```

Requires containers to be running (backend formatting runs via `docker compose exec`).
