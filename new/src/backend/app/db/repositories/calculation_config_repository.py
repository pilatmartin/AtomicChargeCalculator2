"""This module provides a repository for calculation configs."""

from contextlib import AbstractContextManager
from typing import Callable

from sqlalchemy import and_
from sqlalchemy.orm.session import Session

from db.models.calculation.calculation_config import CalculationConfig
from db.repositories.calculation_set_repository import CalculationSetRepository


class CalculationConfigRepository:
    """Repository for managing calculation configs."""

    def __init__(
        self,
        session_factory: Callable[..., AbstractContextManager[Session]],
        set_repository: CalculationSetRepository,
    ):
        self.session_factory = session_factory
        self.set_repository = set_repository

    def get_all(self, calculation_set_id: str) -> list[CalculationConfig]:
        """Get all calculation configs for given calculation set.

        Args:
            calculation_set_id (str): Id of the calculation set.

        Returns:
            list[CalculationConfig]: List of calculation configs.
        """

        with self.session_factory() as session:
            return (
                session.query(CalculationConfig)
                .filter(CalculationConfig.set_id == calculation_set_id)
                .all()
            )

    def get(self, calculation_set_id: str, config: CalculationConfig) -> CalculationConfig | None:
        """Get a single calculation config matching the provided filters.

        Args:
            calculation_set_id (str): Id of the calculation set.
            config (CalculationConfig): Calculation config.

        Returns:
            CalculationConfig | None: Calculation config or None if not found.
        """

        with self.session_factory() as session:
            return (
                session.query(CalculationConfig)
                .filter(
                    and_(
                        CalculationConfig.set_id == calculation_set_id,
                        CalculationConfig.method == config.method,
                        CalculationConfig.parameters == config.parameters,
                        CalculationConfig.read_hetatm == config.read_hetatm,
                        CalculationConfig.ignore_water == config.ignore_water,
                        CalculationConfig.permissive_types == config.permissive_types,
                    )
                )
                .first()
            )

    def delete(self, config_id: str) -> None:
        """Delete all calculation configs for given calculation set.

        Args:
            calculation_set_id (str): Id of the calculation set.
            config (CalculationConfig): Calculation config.
        """

        with self.session_factory() as session:
            config = session.query(CalculationConfig).filter(CalculationConfig.id == config_id)

            if config is None:
                return

            config.delete()
            session.commit()

    def store(self, config: CalculationConfig) -> CalculationConfig:
        """Store a single calculation config in the database.

        Args:
            config (CalculationConfig): Calculation config.

        Raises:
            ValueError: If the calculation set to which the calculation config belongs is not found.

        Returns:
            CalculationConfig: Stored calculation config.
        """

        calculation_set = self.set_repository.get(config.set_id)

        if calculation_set is None:
            raise ValueError("Calculation set not found.")

        with self.session_factory() as session:
            session.add(config)
            session.commit()
            session.refresh(config)

            return config
