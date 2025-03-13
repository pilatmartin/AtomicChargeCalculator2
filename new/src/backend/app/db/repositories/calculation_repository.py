"""This module provides a repository for calculations."""

from sqlalchemy import and_, Select, select
from sqlalchemy.orm import joinedload

from sqlalchemy.ext.asyncio import AsyncSession

from core.models.paging import PagedList, PagingFilters
from core.models.calculation import CalculationsFilters

from db.database import SessionManager
from db.models.calculation.calculation import Calculation
from db.models.calculation.calculation_config import CalculationConfig
from db.repositories.calculation_set_repository import CalculationSetRepository


class CalculationRepository:
    """Repository for managing calculation sets."""

    def __init__(
        self,
        session_manager: SessionManager,
        set_repository: CalculationSetRepository,
    ):
        self.session_manager = session_manager
        self.set_repository = set_repository

    async def get_all(
        self, calculation_set_id: str, filters: PagingFilters
    ) -> PagedList[Calculation]:
        """Get all previous calculations matching the provided filters.

        Args:
            calculation_set_id (str): Id of the calculation set.
            filters (PagingFilters): Filters for paging.

        Returns:
            PagedList[Calculation]: Paged list of calculations in the calculation set.
        """

        statement = select(Calculation).filter(Calculation.set_id == calculation_set_id)
        calculations = await self._paginate(statement, filters.page, filters.page_size)

        return calculations

    async def get(
        self, calculation_set_id: str, filters: CalculationsFilters, session: AsyncSession = None
    ) -> Calculation | None:
        """Get a single previous calculation by id.

        Args:
            calculation_id (str): Calculation id to get.

        Returns:
            Calculation: Calculation set.
        """

        statement = (
            select(Calculation)
            .join(CalculationConfig)
            .options(joinedload(Calculation.config))
            .where(
                and_(
                    Calculation.set_id == calculation_set_id,
                    Calculation.file_hash == filters.hash,
                    CalculationConfig.method == filters.method,
                    CalculationConfig.parameters == filters.parameters,
                    CalculationConfig.read_hetatm == filters.read_hetatm,
                    CalculationConfig.ignore_water == filters.ignore_water,
                    CalculationConfig.permissive_types == filters.permissive_types,
                )
            )
        )

        if session is not None:
            calculation = (await session.execute(statement)).unique().scalars().first()
            return calculation

        async with self.session_manager.session() as session:
            calculation = (await session.execute(statement)).unique().scalars().first()
            return calculation

    async def delete(self, calculation_id: str) -> None:
        """Delete a single previous calculation by id.

        Args:
            calculation_id (str): Calculation id to delete.
        """

        statement = select(Calculation).where(Calculation.id == calculation_id)

        async with self.session_manager.session() as session:
            calculation = (await session.execute(statement)).scalars().first()

            if calculation is None:
                return

            await session.delete(calculation)
            await session.commit()

    async def store(self, calculation: Calculation) -> Calculation:
        """Store a single calculation set in the database.

        Args:
            calculation_set (Calculation): Calculation to store.

        Raises:
            ValueError: If the calculation set to which the calculation belongs is not found.

        Returns:
            Calculation: Stored calculation set.
        """

        calculation_set = await self.set_repository.get(calculation.set_id)

        if calculation_set is None:
            raise ValueError("Calculation set not found.")

        async with self.session_manager.session() as session:
            session.add(calculation)
            await session.commit()
            await session.refresh(calculation)

            return calculation

    async def _paginate(
        self, statement: Select, page: int, page_size: int
    ) -> PagedList[Calculation]:
        total_statement = select(func.count()).select_from(statement)
        items_statement = statement.limit(page_size).offset((page - 1) * page_size)

        async with self.session_manager.session() as session:
            total_count = (await session.execute(total_statement)).scalar()
            items = (await session.execute(items_statement)).scalars(Calculation).all()

            return PagedList[Calculation](
                page=page, page_size=page_size, total_count=total_count, items=items
            )
