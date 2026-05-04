from datetime import datetime, timedelta

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

    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    two_days_ago = now - timedelta(days=2)

    images = []
    idx = 0
    for user_idx, count in enumerate(USER_COUNTS):
        for _ in range(count):
            if idx < 20:
                ts = now - timedelta(hours=idx)
            elif idx < 40:
                ts = yesterday - timedelta(hours=(idx - 20))
            else:
                ts = two_days_ago - timedelta(hours=(idx - 40))

            images.append(
                Image(
                    title=TITLES[idx],
                    user_id=user_objects[user_idx].id,
                    url=f"https://picsum.photos/seed/picto{idx + 10}/800/600",
                    created_at=ts,
                )
            )
            idx += 1

    db.add_all(images)
    await db.commit()
