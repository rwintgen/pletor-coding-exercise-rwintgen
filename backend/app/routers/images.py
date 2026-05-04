import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.db import get_db
from app.models import Image, User
from app.schemas import ImageRead

router = APIRouter(prefix="/images", tags=["images"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


def _image_to_response(image: Image, username: str) -> dict:
    return {
        "id": image.id,
        "created_at": image.created_at,
        "title": image.title,
        "user_id": image.user_id,
        "username": username,
        "url": image.url,
        "file_size": image.file_size,
        "content_type": image.content_type,
    }


@router.post("/upload", response_model=ImageRead)
async def upload_image(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Use JPEG, PNG, GIF, or WebP.",
        )

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename

    content = await file.read()
    file_path.write_bytes(content)

    db_image = Image(
        title=title,
        user_id=current_user.id,
        url=f"/uploads/{filename}",
        file_size=len(content),
        content_type=file.content_type,
    )
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return _image_to_response(db_image, current_user.username)


@router.get("/", response_model=list[ImageRead])
async def list_images(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .order_by(Image.created_at.desc())
    )
    return [_image_to_response(row.Image, row.username) for row in result.all()]


@router.get("/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .where(Image.id == image_id)
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return _image_to_response(row.Image, row.username)


@router.delete("/{image_id}", status_code=204)
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if image.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only delete your own images"
        )
    await db.delete(image)
    await db.commit()
    return None
