from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Image, User
from app.schemas import ImageRead, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{username}", response_model=UserRead)
async def get_user_profile(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{username}/images", response_model=list[ImageRead])
async def get_user_images(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    images_result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .where(Image.user_id == user.id)
        .order_by(Image.created_at.desc())
    )
    return [
        {
            "id": row.Image.id,
            "created_at": row.Image.created_at,
            "title": row.Image.title,
            "user_id": row.Image.user_id,
            "username": row.username,
            "url": row.Image.url,
            "file_size": row.Image.file_size,
            "content_type": row.Image.content_type,
        }
        for row in images_result.all()
    ]
