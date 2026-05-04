# Architecture

## Overview

PictoShare is a collaborative image gallery with authentication, per-user upload quotas, and a polished masonry gallery UI.

## Backend

- **routers/auth.py**: POST /auth/register, POST /auth/login, GET /auth/me
- **routers/images.py**: CRUD for images (upload/delete require auth)
- **auth.py**: bcrypt hashing, JWT (HS256, 24h expiry), `get_current_user` dependency
- **models.py**: SQLAlchemy ORM models (User, Image)
- **schemas.py**: Pydantic request/response schemas (UserCreate, UserRead, Token, ImageRead)
- **seed.py**: Creates users + images on first boot
- **db.py**: Async SQLite via aiosqlite

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Create user, returns UserRead |
| POST | /auth/login | No | Returns JWT access_token |
| GET | /auth/me | Yes | Returns current user |
| GET | /images/ | No | List images (supports ?search, ?user, ?sort) |
| GET | /images/quota | Yes | Returns quota status (user + global) |
| GET | /images/{id} | No | Get single image |
| POST | /images/upload | Yes | Upload image (429 if quota exceeded) |
| DELETE | /images/{id} | Yes | Delete image (owner only, 403 otherwise) |
| GET | /users/{username} | No | Get user profile |
| GET | /users/{username}/images | No | Get all images by a user |

### Search & Sort Query Parameters (GET /images/)

| Param | Type | Description |
|-------|------|-------------|
| search | string | Case-insensitive title search (ILIKE) |
| user | string | Filter by exact username |
| sort | string | `newest` (default), `oldest`, or `title` |
| limit | int | Page size, 1–200 (default 50) |
| offset | int | Pagination offset (default 0) |

### Scalability notes

- DB indexes on `images.title`, `images.created_at`, `images.user_id` for fast queries.
- Pagination via `limit`/`offset` prevents unbounded result sets.
- For millions of images, next steps: full-text search engine (Postgres `tsvector` or Meilisearch), cursor-based pagination, CDN for images, read replicas.

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
- **components/**: composed (`Navbar`, `ImageCard`, `DropZone`, `QuotaIndicator`, `GalleryToolbar`, `Modal`, `EmptyState`, `ErrorBanner`)
- **features/auth/**: `LoginPage`, `RegisterPage`, shared `AuthShell`
- **features/gallery/**: `GalleryPage`, `UploadForm`, `ImageDetail` (lightbox)
- **features/profile/**: `ProfilePage` (user's images with delete for own)
- **theme.ts**: design tokens (colors, spacing, typography, radii, shadows, transitions)
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
