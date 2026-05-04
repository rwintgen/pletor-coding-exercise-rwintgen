import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES
from app.db import get_db
from app.models import Image, User
from app.schemas import ImageRead, QuotaStatus, image_to_dict
from app.services.quota import QuotaExceededError, check_quota, enforce_quota

router = APIRouter(prefix="/images", tags=["images"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload", response_model=ImageRead)
async def upload_image(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a single image. Enforces per-user and global daily quotas,
    rejects unsupported content types, and rejects files larger than
    ``MAX_UPLOAD_BYTES``.
    """
    try:
        await enforce_quota(db, current_user.id)
    except QuotaExceededError as e:
        raise HTTPException(status_code=429, detail=e.message)

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Use JPEG, PNG, GIF, or WebP.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
        )

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename
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
    return image_to_dict(db_image, current_user.username)


@router.get("/", response_model=list[ImageRead])
async def list_images(
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by title or username"),
    user: Optional[str] = Query(None, description="Filter by username"),
    sort: Optional[str] = Query("newest", description="Sort: newest, oldest, title"),
    limit: int = Query(50, ge=1, le=200, description="Page size"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    """Paginated, searchable, sortable image listing. Joins users in a single
    query to avoid N+1 lookups for the ``username`` field.
    """
    stmt = select(Image, User.username).join(User, Image.user_id == User.id)

    if search:
        stmt = stmt.where(
            or_(
                Image.title.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%"),
            )
        )
    if user:
        stmt = stmt.where(User.username == user)

    if sort == "oldest":
        stmt = stmt.order_by(Image.created_at.asc())
    elif sort == "title":
        stmt = stmt.order_by(Image.title.asc())
    else:
        stmt = stmt.order_by(Image.created_at.desc())

    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    return [image_to_dict(row.Image, row.username) for row in result.all()]


@router.get("/quota", response_model=QuotaStatus)
async def get_quota(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the caller's current quota usage and remaining capacity."""
    return await check_quota(db, current_user.id)


@router.get("/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single image with its owner's username, or 404."""
    result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .where(Image.id == image_id)
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image_to_dict(row.Image, row.username)


@router.delete("/{image_id}", status_code=204)
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an image. Only the owner is authorized; non-existent ids return
    404 (idempotent: a second delete on the same id also returns 404).
    """
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
