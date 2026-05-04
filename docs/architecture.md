# Architecture

## Overview

PictoShare is a collaborative image gallery with authentication, per-user upload quotas, and a polished masonry gallery UI.

## Frontend Architecture

- **api/**: HTTP client (fetch-based), endpoint functions, response types
- **components/ui/**: Reusable Shadcn/Radix primitives (Button, Input, Dialog, etc.)
- **components/**: Shared composed components (ImageCard, DropZone, QuotaIndicator, etc.)
- **features/auth/**: Login/Register forms, auth state management
- **features/gallery/**: Gallery grid, image detail, empty/loading states
- **features/upload/**: Upload form, drag-and-drop, batch upload, progress
- **hooks/**: Shared hooks (useAuth, useImages, useQuota)
- **stores/**: Zustand stores for client-side state (auth token, UI state)
- **lib/**: Zod schemas, utility functions, constants

## Backend Architecture

- **routers/**: Thin HTTP handlers — parse request, call service, return response
- **services/**: Business logic layer (auth, images, quotas)
- **models.py**: SQLAlchemy ORM models (User, Image)
- **schemas.py**: Pydantic request/response schemas
- **auth.py**: JWT token creation/verification, password hashing, dependency injection
- **db.py**: Database session management

## Auth Flow

1. User registers with username + password
2. Password hashed with bcrypt, stored in users table
3. Login returns JWT access token
4. Frontend stores token in zustand store (+ localStorage)
5. All mutating requests include Authorization: Bearer header
6. Backend `get_current_user` dependency validates token and injects user

## Quota System

- Per-user: 10 uploads/day (resets at midnight UTC)
- Global: 100 uploads/day across all users
- Enforced at service layer with atomic DB count queries
- Race conditions handled via DB-level constraints and transaction isolation
