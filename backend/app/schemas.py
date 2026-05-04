from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    username: str
    password: str


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
