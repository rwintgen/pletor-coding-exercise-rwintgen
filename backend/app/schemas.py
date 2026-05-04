from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import Image


class UserCreate(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class UserRead(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user_id: int
    username: str
    url: str
    file_size: int | None = None
    content_type: str | None = None

    model_config = ConfigDict(from_attributes=True)


class QuotaStatus(BaseModel):
    user_uploads_today: int
    user_limit: int
    user_remaining: int
    global_uploads_today: int
    global_limit: int
    global_remaining: int
    can_upload: bool


def image_to_dict(image: Image, username: str) -> dict:
    """Serialize an ``Image`` row plus the joined ``username`` into the shape
    expected by the ``ImageRead`` response schema. Used by image and user
    routers to keep the response shape consistent.
    """
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
