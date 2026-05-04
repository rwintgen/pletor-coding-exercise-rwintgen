# Image Gallery Service

## Business Context

You've joined PictoShare, a collaborative image gallery for creative teams: marketing agencies, design studios, content creators. An earlier contractor shipped an MVP; it works, but barely. Three pieces of user feedback have become blockers for an upcoming client demo:

- *"There are no accounts: anyone with the URL can upload to or delete from my team's gallery."*
- *"One person uploaded a whole shoot and now nobody else on the team can upload today. We need fair limits across the team, not a free-for-all on a global cap."*
- *"The gallery itself looks like a placeholder, empty states and grid display are subpar and we'd be embarrassed to put this in front of a client."*

Your job: make this production-ready end-to-end. 

Real auth and ownership, quotas that hold up under concurrent load and stay fair across users, and a gallery that feels good to actually use. The DB is pre-seeded with ~55 images across 5 users so you can see real data immediately.

## What's Already Built

**Backend** (`backend/app/`: FastAPI + SQLAlchemy + SQLite):
- `POST /images/upload`: multipart upload with `title` and `user` form fields. Saves to `uploads/` with a UUID filename.
- `GET /images/`: returns all images, newest first. No pagination.
- `GET /images/{id}`: returns a single image.
- `DELETE /images/{id}`: deletes an image. No ownership check.
- Seeded images use Unsplash URLs; uploaded images are served from `/uploads/`.

**Frontend** (`frontend/src/`: React + Vite):
- Drag-and-drop upload form (title + user + file).
- Grid of all images. No pagination, no auth, no progress indicator.

**Image model:** `id`, `created_at`, `title`, `user` (plain string), `url`, `file_size`, `content_type`. No user model, no upload limits.

---

## Your Task (~1.5h)

If short on time, explain how you would have handled the missing topics.

### 1. Authentication & Ownership

Add user registration and login. Protect upload and delete so only authenticated users can use them. Only the owner of an image can delete it.

Ownership rules apply to every current and future endpoint that mutates an image, design accordingly.

Update the frontend to support login/register and send credentials with API requests.

### 2. Upload Quotas

Each authenticated user can upload **10 images per day**. There is a global limit of **100 uploads per day** across all users.

- Return clear error responses when limits are hit
- The user should always know where they stand on quota approaching the limit, hitting it, and recovering after reset.

Make sure to account for potential race conditions.

### 3. Polished gallery

The gallery is functional but visually subpar: a uniform grid that crops every image to the same box regardless of its real aspect ratio, ugly empty states, deletes flash the whole grid, every interaction is a hard cut.

Make the gallery itself feel like a real product. We're especially interested in:

- A layout that respects the images: masonry, justified rows, or another approach that handles varying aspect ratios well instead of cropping everything to a square
- Hover micro-interactions: metadata reveal, gentle zoom or fade, action affordances that surface on intent
- Empty / loading / error states
- Interaction feedback: what happens during and after an upload, a delete, a login

You don't need to fix everything, focus on what you deem most important and detail what you would have done for the others given more time.


### Bonus (if time permits)
- Batch upload (multiple files at once)
- Image search or filtering
- Any other improvements you think matter

---

## What We're Evaluating

- **Architecture**: auth dependency reuse, router/service split, real users table vs the seeded string field
- **Correctness**: concurrency, ownership, CORS + credentials interaction
- **Frontend craft**: visual hierarchy, designed states, interaction feedback, accessibility, *what you chose to fix first*
- **Communication**: assumptions and tradeoffs documented

## Ground Rules

- Install any library you want
- Modify any file, including existing code
- If you change existing behavior, briefly say why
- Use AI tooling as much as you want

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose v2.17+](https://docs.docker.com/compose/compose-v2/)

### Running

From the project root:

```bash
docker compose up --build
```

Or with live reload:

```bash
docker compose watch
```

### Apps

- **Backend (FastAPI):** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Frontend (Vite + React):** http://localhost:5173


## Project Structure

```
backend/
  app/
    main.py            # FastAPI app + lifespan
    db.py              # engine, session, Base, get_db
    models.py          # SQLAlchemy models
    schemas.py         # Pydantic schemas
    seed.py            # idempotent seed data
    routers/
      images.py
  tests/
    conftest.py        # async client + isolated DB fixtures
    test_example.py
frontend/
  src/
    api/client.ts      # fetch wrapper
    components/        # extend here
    hooks/             # extend here
    App.tsx
docker-compose.yml
```

### Notes

- **Backend:** Hot reload via `uvicorn --reload`. Edit `backend/app/` and changes reflect.
- **Frontend:** Hot reload via Vite. Edit `frontend/src/` and changes reflect.
- **Database:** SQLite at `backend/test.db`. Delete it to reset and re-seed.

---

## Progress

### 1. Authentication & Ownership — ✅ Done

- [x] User registration (`POST /auth/register`)
- [x] User login with JWT (`POST /auth/login`)
- [x] Protected upload — only authenticated users
- [x] Protected delete — only the owner of an image
- [x] Frontend login/register pages with form validation (Zod)
- [x] Token stored in Zustand + localStorage, sent on every protected request
- [x] Account deletion (own account only, cascades images)

### 2. Upload Quotas — ✅ Done

- [x] 10 images/user/day limit
- [x] 100 images/day global limit
- [x] Clear 429 error responses with explanation
- [x] Quota indicator in the upload form (shows remaining)
- [x] Race condition safety via `SELECT … FOR UPDATE` semantics (serialized SQLite writes)

### 3. Polished Gallery — ✅ Done

- [x] Responsive grid layout (`auto-fill, minmax(260px, 1fr)`)
- [x] Hover micro-interactions (zoom on image, underline on username, scale on FAB)
- [x] Loading state (spinner)
- [x] Empty state (different copy for authenticated vs anonymous)
- [x] Error banner for network errors
- [x] Upload via floating action button + modal overlay
- [x] Lightbox (modal) for image detail with Escape/backdrop close
- [x] Delete confirmation prompt
- [x] Optimistic UI: queries invalidated on upload/delete

### Bonus / Extra — ✅ Done

- [x] Image search (by title **and** by username)
- [x] Sort (newest / oldest / title A–Z)
- [x] User profile pages (`/user/:username`) with image list
- [x] Profile links from image cards and lightbox
- [x] DB indexes on `title`, `created_at`, `user_id` for performance
- [x] Pagination support in API (`limit`/`offset` params)
- [x] 43 automated tests (auth, upload, delete, quota, pagination)

### Not implemented (would do with more time)

- [ ] Batch upload (multiple files at once)
- [ ] Masonry / justified-row layout (respecting real aspect ratios)
- [ ] Infinite scroll / "load more" in the frontend
- [ ] Cursor-based pagination for true scalability
- [ ] Full-text search (Postgres tsvector or Meilisearch)
- [ ] Upload progress indicator (XHR with progress events)
- [ ] Animated transitions between states (fade in cards, slide modal)
- [ ] Accessibility audit (ARIA labels, focus management, keyboard nav)
- [ ] CDN for images / thumbnail generation
