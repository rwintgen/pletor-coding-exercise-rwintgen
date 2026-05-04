# Architecture

## Overview

PictoShare is a collaborative image gallery with authentication, per-user upload quotas, and a polished masonry gallery UI.

## Backend

- **config.py**: Centralized configuration sourced from environment variables (JWT secret/expiry, CORS origins, upload size cap, quotas). All tunables live here so deployments can override without touching code. See `.env.example` for the full list.
- **routers/auth.py**: POST /auth/register, POST /auth/login, GET /auth/me, DELETE /auth/account
- **routers/images.py**: CRUD for images (upload/delete require auth, owner-only delete)
- **routers/users.py**: GET /users/{username}, GET /users/{username}/images
- **services/quota.py**: Daily quota counters + `enforce_quota()` (per-user + global)
- **auth.py**: bcrypt hashing, JWT (HS256), `get_current_user` dependency — secret + expiry sourced from `config.py`
- **models.py**: SQLAlchemy ORM models (User, Image) with cascade delete on user → images
- **schemas.py**: Pydantic request/response schemas + `image_to_dict` helper used by both image and user routers to keep response shape consistent
- **seed.py**: Creates users + images on first boot
- **db.py**: Async SQLite via aiosqlite

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Create user, returns UserRead |
| POST | /auth/login | No | Returns JWT access_token |
| GET | /auth/me | Yes | Returns current user |
| DELETE | /auth/account | Yes | Delete the calling user (cascades images) |
| GET | /images/ | No | List images (supports ?search, ?user, ?sort, ?limit, ?offset) |
| GET | /images/quota | Yes | Returns quota status (user + global) |
| GET | /images/{id} | No | Get single image |
| POST | /images/upload | Yes | Upload image (400 wrong type, 413 too large, 429 quota exceeded) |
| DELETE | /images/{id} | Yes | Delete image (owner only — 403 otherwise, 404 if missing, idempotent) |
| GET | /users/{username} | No | Get user profile |
| GET | /users/{username}/images | No | Get all images by a user |

### Search & Sort Query Parameters (GET /images/)

| Param | Type | Description |
|-------|------|-------------|
| search | string | Case-insensitive ILIKE on title **and** username |
| user | string | Filter by exact username |
| sort | string | `newest` (default), `oldest`, or `title` |
| limit | int | Page size, 1–200 (default 50) |
| offset | int | Pagination offset (default 0) |

### Scalability notes

- DB indexes on `images.title`, `images.created_at`, `images.user_id` for fast queries.
- Pagination via `limit`/`offset` prevents unbounded result sets.

## Auth Flow

1. User registers with username + password
2. Password hashed with bcrypt, stored in users table
3. Login returns JWT access token (24h expiry)
4. Frontend stores token in Zustand store (persisted to localStorage via `zustand/middleware`)
5. All mutating requests include Authorization: Bearer header
6. Backend `get_current_user` dependency validates token and injects user
7. On reload, `App.tsx` calls `/auth/me`; on 401 the auth store is cleared

## Frontend

- **api/client.ts**: fetch-based HTTP client; reads JWT from auth store
- **stores/auth.ts**: Zustand store with `persist` middleware (token + user persisted to localStorage)
- **lib/schemas.ts**: Zod validation schemas (login, register, upload)
- **lib/queryClient.ts**: TanStack Query client singleton
- **hooks/useImages.ts**: `useImages`, `useUserImages`, `useUploadImage`, `useDeleteImage` query/mutation hooks
- **hooks/useQuota.ts**: `useQuota` query hook (skipped when unauthenticated)
- **components/ui/**: primitives (`Button`, `Input`, `Card`, `Spinner`)
- **components/**: composed (`Navbar`, `ImageCard`, `DropZone`, `QuotaIndicator`, `GalleryToolbar`, `Modal`, `EmptyState`, `ErrorBanner`, `Fab`)
- **features/auth/**: `LoginPage`, `RegisterPage`, shared `AuthShell`
- **features/gallery/**: `GalleryPage` (masonry grid + FAB upload), `UploadForm` (single + batch), `ImageDetail` (lightbox)
- **features/profile/**: `ProfilePage` (user's images with delete for own)
- **theme.ts**: design tokens (colors, gradients, spacing, typography, radii, shadows, transitions). `colors.neutral/primary/accent` resolve to CSS variables defined in `index.css`, which lets the app **automatically follow the system dark/light preference** via `@media (prefers-color-scheme: dark)` — no toggle, no flash, no per-component refactor.
- **index.css**: global CSS variables (light + dark palettes), keyframes (`slideUp`, `scaleIn`, `shimmer`, `pulse`), `.page-enter` / `.stagger-fade` animation utilities, `.masonry` multi-column layout (responsive 4→3→2→1 columns).
- **App.tsx**: `BrowserRouter` with routes `/`, `/login`, `/register`, `/user/:username`; revalidates persisted token via `/auth/me` on mount

### Routing

| Path | Behavior |
|------|----------|
| `/` | Public gallery with search/sort toolbar; upload panel shown only when authenticated |
| `/user/:username` | User profile — shows their images; owner can delete |
| `/login` | Redirects to `/` if already authenticated |
| `/register` | Redirects to `/` if already authenticated |
| `*` | Redirects to `/` |

### State boundaries

- **Server state** → TanStack Query (images, quota). Mutations invalidate the relevant queries.
- **Auth state** → Zustand (token, user). Persisted via `zustand/middleware` `persist` under key `auth`.
- **Local UI state** → component `useState` (form fields, modal open, drag-over).

## Quota System

- Per-user: 10 uploads/day, global: 100 uploads/day (resets at midnight UTC)
- Enforced in `services/quota.py` via COUNT queries filtered by `created_at >= today_start`
- `enforce_quota()` called before file write — fails fast with 429
- `GET /images/quota` returns remaining counts so frontend can show approaching/hit/recovered states
- Race conditions: SQLite serializes writes; for Postgres, use `SELECT ... FOR UPDATE` or advisory locks
