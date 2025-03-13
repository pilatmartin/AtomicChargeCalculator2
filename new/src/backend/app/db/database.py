"""Database connection manager."""

from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, scoped_session


class Database:
    """Database connection and model manager."""

    def __init__(self, db_url: str):
        self._engine = create_async_engine(db_url, future=True, pool_size=20, max_overflow=10)
        self.session_factory = scoped_session(
            sessionmaker(
                bind=self._engine,
                class_=AsyncSession,
                autoflush=False,
                autocommit=False,
                expire_on_commit=False,
            )
        )


class SessionManager:
    """Database session manager."""

    def __init__(self, session_factory):
        self._session_factory = session_factory

    @asynccontextmanager
    async def session(self):
        """Provide a transactional scope."""

        session: AsyncSession = self._session_factory()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
