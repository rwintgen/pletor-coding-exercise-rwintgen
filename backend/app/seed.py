from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Image

UNSPLASH_IDS = [
    "photo-1506744038136-46273834b3fb", "photo-1465101046530-73398c7f28ca",
    "photo-1465101178521-c1a9136a3b99", "photo-1470071459604-3b5ec3a7fe05",
    "photo-1441974231531-c6227db76b6e", "photo-1469474968028-56623f02e42e",
    "photo-1426604966848-d7adac402bff", "photo-1472214103451-9374bd1c798e",
    "photo-1500534314263-0869cef50735", "photo-1501785888041-af3ef285b470",
    "photo-1418065460487-3e41a6c84dc5", "photo-1414609245224-afa02bfb3fda",
    "photo-1470770903676-69b98201ea1c", "photo-1446776811953-b23d57bd21aa",
    "photo-1447752875215-b2761acb3c5d", "photo-1433086966358-54859d0ed716",
    "photo-1482938289607-e9573fc25ebb", "photo-1475924156734-496f6cac6ec1",
    "photo-1470252649378-9c29740c9fa8", "photo-1490682143684-14369e18dce8",
    "photo-1507525428034-b723cf961d3e", "photo-1519681393784-d120267933ba",
    "photo-1439853949127-fa647821eba0", "photo-1484591974057-265bb767ef71",
    "photo-1493246507139-91e8fad9978e", "photo-1505765050516-f72dcac9c60e",
    "photo-1476514525535-07fb3b4ae5f1", "photo-1494500764479-0c8f2919a3d8",
    "photo-1504893524553-b855bce32c67", "photo-1464822759023-fed622ff2c3b",
    "photo-1486870591958-9b9d0d1dda99", "photo-1510414842594-a61c69b5ae57",
    "photo-1500259783852-0ca9ce8a64dc", "photo-1540202404-a2f29016b523",
    "photo-1531366936337-7c912a4589a7", "photo-1491002052546-bf38f186af56",
    "photo-1508739773434-c26b3d09e071", "photo-1505144808419-1957a94ca61e",
    "photo-1470114716159-e389f8712861", "photo-1497436072909-60f360e1d4b1",
    "photo-1501854140801-50d01698950b", "photo-1518173946687-a1e2a18a563e",
    "photo-1517483000871-1dbf64a6e1c6", "photo-1490750967868-88aa4f44baee",
    "photo-1431794062232-2a99a5431c6c", "photo-1518098268026-4e89f1a2cd8e",
    "photo-1502082553048-f009c37129b9", "photo-1429552077091-836152271555",
    "photo-1540979388789-6cee28a1cdc9", "photo-1506260408121-e353d10b87c7",
    "photo-1536431311719-398b6704d4cc", "photo-1523712999610-f77fbcfc3843",
    "photo-1477346611705-65d1883cee1e", "photo-1504700610630-ac6edd918cc0",
    "photo-1509316975850-ff9c5deb0cd9",
]

TITLES = [
    "Sunset Beach", "Mountain View", "City Lights", "Green Valley",
    "Forest Path", "River Bend", "Hilltop Dawn", "Coastal Cliff",
    "Desert Road", "Lake Reflection", "Autumn Leaves", "Misty Morning",
    "Ocean Waves", "Night Sky", "Snow Peak", "Wildflower Field",
    "Canyon View", "Waterfall", "Tropical Island", "Rocky Shore",
    "Foggy Bridge", "Starry Night", "Alpine Meadow", "Quiet Harbor",
    "Rolling Hills", "Sunset Clouds", "Frozen Lake", "Pine Forest",
    "Coral Reef", "Volcanic Peak", "Sand Dunes", "Cherry Blossoms",
    "Northern Lights", "Bamboo Grove", "Lavender Field", "Glacier Bay",
    "Rainforest", "Prairie Sunset", "Mediterranean Coast", "Redwood Trail",
    "Tidal Pool", "Mossy Creek", "Storm Clouds", "Golden Hour",
    "Mountain Lake", "Cliffside Village", "Bioluminescent Bay",
    "Ancient Ruins", "Terraced Rice Fields", "Lighthouse Point",
    "Sahara Dusk", "Fjord Morning", "Jungle Canopy", "Volcano Sunrise",
    "Coral Atoll",
]

USERS = ["alice", "bob", "charlie", "diana", "eve"]
USER_COUNTS = [15, 12, 10, 10, 8]


async def seed_if_empty(db: AsyncSession) -> None:
    result = await db.execute(select(Image))
    if result.scalars().first():
        return

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
                    user=USERS[user_idx],
                    url=f"https://images.unsplash.com/{UNSPLASH_IDS[idx]}",
                    created_at=ts,
                )
            )
            idx += 1

    db.add_all(images)
    await db.commit()
