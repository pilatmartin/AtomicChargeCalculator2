"""Service for handling file operations."""

import os

from dotenv import load_dotenv
from fastapi import UploadFile

from core.logging.base import LoggerBase
from core.integrations.io.base import IOBase


load_dotenv()


class IOService:
    """Service for handling file operations."""

    workdir = os.environ.get("ACC2_DATA_DIR")

    def __init__(self, io: IOBase, logger: LoggerBase):
        self.io = io
        self.logger = logger

    def create_workdir(self, name: str) -> str:
        """Create directory with the provided name in the working directory."""

        if name == "":
            raise ValueError("Name cannot be empty.")

        try:
            self.logger.info(f"Creating working directory with name: {name}")
            path = self.io.mkdir(os.path.join(self.workdir, name))
            return path
        except Exception as e:
            self.logger.info(f"Unable to create working directory '{name}': {e}")
            raise e

    def remove_workdir(self, name: str) -> None:
        """Remove directory from a working directory."""

        self.logger.info(f"Removing working directory {name}")

        try:
            self.io.mkdir(os.path.join(self.workdir, name))
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
            archive_dir = os.path.join(directory, "archive")
            self.io.mkdir(archive_dir)

            for extension in ["cif", "pqr", "txt", "mol2"]:
                self.io.mkdir(os.path.join(archive_dir, extension))

            for file in self.io.listdir(directory):
                extension = file.rsplit(".", 1)[-1]
                file_path = os.path.join(directory, file)

                if extension in ["pqr", "txt", "mol2"]:
                    new_name = file.split("_", 1)[-1]  # removing hash from filename
                    self.io.cp(file_path, os.path.join(archive_dir, extension, new_name))
                elif extension == "cif":
                    self.io.cp(file_path, os.path.join(archive_dir, extension))

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

    def get_user_files_path(self, user_id: str) -> str:
        """Get path to input directory."""
        return os.path.join(self.workdir, "user", user_id, "files")

    def get_file_storage_path(self, user_id: str | None = None) -> str:
        """Get path to file storage.

        Args:
            user_id (str | None, optional): Id of user. Defaults to None.

        Returns:
            str: Path to users file storage if user_id is provided.
                Path to guest file storage if user_id is None.
        """
        if user_id is not None:
            path = os.path.join(self.workdir, "user", user_id, "files")
        else:
            path = os.path.join(self.workdir, "guest", "files")

        return path

    def get_inputs_path(self, computation_id: str, user_id: str | None = None) -> str:
        """Get path to inputs of a provided computation.

        Args:
            computation_id (str): Id of computation.
            user_id (str | None, optional): Id of user. Defaults to None.

        Returns:
            str: Returns path to input of a given (users/guest) computation.
        """

        if user_id is not None:
            path = os.path.join(
                self.workdir, "user", user_id, "computations", computation_id, "input"
            )
        else:
            path = os.path.join(self.workdir, "guest", "computations", computation_id, "input")

        return path

    def get_charges_path_new(
        self, computation_id: str, file: str, user_id: str | None = None
    ) -> str:
        """Get path to charges directory of a provided computation.

        Args:
            computation_id (str): Id of the computation.
            file (str): Name of the file.
            user_id (str | None, optional): Id of the user. Defaults to None.

        Returns:
            str: Path to charges directory of a given (users/guest) computation.
        """

        if user_id is not None:
            path = os.path.join(self.workdir, "user", user_id, "computations", computation_id, file)
        else:
            path = os.path.join(self.workdir, "guest", "computations", computation_id, file)

        return path

    def get_input_path(self, computation_id: str) -> str:
        """Get path to input directory."""
        return os.path.join(self.workdir, computation_id, "input")

    def get_charges_path(self, computation_id: str) -> str:
        """Get path to charges directory."""
        return os.path.join(self.workdir, computation_id, "charges")

    def get_example_path(self, example_id: str) -> str:
        """Get path to example directory."""
        return os.path.join(os.environ.get("ACC2_EXAMPLES_DIR"), example_id)

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

            src_path = os.path.join(files_path, file_name)
            dst_path = os.path.join(inputs_path, file_name)
            try:
                self.io.symlink(src_path, dst_path)
            except Exception as e:
                self.logger.warn(
                    f"Unable to create symlink from {src_path} to {dst_path}: {str(e)}"
                )
