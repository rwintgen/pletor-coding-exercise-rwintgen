"""Centralized application configuration sourced from environment variables.

All tunables (secrets, quotas, CORS origins, upload limits) live here so the
app can be reconfigured per-environment without touching code. Defaults are
safe for local development; production deployments must set ``JWT_SECRET``
explicitly.
"""

import os

# --- Auth ---------------------------------------------------------------
JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", str(60 * 24)))

# --- CORS ---------------------------------------------------------------
# Comma-separated list of allowed origins. ``*`` is rejected when credentials
# are enabled (browser will refuse), so production must list explicit origins.
CORS_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

# --- Uploads ------------------------------------------------------------
ALLOWED_CONTENT_TYPES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}
# 10 MB default; configurable for tighter or looser deployments.
MAX_UPLOAD_BYTES: int = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))

# --- Quotas -------------------------------------------------------------
USER_DAILY_LIMIT: int = int(os.getenv("USER_DAILY_LIMIT", "10"))
GLOBAL_DAILY_LIMIT: int = int(os.getenv("GLOBAL_DAILY_LIMIT", "100"))
