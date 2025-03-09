"""This module provides a repository for calculation sets."""

from contextlib import AbstractContextManager
from dataclasses import dataclass
from typing import Callable, Literal

from sqlalchemy.orm import joinedload
from sqlalchemy.orm.session import Session

from core.models.paging import PagedList, PagingFilters
from db.models.calculation.calculation_set import CalculationSet


@dataclass
class CalculationSetFilters(PagingFilters):
    order_by: str
    order: Literal["asc", "desc"]


class CalculationSetRepository:
    """Repository for managing calculation sets."""

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory

    def get_all(self, filters: CalculationSetFilters) -> PagedList[CalculationSet]:
        """Get all previous calculations matching the provided filters.

        Args:
            filters (PagingFilters): Filters for paging.

        Returns:
            PagedList[CalculationSet]: Paged list of calculation sets.
        """

        with self.session_factory() as session:
            query = (
                session.query(CalculationSet)
                .options(joinedload(CalculationSet.calculations))
                .options(joinedload(CalculationSet.configs))
                .order_by(getattr(getattr(CalculationSet, filters.order_by), filters.order)())
                .filter(CalculationSet.calculations.any())
            )
            calculations = PagedList(query=query, page=filters.page, page_size=filters.page_size)

            return calculations

    def get(self, calculation_id: str) -> CalculationSet | None:
        """Get a single previous calculation by id.

        Args:
            calculation_id (str): Calculation id to get.

        Returns:
            CalculationSet: Calculation set.
        """

        with self.session_factory() as session:
            return session.query(CalculationSet).filter(CalculationSet.id == calculation_id).first()

    def delete(self, calculation_id: str) -> None:
        """Delete a single previous calculation by id.

        Args:
            calculation_id (str): Calculation id to delete.
        """

        with self.session_factory() as session:
            calculation_set = (
                session.query(CalculationSet).filter(CalculationSet.id == calculation_id).first()
            )

            if not calculation_set:
                return

            session.delete(calculation_set)
            session.commit()

    def store(self, calculation_set: CalculationSet) -> CalculationSet:
        """Store a single calculation set in the database.

        Args:
            calculation_set (CalculationSet): Calculation set to store.

        Returns:
            CalculationSet: Stored calculation set.
        """

        with self.session_factory() as session:
            session.add(calculation_set)
            session.commit()
            session.refresh(calculation_set)
            return calculation_set
