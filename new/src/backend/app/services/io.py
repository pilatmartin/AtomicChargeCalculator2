"""Service for handling file operations."""

from dataclasses import asdict
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import UploadFile

from core.logging.base import LoggerBase
from core.integrations.io.base import IOBase
from core.models.calculation import ChargeCalculationConfigDto
from db.repositories.calculation_set_repository import CalculationSetFilters
from api.v1.constants import CHARGES_OUTPUT_EXTENSION


load_dotenv()


class IOService:
    """Service for handling file operations."""

    workdir = Path(os.environ.get("ACC2_DATA_DIR"))
    examples_dir = Path(os.environ.get("ACC2_EXAMPLES_DIR"))

    def __init__(self, io: IOBase, logger: LoggerBase):
        self.io = io
        self.logger = logger

    def create_workdir(self, name: str) -> str:
        """Create directory with the provided name in the working directory."""

        if name == "":
            raise ValueError("Name cannot be empty.")

        try:
            self.logger.info(f"Creating working directory with name: {name}")
            path = self.io.mkdir(str(self.workdir / name))
            return path
        except Exception as e:
            self.logger.info(f"Unable to create working directory '{name}': {e}")
            raise e

    def remove_workdir(self, name: str) -> None:
        """Remove directory from a working directory."""

        self.logger.info(f"Removing working directory {name}")

        try:
            self.io.mkdir(str(self.workdir / name))
        except Exception as e:
            self.logger.error(f"Unable to remove working directory '{name}': {e}")
            raise e

    def create_dir(self, path: str) -> None:
        """Create directory based on path."""

        self.logger.info(f"Creating directory {path}")

        try:
            self.io.mkdir(path)
        except Exception as e:
            self.logger.error(f"Unable to create directory '{path}': {e}")
            raise e

    def cp(self, path_from: str, path_to: str) -> str:
        """Copy file from source to destination."""

        self.logger.info(f"Copying from {path_from} to {path_to}.")

        try:
            path = self.io.cp(path_from, path_to)
            return path
        except Exception as e:
            self.logger.error(f"Unable to copy '{path_from}' to '{path_to}': {e}")
            raise e

    async def store_upload_file(self, file: UploadFile, directory: str) -> tuple[str, str]:
        """Store uploaded file in the provided directory."""
        self.logger.info(f"Storing file {file.filename}.")

        try:
            return await self.io.store_upload_file(file, directory)
        except Exception as e:
            self.logger.error(f"Error storing file {file.filename}: {e}")
            raise e

    def zip_charges(self, directory: str) -> str:
        """Create archive from directory."""

        self.logger.info(f"Creating archive from {directory}.")

        try:
            archive_dir = Path(directory) / "archive"
            self.io.mkdir(str(archive_dir))

            for extension in ["cif", "pqr", "txt", "mol2"]:
                self.io.mkdir(str(archive_dir / extension))

            for file in self.io.listdir(directory):
                extension = file.rsplit(".", 1)[-1]
                file_path = str(Path(directory) / file)

                if extension in ["pqr", "txt", "mol2"]:
                    new_name = file.split("_", 1)[-1]  # removing hash from filename
                    self.io.cp(file_path, str(Path(archive_dir) / extension / new_name))
                elif extension == "cif":
                    self.io.cp(file_path, str(Path(archive_dir) / extension))

            return self.io.zip(archive_dir, archive_dir)
        except Exception as e:
            self.logger.error(f"Error creating archive from {directory}: {e}")
            raise e

    def listdir(self, directory: str) -> list[str]:
        """List directory contents."""
        return self.io.listdir(directory)

    def path_exists(self, path: str) -> bool:
        """Check if path exists."""
        return self.io.path_exists(path)

    def get_file_storage_path(self, user_id: str | None = None) -> str:
        """Get path to file storage.

        Args:
            user_id (str | None, optional): Id of user. Defaults to None.

        Returns:
            str: Path to users file storage if user_id is provided.
                Path to guest file storage if user_id is None.
        """
        if user_id is not None:
            path = self.workdir / "user" / user_id / "files"
        else:
            path = self.workdir / "guest" / "files"

        return str(path)

    def get_computation_path(self, computation_id: str, user_id: str | None = None) -> str:
        """Get path to computation directory.

        Args:
            computation_id (str): Id of computation.
            user_id (str | None, optional): Id of user. Defaults to None.

        Returns:
            str: Returns path to computation directory of a given (users/guest) computation.
        """

        if user_id is not None:
            path = self.workdir / "user" / user_id / "computations" / computation_id
        else:
            path = self.workdir / "guest" / "computations" / computation_id

        return str(path)

    def get_inputs_path(self, computation_id: str, user_id: str | None = None) -> str:
        """Get path to inputs of a provided computation.

        Args:
            computation_id (str): Id of computation.
            user_id (str | None, optional): Id of user. Defaults to None.

        Returns:
            str: Returns path to input of a given (users/guest) computation.
        """

        if user_id is not None:
            path = self.workdir / "user" / user_id / "computations" / computation_id / "input"
        else:
            path = self.workdir / "guest" / "computations" / computation_id / "input"

        return str(path)

    def get_charges_path_new(self, computation_id: str, user_id: str | None = None) -> str:
        """Get path to charges directory of a provided computation.

        Args:
            computation_id (str): Id of the computation.
            file (str): Name of the file.
            user_id (str | None, optional): Id of the user. Defaults to None.

        Returns:
            str: Path to charges directory of a given (users/guest) computation.
        """

        if user_id is not None:
            path = self.workdir / "user" / user_id / "computations" / computation_id / "charges"
        else:
            path = self.workdir / "guest" / "computations" / computation_id / "charges"

        return str(path)

    def get_input_path(self, computation_id: str) -> str:
        """Get path to input directory."""
        path = self.workdir / computation_id / "input"
        return str(path)

    def get_charges_path(self, computation_id: str) -> str:
        """Get path to charges directory."""
        path = self.workdir / computation_id / "charges"
        return str(path)

    def get_example_path(self, example_id: str) -> str:
        """Get path to example directory."""
        path = self.examples_dir / example_id
        return str(path)

    def prepare_inputs(
        self, user_id: str | None, computation_id: str, file_hashes: list[str]
    ) -> None:
        """Prepare input files for computation."""

        inputs_path = self.get_inputs_path(computation_id, user_id)
        files_path = self.get_file_storage_path(user_id)
        self.create_dir(inputs_path)
        self.create_dir(files_path)

        for file_hash in file_hashes:
            file_name = next(
                (file for file in self.listdir(files_path) if file.split("_", 1)[0] == file_hash),
                None,
            )

            if not file_name:
                self.logger.warn(
                    f"File with hash {file_hash} not found in {inputs_path}, skipping."
                )
                continue

            src_path = str(Path(files_path) / file_name)
            dst_path = str(Path(inputs_path) / file_name)
            try:
                self.io.symlink(src_path, dst_path)
            except Exception as e:
                self.logger.warn(
                    f"Unable to create symlink from {src_path} to {dst_path}: {str(e)}"
                )

    async def get_calculations(self, filters: CalculationSetFilters) -> list[dict]:
        """Get calculations based on filters.

        Args:
            filters (CalculationSetFilters): Filters to apply.

        Returns:
            str: List of existing calculations.
        """

        path = self.workdir / "user" / filters.user_id / "computations"

        if not self.io.path_exists(str(path)):
            return []

        calculations = []

        for computation_id in self.listdir(str(path)):
            computation_path = path / computation_id
            files_path = computation_path / "input"
            configs_path = computation_path / "configs.json"
            charges_path = computation_path / "charges"

            files = [file.split("_", 1)[-1] for file in self.io.listdir(str(files_path))]
            configs = json.loads(await self.io.read_file(str(configs_path)))
            molecules = [
                charge.replace(CHARGES_OUTPUT_EXTENSION, "")
                for charge in self.io.listdir(str(charges_path))
                if charge.endswith(CHARGES_OUTPUT_EXTENSION)
            ]

            calculations.append(
                {
                    "files": files,
                    "configs": configs,
                    "molecules": molecules,
                }
            )

        return calculations

    async def store_configs(
        self, user_id: str, computation_id: str, configs: list[ChargeCalculationConfigDto]
    ) -> None:
        """Store configs for computation to a json file."""

        self.logger.info(f"Storing configs for computation. {computation_id}")

        try:
            path = self.workdir / "user" / user_id / "computations" / computation_id
            config_path = str(path / "configs.json")
            await self.io.write_file(
                config_path, json.dumps([asdict(config) for config in configs], indent=4)
            )
        except Exception as e:
            self.logger.error(f"Unable to store configs: {e}")
            raise e
