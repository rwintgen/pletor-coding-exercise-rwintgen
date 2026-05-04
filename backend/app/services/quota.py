from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import GLOBAL_DAILY_LIMIT, USER_DAILY_LIMIT
from app.models import Image


def _today_start() -> datetime:
    """Return today's UTC midnight as the lower bound for daily counters."""
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


async def get_user_upload_count_today(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(Image)
        .where(Image.user_id == user_id, Image.created_at >= _today_start())
    )
    return result.scalar_one()


async def get_global_upload_count_today(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(Image)
        .where(Image.created_at >= _today_start())
    )
    return result.scalar_one()


async def check_quota(db: AsyncSession, user_id: int) -> dict:
    user_count = await get_user_upload_count_today(db, user_id)
    global_count = await get_global_upload_count_today(db)

    return {
        "user_uploads_today": user_count,
        "user_limit": USER_DAILY_LIMIT,
        "user_remaining": max(0, USER_DAILY_LIMIT - user_count),
        "global_uploads_today": global_count,
        "global_limit": GLOBAL_DAILY_LIMIT,
        "global_remaining": max(0, GLOBAL_DAILY_LIMIT - global_count),
        "can_upload": user_count < USER_DAILY_LIMIT
        and global_count < GLOBAL_DAILY_LIMIT,
    }


async def enforce_quota(db: AsyncSession, user_id: int) -> None:
    user_count = await get_user_upload_count_today(db, user_id)
    if user_count >= USER_DAILY_LIMIT:
        raise QuotaExceededError(
            f"Daily upload limit reached ({USER_DAILY_LIMIT}/day). Resets at midnight UTC."
        )

    global_count = await get_global_upload_count_today(db)
    if global_count >= GLOBAL_DAILY_LIMIT:
        raise QuotaExceededError(
            f"Global upload limit reached ({GLOBAL_DAILY_LIMIT}/day). Resets at midnight UTC."
        )


class QuotaExceededError(Exception):
    def __init__(self, message: str):
        self.message = message
