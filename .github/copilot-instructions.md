# Copilot Instructions

## Workflow

- After each task, update `journal.txt` at the project root. Specify CONCISELY the actions taken and why this approach was chosen over alternatives, and note down every commit made.
- Do NOT commit unless explicitly asked.
- All commit messages MUST use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`.
- READ all documentation in `/docs` before proposing changes.
- UPDATE documentation in `/docs` when code modifications impact project logic.
- Ask for my input every time you have even the slightest doubt about anything. I prefer that rather than you iterating 20 minutes on a wrong lead. Ask me for clarification whenever necessary.

## Coding Standards

- NO inline descriptive or explanatory comments within code blocks.
- USE JSDoc for all function signatures, class definitions, and exported interfaces.
- PRIORITIZE self-documenting naming over external descriptions.
- Use the colors and spacing defined in `frontend/src/theme.ts`.
- Prefer creating and re-using components under `components/` rather than re-implementing the same elements inconsistently.

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- TanStack Query (data fetching & caching)
- Zod (schema validation)
- Zustand (client state)
- Shadcn/ui + Radix (component primitives)

### Backend
- FastAPI + SQLAlchemy + SQLite
- Pydantic (validation & schemas)

## Project Structure

### Frontend (`frontend/src/`)
```
src/
├── api/          # API client, endpoints, types
├── components/   # Reusable UI components
│   └── ui/       # Shadcn/Radix primitives
├── features/     # Feature modules (auth, gallery, upload)
├── hooks/        # Shared custom hooks
├── lib/          # Utilities (zod schemas, helpers)
├── stores/       # Zustand stores
├── theme.ts      # Design tokens (colors, spacing, typography)
├── App.tsx
└── main.tsx
```

### Backend (`backend/app/`)
```
app/
├── routers/      # Route handlers
├── services/     # Business logic
├── models.py     # SQLAlchemy models
├── schemas.py    # Pydantic schemas
├── db.py         # Database setup
├── auth.py       # Auth utilities
└── main.py       # App entrypoint
```
