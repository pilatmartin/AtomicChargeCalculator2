from contextlib import contextmanager, AbstractContextManager
from typing import Callable
from sqlalchemy import create_engine, orm
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Database:
    def __init__(self, db_url: str):
        self._engine = create_engine(db_url)
        self._session_factory = orm.scoped_session(
            orm.sessionmaker(bind=self._engine, autoflush=False, autocommit=False, expire_on_commit=False)
        )

    def create_database(self):
        Base.metadata.create_all(self._engine)

    @contextmanager
    def session(self) -> Callable[..., AbstractContextManager[orm.Session]]:
        session: orm.Session = self._session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
