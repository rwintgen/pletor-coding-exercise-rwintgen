from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Image, User
from app.schemas import ImageRead, UserRead, image_to_dict

router = APIRouter(prefix="/users", tags=["users"])


async def _get_user_or_404(db: AsyncSession, username: str) -> User:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{username}", response_model=UserRead)
async def get_user_profile(username: str, db: AsyncSession = Depends(get_db)):
    """Return public profile (id, username, created_at) for ``username``."""
    return await _get_user_or_404(db, username)


@router.get("/{username}/images", response_model=list[ImageRead])
async def get_user_images(username: str, db: AsyncSession = Depends(get_db)):
    """Return all images uploaded by ``username``, newest first."""
    user = await _get_user_or_404(db, username)
    images_result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .where(Image.user_id == user.id)
        .order_by(Image.created_at.desc())
    )
    return [image_to_dict(row.Image, row.username) for row in images_result.all()]
