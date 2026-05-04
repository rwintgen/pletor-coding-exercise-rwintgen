# Database Schema

## Users

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| created_at | DATETIME | server default: now() |
| username | TEXT | UNIQUE, NOT NULL |
| hashed_password | TEXT | NOT NULL |

## Images

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| created_at | DATETIME | server default: now() |
| title | TEXT | NOT NULL |
| user_id | INTEGER | NOT NULL, FK → users.id |
| url | TEXT | NOT NULL |
| file_size | INTEGER | nullable |
| content_type | TEXT | nullable |

## Relationships

- `images.user_id` → `users.id` (many-to-one)
- A user owns many images; only the owner can delete their images.

## Seed Data

On first boot, the DB is populated with:
- 5 users: alice, bob, charlie, diana, eve (all with password "password")
- 55 images from Unsplash, distributed: alice(15), bob(12), charlie(10), diana(10), eve(8)
- Timestamps spread across 3 days for realistic ordering
