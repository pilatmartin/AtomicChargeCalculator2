"""This module contains the CalculationsRepository class."""

from contextlib import AbstractContextManager
from typing import Callable
from sqlalchemy import and_
from sqlalchemy.orm.session import Session

from core.models.paging import PagedList, PagingFilters
from core.models.calculation import (
    CalculationDto,
    CalculationSetFullDto,
    CalculationSetPreviewDto,
    CalculationsFilters,
    ChargeCalculationConfig,
    ChargeCalculationResult,
)

from db.models.calculation import Calculation, CalculationConfig, CalculationSet


class CalculationsRepository:
    """Calculations repository."""

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory

    def get_all(self, filters: PagingFilters) -> PagedList[CalculationSetPreviewDto]:
        """Get all previous calculations matching the provided filters."""

        with self.session_factory() as session:
            calculations_query = session.query(CalculationSet)
            calculations = PagedList(
                query=calculations_query, page=filters.page, page_size=filters.page_size
            )

            calculations.items = [
                CalculationSetPreviewDto.model_validate(
                    {
                        "id": calculation_set.id,
                        "files": sorted(
                            set(calculation.file for calculation in calculation_set.calculations)
                        ),
                        "configs": calculation_set.configs,
                    }
                )
                for calculation_set in calculations.items
            ]

            calculations.items = [
                CalculationSetPreviewDto.model_validate(calculation_set)
                for calculation_set in calculations.items
            ]

            return calculations

    def get_calculation_set(self, calculation_id: str) -> CalculationSetFullDto | None:
        """Get a single previous calculation matching the provided filters."""

        with self.session_factory() as session:
            calculation = (
                session.query(CalculationSet).filter(CalculationSet.id == calculation_id).first()
            )
            return CalculationSetFullDto.model_validate(calculation) if calculation else None

    def get_calculation(
        self, calculation_set_id: str, filters: CalculationsFilters
    ) -> CalculationDto | None:
        """Get a single previous calculation matching the provided filters."""

        with self.session_factory() as session:
            calculation = (
                session.query(Calculation)
                .filter(
                    and_(
                        Calculation.set_id == calculation_set_id,
                        Calculation.file_hash == filters.hash,
                    )
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
            return CalculationDto.model_validate(calculation) if calculation else None

    def store_calculation_set(
        self, calculation_id: str, calculation_result: list[ChargeCalculationResult]
    ) -> CalculationSet:
        """Store a single calculation result in the database."""

        calculations: list[Calculation] = []
        for result in calculation_result:
            for calculation in result.calculations:
                calculations.append(
                    Calculation(
                        file=calculation.file,
                        file_hash=calculation.file_hash,
                        charges=calculation.charges,
                    )
                )

        configs: list[CalculationConfig] = [
            CalculationConfig(
                method=result.config.method,
                parameters=result.config.parameters,
                read_hetatm=result.config.read_hetatm,
                ignore_water=result.config.ignore_water,
                permissive_types=result.config.permissive_types,
            )
            for result in calculation_result
        ]

        calculation_set = CalculationSet(
            id=calculation_id, calculations=calculations, configs=configs
        )

        with self.session_factory() as session:
            session.add(calculation_set)
            session.commit()
            session.refresh(calculation_set)

            return CalculationSetFullDto.model_validate(calculation_set)

    def delete_calculation_set(self, calculation_id: str) -> None:
        """Delete a single calculation set from the database by id."""

        with self.session_factory() as session:
            calculation: CalculationSet = (
                session.query(CalculationSet).filter(CalculationSet.id == calculation_id).first()
            )

            if not calculation:
                return

            session.delete(calculation)
            session.commit()

    def store_calculation(
        self, calculation_set_id: str, calculation: CalculationDto, config: CalculationConfig
    ) -> CalculationDto:
        """Store a single calculation result in the database."""
        if (stored_config := self.get_config(calculation_set_id, config)) is None:
            stored_config = self.store_config(calculation_set_id, config)

        with self.session_factory() as session:
            calculation = Calculation(
                set_id=calculation_set_id,
                file=calculation.file,
                file_hash=calculation.file_hash,
                config_id=stored_config.id,
                charges=calculation.charges,
            )

            session.add(calculation)
            session.commit()
            session.refresh(calculation)

            return CalculationDto.model_validate(calculation)

    def delete(self, calculation_id: str) -> None:
        """Delete a single calculation from the database by id."""

        with self.session_factory() as session:
            calculation: Calculation = (
                session.query(Calculation).filter(Calculation.id == calculation_id).first()
            )

            if not calculation:
                return

            session.delete(calculation)
            session.commit()

    def get_config(
        self, calculation_id: str, config: ChargeCalculationConfig
    ) -> CalculationConfig | None:
        """Get a single previous calculation config matching the provided filters."""

        with self.session_factory() as session:
            return (
                session.query(CalculationConfig)
                .filter(
                    and_(
                        CalculationConfig.set_id == calculation_id,
                        CalculationConfig.method == config.method,
                        CalculationConfig.parameters == config.parameters,
                        CalculationConfig.read_hetatm == config.read_hetatm,
                        CalculationConfig.ignore_water == config.ignore_water,
                        CalculationConfig.permissive_types == config.permissive_types,
                    )
                )
                .first()
            )

    def store_config(
        self, calculation_set_id: str, config: ChargeCalculationConfig
    ) -> CalculationConfig:
        """Store a single calculation config in the database."""

        with self.session_factory() as session:
            calculation_config = CalculationConfig(
                set_id=calculation_set_id,
                method=config.method,
                parameters=config.parameters,
                read_hetatm=config.read_hetatm,
                ignore_water=config.ignore_water,
                permissive_types=config.permissive_types,
            )
            session.add(calculation_config)
            session.commit()
            session.refresh(calculation_config)

            return calculation_config
