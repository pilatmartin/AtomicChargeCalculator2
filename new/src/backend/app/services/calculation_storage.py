import traceback
from typing import Tuple

from sqlalchemy.orm import Session

from models.calculation import (
    CalculationConfigDto,
    CalculationDto,
    CalculationResultDto,
    CalculationSetPreviewDto,
    CalculationsFilters,
)
from models.paging import PagedList
from models.molecule_info import MoleculeSetStats
from db.schemas.calculation import AdvancedSettings, Calculation, CalculationConfig, CalculationSet
from db.schemas.stats import AtomTypeCount, MoleculeSetStats as MoleculeSetStatsModel

from db.repositories.calculation_config_repository import CalculationConfigRepository
from db.repositories.calculation_repository import CalculationRepository
from db.repositories.calculation_set_repository import (
    CalculationSetFilters,
    CalculationSetRepository,
)
from db.repositories.moleculeset_stats_repository import MoleculeSetStatsRepository

from models.setup import AdvancedSettingsDto
from db.repositories.advanced_settings_repository import AdvancedSettingsRepository
from db.database import SessionManager
from services.logging.base import LoggerBase


class CalculationStorageService:
    """Service for manipulating calculations in the database."""

    def __init__(
        self,
        logger: LoggerBase,
        set_repository: CalculationSetRepository,
        calculation_repository: CalculationRepository,
        config_repository: CalculationConfigRepository,
        stats_repository: MoleculeSetStatsRepository,
        advanced_settings_repository: AdvancedSettingsRepository,
        session_manager: SessionManager,
    ):
        self.set_repository = set_repository
        self.calculation_repository = calculation_repository
        self.config_repository = config_repository
        self.stats_repository = stats_repository
        self.advanced_settings_repository = advanced_settings_repository
        self.session_manager = session_manager
        self.logger = logger

    def get_info(self, session: Session, file_hash: str) -> MoleculeSetStats | None:
        # Getting info manually due to lazy loading issue

        info = self.stats_repository.get(session, file_hash)

        if info is None:
            return None

        info_dict = {
            "total_molecules": info.total_molecules,
            "total_atoms": info.total_atoms,
            "atom_type_counts": [vars(count) for count in info.atom_type_counts],
        }

        return MoleculeSetStats(info_dict)

    def get_calculations(
        self, filters: CalculationSetFilters
    ) -> PagedList[CalculationSetPreviewDto]:
        """Get calculations from database based on filters."""

        try:
            with self.session_manager.session() as session:
                self.logger.info("Getting calculations from database.")
                calculations_list = self.set_repository.get_all(session, filters)
                calculations_list.items = [
                    CalculationSetPreviewDto.model_validate(
                        {
                            "id": calculation_set.id,
                            "files": {
                                calculation.file: self.get_info(session, calculation.file_hash)
                                for calculation in set(calculation_set.calculations)
                            },
                            "configs": calculation_set.configs,
                            "created_at": calculation_set.created_at,
                        }
                    )
                    for calculation_set in calculations_list.items
                ]

            return PagedList[CalculationSetPreviewDto].model_validate(calculations_list)
        except Exception as e:
            self.logger.error(f"Error getting calculations from database: {traceback.format_exc()}")
            raise e

    def get_calculation_set(self, computation_id: str) -> CalculationSet | None:
        """Get calculation set from database."""

        try:
            self.logger.info(f"Getting calculation set {computation_id}.")
            with self.session_manager.session() as session:
                return self.set_repository.get(session, computation_id)
        except Exception as e:
            self.logger.error(
                f"Error getting calculation set {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def store_file_info(self, file_hash: str, info: MoleculeSetStats) -> MoleculeSetStats:
        """Store file info to database."""

        try:
            with self.session_manager.session() as session:
                self.logger.info(f"Storing stats of file with hash '{file_hash}'.")
                info_model = MoleculeSetStatsModel(
                    file_hash=file_hash,
                    total_molecules=info.total_molecules,
                    total_atoms=info.total_atoms,
                    atom_type_counts=[
                        AtomTypeCount(symbol=count.symbol, count=count.count)
                        for count in info.atom_type_counts
                    ],
                )

                return self.stats_repository.store(session, info_model)
        except Exception as e:
            self.logger.error(
                f"Error storing stats of file with hash '{file_hash}': "
                + f"{traceback.format_exc()}"
            )
            raise e

    def store_calculation_results(
        self,
        computation_id: str,
        settings: AdvancedSettingsDto,
        results: list[CalculationResultDto],
        user_id: str | None,
    ) -> None:
        """Store calculation results to database."""

        try:
            self.logger.info(f"Storing calculation results for computation {computation_id}.")

            with self.session_manager.session() as session:
                unique_configs = {}
                existing_calculation_set = self.set_repository.get(session, computation_id)
                settings_exist = self.advanced_settings_repository.get(session, settings)
                if settings_exist is None:
                    settings_exist = AdvancedSettings(
                        read_hetatm=settings.read_hetatm,
                        permissive_types=settings.permissive_types,
                        ignore_water=settings.ignore_water,
                    )
                if existing_calculation_set:
                    calculation_set = existing_calculation_set
                else:
                    calculation_set = CalculationSet(
                        id=computation_id,
                        user_id=user_id,
                        advanced_settings=settings_exist,
                    )
                calculations = []
                added_stats = set()

                for result in results:
                    config_key = (
                        result.config.method,
                        result.config.parameters,
                    )
                    config = CalculationConfig(
                        method=result.config.method, parameters=result.config.parameters
                    )
                    if config_key in unique_configs:
                        result.config = unique_configs[config_key]
                    existing_config = self.config_repository.get(session, *config_key)
                    config_to_store = config if existing_config is None else existing_config

                    if config_to_store not in calculation_set.configs:
                        calculation_set.configs.append(config_to_store)

                    if existing_config is None:
                        unique_configs[config_key] = config

                    for calculation in result.calculations:
                        calculation_exists = self.calculation_repository.get(
                            session,
                            CalculationsFilters(
                                hash=calculation.file_hash,
                                method=calculation.config.method,
                                parameters=calculation.config.parameters,
                                read_hetatm=settings.read_hetatm,
                                permissive_types=settings.permissive_types,
                                ignore_water=settings.ignore_water,
                            ),
                        )
                        if calculation_exists is None:
                            calculations.append(
                                Calculation(
                                    file_name=calculation.file,
                                    file_hash=calculation.file_hash,
                                    charges=calculation.charges,
                                    config=config_to_store,
                                    advanced_settings=settings_exist,
                                )
                            )

                        if calculation.file_hash not in added_stats:
                            calculation_set.molecule_set_stats.append(
                                self.stats_repository.get(session, calculation.file_hash)
                            )
                            added_stats.add(calculation.file_hash)

                for calculation in calculations:
                    self.calculation_repository.store(session, calculation)
                self.set_repository.store(session, calculation_set)

                session.commit()
        except Exception as e:
            self.logger.error(
                f"Error storing calculation results for computation {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def setup_calculation(
        self,
        computation_id: str,
        settings: AdvancedSettingsDto,
        file_hashes: list[str],
        user_id: str | None,
    ) -> None:
        """Setup calculation in database."""

        try:
            with self.session_manager.session() as session:
                self.logger.info("Setting up calculation.")
                calculation_set = CalculationSet(
                    id=computation_id,
                    user_id=user_id,
                    advanced_settings=self.advanced_settings_repository.get(session, settings),
                )

                for file_hash in file_hashes:
                    calculation_set.molecule_set_stats.append(
                        self.stats_repository.get(session, file_hash)
                    )

                self.set_repository.store(session, calculation_set)
        except Exception as e:
            self.logger.error(f"Error setting up calculation: {traceback.format_exc()}")
            raise e

    def filter_existing_calculations(
        self,
        settings: AdvancedSettingsDto,
        file_hashes: list[str],
        configs: list[CalculationConfigDto],
    ) -> Tuple[
        dict[str, list[CalculationConfigDto]], dict[CalculationConfigDto, list[CalculationDto]]
    ]:
        """Returns a list of hashes and configs that are not in the database."""

        to_calculate = {}
        cached = {}

        try:
            self.logger.info("Filtering existing calculations.")

            with self.session_manager.session() as session:
                for config in configs:
                    for file_hash in file_hashes:
                        filters = CalculationsFilters(
                            hash=file_hash,
                            method=config.method,
                            parameters=config.parameters,
                            read_hetatm=settings.read_hetatm,
                            ignore_water=settings.ignore_water,
                            permissive_types=settings.permissive_types,
                        )

                        existing_calculation = self.calculation_repository.get(session, filters)
                        if existing_calculation is None:
                            if config not in to_calculate:
                                to_calculate[config] = []

                            to_calculate[config].append(file_hash)
                        else:
                            if config not in cached:
                                cached[config] = []

                            cached[config].append(
                                CalculationDto(
                                    file=existing_calculation.file_name,
                                    file_hash=existing_calculation.file_hash,
                                    charges=existing_calculation.charges,
                                    config=config,
                                ),
                            )
                            self.logger.info(
                                f"Existing calculation found for file '{file_hash}', skipping."
                            )

            return to_calculate, cached
        except Exception as e:
            self.logger.error(f"Error filtering existing calculations: {traceback.format_exc()}")
            raise e

    def get_calculation_results(self, computation_id: str) -> list[CalculationResultDto]:
        """Get calculation results from database."""

        try:
            self.logger.info(f"Getting calculation results for computation {computation_id}.")
            with self.session_manager.session() as session:
                calculation_set = self.set_repository.get(session, computation_id)

                if not calculation_set:
                    return []

                result = [
                    CalculationResultDto(
                        config=CalculationConfigDto.model_validate(config),
                        calculations=[
                            CalculationDto.model_validate(calculation)
                            for calculation in calculation_set.calculations
                            if calculation.config == config
                        ],
                    )
                    for config in calculation_set.configs
                ]

                return result

        except Exception as e:
            self.logger.error(
                f"Error getting calculation results for computation {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def delete_calculation_set(self, computation_id: str) -> None:
        """Delete calculation set from database."""

        try:
            self.logger.info(f"Deleting calculation set {computation_id}.")
            with self.session_manager.session() as session:
                self.set_repository.delete(session, computation_id)
        except Exception as e:
            self.logger.error(
                f"Error deleting calculation set {computation_id}: {traceback.format_exc()}"
            )
            raise e
