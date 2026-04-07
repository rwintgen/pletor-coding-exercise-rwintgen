# Image Gallery Service

## Context

You've joined a team that inherited this image gallery application. It was built as a quick MVP, images can be uploaded and displayed, but there's no authentication, no usage limits, and the gallery loads every image at once regardless of how many exist.

The database is pre-seeded with ~55 images across 5 users. Leadership wants this production-ready before onboarding more users. Your job is to add the missing pieces.

## What's Already Built

**Backend** (`backend/main.py` — FastAPI + SQLAlchemy + SQLite):
- `POST /images/upload` — accepts a multipart file upload with `title` and `user` form fields. Saves the file to `uploads/` with a UUID filename.
- `GET /images/` — returns all images, newest first. No pagination.
- `GET /images/{id}` — returns a single image.
- `DELETE /images/{id}` — deletes an image. No ownership check.
- Seeded images use Unsplash URLs; uploaded images are served from `/uploads/`.

**Frontend** (`frontend/src/App.tsx` — React + Vite):
- Single-file app with a drag-and-drop upload form (title + user + file).
- Displays all images in a grid. No pagination, no auth, no progress indicator.

**Image model:** `id`, `created_at`, `title`, `user` (plain string), `url`, `file_size`, `content_type`.

There is no authentication, no user model, and no upload limits.

---

## Your Task (~1.5 hours)

Complete the following in order of priority. We're more interested in your thought process and trade-off decisions than seeing everything completed. Feel free to leave TODOs or notes about what you would do with more time.

### 1. Authentication

Add user registration and login endpoints. Protect the upload and delete endpoints so only authenticated users can use them. Only the owner of an image should be able to delete it.

You can use any auth approach (JWT, sessions, etc.)

Update the frontend to support login/register and send credentials with API requests.

### 2. Upload Quotas

Each authenticated user can upload a maximum of **10 images per day**. There is a global limit of **100 uploads per day** across all users.

- The API should return clear error responses when limits are hit
- The UI should show the user how many uploads they have remaining today

### 3. Pagination

The `GET /images/` endpoint currently returns all images at once. Add limit/offset pagination to the API. Update the frontend to paginate the gallery. The database has 55+ images to verify this works.

### 4. Upload Progress

Show upload progress in the UI when a user uploads a file. The current implementation gives no feedback between clicking "Upload" and completion.

### 5. Write a Test

Write at least one backend test for the quota logic. `pytest`, `pytest-asyncio`, and `httpx` are available. We want to see how you think about testing, not full coverage.

### Bonus (if time permits)

- Batch upload (multiple files at once)
- Image search or filtering
- Any other improvements you think matter

---

## What We're Evaluating

- **Architecture decisions:** How you structure auth, where you put quota logic, how you design the pagination API
- **API design:** Proper status codes, clear error messages, RESTful conventions
- **Frontend quality:** Component structure, state management, user experience
- **Testing approach:** What you choose to test and why
- **Trade-off communication:** TODOs and comments about what you'd improve with more time

**Note:** The existing codebase is intentionally kept simple. Any improvement you make to the existing code (structure, patterns, error handling, types, etc.) is appreciated and will be taken into account.

**Important:** Partial implementations with clear explanations are better than rushed complete ones.

## Ground Rules

- You can install any library you want (backend or frontend)
- You can modify any file in the project, including configuration, structure, and existing code
- If you change something that already existed, briefly explain why

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose v2.17+](https://docs.docker.com/compose/compose-v2/) (for `docker compose watch`)

### Running the Project

From the project root:

```bash
docker compose up --build
```

Or, for live reload on file changes (recommended):

```bash
docker compose watch
```

### Accessing the Apps

- **Backend (FastAPI):** [http://localhost:8000](http://localhost:8000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend (Vite + React):** [http://localhost:5173](http://localhost:5173)

## Project Structure

```
backend/    # FastAPI app (Python)
frontend/   # Vite + React app (TypeScript)
docker-compose.yml
```

### Development Notes

- **Backend:** Hot reload via `uvicorn --reload`. Edit `backend/` and changes reflect automatically.
- **Frontend:** Hot reload via Vite. Edit `frontend/src/` and changes reflect automatically.
- **Database:** SQLite at `backend/test.db`. Delete it to reset and re-seed.
