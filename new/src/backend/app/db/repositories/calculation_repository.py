"""This module provides a repository for calculations."""

from contextlib import AbstractContextManager
from typing import Callable

from sqlalchemy import and_
from sqlalchemy.orm.session import Session

from core.models.paging import PagedList, PagingFilters
from core.models.calculation import CalculationsFilters
from db.models.calculation import Calculation, CalculationConfig
from db.repositories.calculation_set_repository import CalculationSetRepository


class CalculationRepository:
    """Repository for managing calculation sets."""

    def __init__(
        self,
        session_factory: Callable[..., AbstractContextManager[Session]],
        set_repository: CalculationSetRepository,
    ):
        self.session_factory = session_factory
        self.set_repository = set_repository

    def get_all(self, calculation_set_id: str, filters: PagingFilters) -> PagedList[Calculation]:
        """Get all previous calculations matching the provided filters.

        Args:
            calculation_set_id (str): Id of the calculation set.
            filters (PagingFilters): Filters for paging.

        Returns:
            PagedList[Calculation]: Paged list of calculations in the calculation set.
        """

        with self.session_factory() as session:
            calculations_query = session.query(Calculation).filter(
                Calculation.set_id == calculation_set_id
            )
            calculations = PagedList(
                query=calculations_query, page=filters.page, page_size=filters.page_size
            )
            return calculations

    def get(self, calculation_set_id: str, filters: CalculationsFilters) -> Calculation | None:
        """Get a single previous calculation by id.

        Args:
            calculation_id (str): Calculation id to get.

        Returns:
            Calculation: Calculation set.
        """

        with self.session_factory() as session:
            return (
                session.query(Calculation)
                .filter(
                    Calculation.set_id == calculation_set_id,
                    Calculation.file_hash == filters.hash,
                )
                .join(CalculationConfig)
                .filter(
                    and_(
                        CalculationConfig.method == filters.method,
                        CalculationConfig.parameters == filters.parameters,
                        CalculationConfig.read_hetatm == filters.read_hetatm,
                        CalculationConfig.ignore_water == filters.ignore_water,
                        CalculationConfig.permissive_types == filters.permissive_types,
                    )
                )
                .first()
            )

    def delete(self, calculation_id: str) -> None:
        """Delete a single previous calculation by id.

        Args:
            calculation_id (str): Calculation id to delete.
        """

        with self.session_factory() as session:
            calculation = (
                session.query(Calculation).filter(Calculation.id == calculation_id).first()
            )

            if calculation is None:
                return

            session.delete(calculation)
            session.commit()

    def store(self, calculation: Calculation) -> Calculation:
        """Store a single calculation set in the database.

        Args:
            calculation_set (Calculation): Calculation to store.

        Raises:
            ValueError: If the calculation set to which the calculation belongs is not found.

        Returns:
            Calculation: Stored calculation set.
        """

        calculation_set = self.set_repository.get(calculation.set_id)

        if calculation_set is None:
            raise ValueError("Calculation set not found.")

        with self.session_factory() as session:
            session.add(calculation)
            session.commit()
            return calculation
