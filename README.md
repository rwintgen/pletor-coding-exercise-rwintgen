# Fullstack FastAPI + Vite React Project

This project is a template for a modern fullstack app using:
- **Backend:** FastAPI (Python) with `uv` for dependency management and hot-reload
- **Frontend:** Vite + React (JavaScript/TypeScript)
- **Development:** Docker Compose for orchestration, with live reload for both frontend and backend

---


## Coding Exercise: Implement Quotas (~1h)

Implement quotas for image uploads in the backend:

1. **Per-user quota:** Each user can only add up to 5 images per day.
2. The `/images/` POST endpoint should enforce this quota.
3. If a user exceeds their quota, return the appropriate status code
4. Show the user's current quota usage in the frontend
5. **(Bonus)** Add a global rate limit: no more than 100 image uploads per day for all users combined.

---

## Bonus Exercise: User Authentication & Ownership

Add user authentication and image ownership:

1. Add endpoints for user registration and login
2. Store users in the SQLite database
3. Associate each image with its owner
4. Only allow authenticated users to add/delete images.
5. Only allow the owner of an image to delete it.
6. Add an endpoint to get all images for the current user.
7. Update the frontend to support login/logout and show only the user's images.

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose v2.17+](https://docs.docker.com/compose/compose-v2/) (for `docker compose watch`)

---

## Running the Project

From the project root, run:

```bash
docker compose up --build
```

Or, for live reload on file changes (recommended for development):

```bash
docker compose watch
```

---

## Project Structure

```
backend/    # FastAPI app (Python)
frontend/   # Vite + React app (JS/TS)
docker-compose.yml
```

---

## Accessing the Apps

- **Backend (FastAPI):** [http://localhost:8000](http://localhost:8000)
- **Frontend (Vite React):** [http://localhost:5173](http://localhost:5173)

---

## Development Notes

- **Backend:**
  - Hot reload enabled via `uvicorn --reload` and Docker volume mount.
  - Edit code in `backend/` and changes will reflect automatically.
- **Frontend:**
  - Hot reload enabled via Vite dev server and Docker volume mount.
  - Edit code in `frontend/` and changes will reflect automatically.

---
