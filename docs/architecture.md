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
| GET | /images/ | No | List all images (newest first) |
| GET | /images/{id} | No | Get single image |
| POST | /images/upload | Yes | Upload image (multipart: title + file) |
| DELETE | /images/{id} | Yes | Delete image (owner only, 403 otherwise) |

## Auth Flow

1. User registers with username + password
2. Password hashed with bcrypt, stored in users table
3. Login returns JWT access token (24h expiry)
4. Frontend stores token in zustand store (+ localStorage)
5. All mutating requests include Authorization: Bearer header
6. Backend `get_current_user` dependency validates token and injects user

## Frontend

- **api/**: HTTP client (fetch-based), endpoint functions, response types
- **components/ui/**: Reusable Shadcn/Radix primitives
- **components/**: Shared composed components (ImageCard, DropZone, QuotaIndicator, etc.)
- **features/auth/**: Login/Register forms, auth state management
- **features/gallery/**: Gallery grid, image detail, empty/loading states
- **features/upload/**: Upload form, drag-and-drop, batch upload, progress
- **hooks/**: Shared hooks (useAuth, useImages, useQuota)
- **stores/**: Zustand stores for client-side state (auth token, UI state)
- **lib/**: Zod schemas, utility functions, constants

## Quota System (not yet implemented)

- Per-user: 10 uploads/day (resets at midnight UTC)
- Global: 100 uploads/day across all users
- Enforced at service layer with atomic DB count queries
- Race conditions handled via DB-level constraints and transaction isolation
