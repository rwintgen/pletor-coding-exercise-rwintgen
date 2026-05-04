from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.models import Image, User

TITLES = [
    "Sunset Beach",
    "Mountain View",
    "City Lights",
    "Green Valley",
    "Forest Path",
    "River Bend",
    "Hilltop Dawn",
    "Coastal Cliff",
    "Desert Road",
    "Lake Reflection",
    "Autumn Leaves",
    "Misty Morning",
    "Ocean Waves",
    "Night Sky",
    "Snow Peak",
    "Wildflower Field",
    "Canyon View",
    "Waterfall",
    "Tropical Island",
    "Rocky Shore",
    "Foggy Bridge",
    "Starry Night",
    "Alpine Meadow",
    "Quiet Harbor",
    "Rolling Hills",
    "Sunset Clouds",
    "Frozen Lake",
    "Pine Forest",
    "Coral Reef",
    "Volcanic Peak",
    "Sand Dunes",
    "Cherry Blossoms",
    "Northern Lights",
    "Bamboo Grove",
    "Lavender Field",
    "Glacier Bay",
    "Rainforest",
    "Prairie Sunset",
    "Mediterranean Coast",
    "Redwood Trail",
    "Tidal Pool",
    "Mossy Creek",
    "Storm Clouds",
    "Golden Hour",
    "Mountain Lake",
    "Cliffside Village",
    "Bioluminescent Bay",
    "Ancient Ruins",
    "Terraced Rice Fields",
    "Lighthouse Point",
    "Sahara Dusk",
    "Fjord Morning",
    "Jungle Canopy",
    "Volcano Sunrise",
    "Coral Atoll",
]

USERS = ["alice", "bob", "charlie", "diana", "eve"]
USER_COUNTS = [15, 12, 10, 10, 8]

# Varied aspect ratios + resolutions to stress-test the masonry layout.
# Cycled through deterministically so reseeds are stable.
DIMENSIONS = [
    (1200, 800),  # 3:2 landscape
    (800, 1200),  # 2:3 portrait
    (1000, 1000),  # square
    (1600, 900),  # 16:9 widescreen
    (900, 1600),  # 9:16 tall portrait
    (1400, 700),  # 2:1 panoramic
    (600, 800),  # 3:4 portrait, lower-res
    (1800, 1200),  # 3:2 high-res landscape
    (700, 1050),  # 2:3 portrait, mid-res
    (1024, 768),  # 4:3 classic landscape
    (768, 1024),  # 3:4 classic portrait
    (1200, 1500),  # 4:5 social-media portrait
]

# Pre-defined timestamps spanning ~2 years with uneven spacing and a few
# deliberate duplicates so the gallery exercises stable sort and "same-day"
# rendering. The seed picks them deterministically by index so output is
# reproducible across reseeds.
_BASE = datetime(2026, 5, 4, 12, 0, 0, tzinfo=timezone.utc)


def _ts(days: int, hours: int = 0) -> datetime:
    return _BASE - timedelta(days=days, hours=hours)


TIMESTAMPS = [
    _ts(0, 2),  # today
    _ts(0, 5),  # today (same day, different hour)
    _ts(2, 0),
    _ts(2, 0),  # duplicate of previous (same exact created_at)
    _ts(7, 4),
    _ts(14, 0),
    _ts(21, 8),
    _ts(30, 0),
    _ts(30, 0),  # duplicate
    _ts(45, 6),
    _ts(60, 0),
    _ts(75, 12),
    _ts(90, 0),
    _ts(110, 3),
    _ts(130, 0),
    _ts(150, 9),
    _ts(170, 0),
    _ts(170, 0),  # duplicate
    _ts(195, 0),
    _ts(220, 5),
    _ts(245, 0),
    _ts(270, 0),
    _ts(295, 11),
    _ts(320, 0),
    _ts(345, 0),
    _ts(345, 0),  # duplicate
    _ts(370, 7),
    _ts(395, 0),
    _ts(420, 0),
    _ts(445, 4),
    _ts(470, 0),
    _ts(495, 0),
    _ts(520, 10),
    _ts(545, 0),
    _ts(570, 0),
    _ts(595, 2),
    _ts(620, 0),
    _ts(645, 0),
    _ts(670, 8),
    _ts(670, 8),  # duplicate
    _ts(690, 0),
    _ts(710, 0),
    _ts(720, 5),
    _ts(720, 5),  # duplicate
    _ts(725, 0),
    _ts(728, 0),
    _ts(729, 3),
    _ts(729, 12),
    _ts(730, 0),
    _ts(730, 6),
    _ts(730, 14),
    _ts(730, 20),
    _ts(731, 0),
    _ts(731, 8),
    _ts(731, 16),  # ~2 years ago, oldest
]


async def seed_if_empty(db: AsyncSession) -> None:
    result = await db.execute(select(Image))
    if result.scalars().first():
        return

    user_objects = []
    for username in USERS:
        user = User(username=username, hashed_password=hash_password("password"))
        db.add(user)
        user_objects.append(user)
    await db.flush()

    images = []
    idx = 0
    for user_idx, count in enumerate(USER_COUNTS):
        for _ in range(count):
            width, height = DIMENSIONS[idx % len(DIMENSIONS)]
            ts = TIMESTAMPS[idx]
            images.append(
                Image(
                    title=TITLES[idx],
                    user_id=user_objects[user_idx].id,
                    url=f"https://picsum.photos/seed/picto{idx + 10}/{width}/{height}",
                    created_at=ts,
                )
            )
            idx += 1

    db.add_all(images)
    await db.commit()
