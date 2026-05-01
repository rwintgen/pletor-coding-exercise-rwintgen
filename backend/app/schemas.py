from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user: str
    url: str
    file_size: int | None = None
    content_type: str | None = None

    model_config = ConfigDict(from_attributes=True)
