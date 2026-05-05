from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Use AUTOCOMMIT at the connection level and manage transactions manually via
# SQLAlchemy's session. The session issues BEGIN IMMEDIATE before each
# transaction to acquire a write lock immediately, preventing TOCTOU race
# conditions on quota checks.
engine = create_async_engine(DATABASE_URL)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


from sqlalchemy import event  # noqa: E402


@event.listens_for(engine.sync_engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable WAL mode and set busy timeout for better concurrency.
    WAL allows concurrent readers while a writer holds the lock.
    Busy timeout prevents immediate SQLITE_BUSY errors under contention.
    """
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA busy_timeout=5000")
    cursor.close()


async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()
