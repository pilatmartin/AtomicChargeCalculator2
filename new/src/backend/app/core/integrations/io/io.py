"""Module for IO operations."""

import hashlib
import os
import shutil

import aiofiles
from fastapi import UploadFile

from .base import IOBase


class IOLocal(IOBase):
    """Local IO operations."""

    workdir: str = os.path.join("/", "tmp", "acc2")

    def create_tmp_dir(self, name: str = "") -> str:
        path = os.path.join(IOLocal.workdir, name)
        os.makedirs(path, exist_ok=True)

        return path

    def remove_tmp_dir(self, path: str) -> None:
        shutil.rmtree(path)

    def cp(self, path_src: str, path_dst: str) -> str:
        return shutil.copy(path_src, path_dst)

    def listdir(self, directory: str = ".") -> list[str]:
        return os.listdir(directory)

    async def store_upload_file(self, file: UploadFile, directory: str) -> tuple[str, str]:
        path: str = os.path.join(directory, IOBase.get_unique_filename(file.filename))
        hasher = hashlib.sha256()
        chunk_size = 1024 * 1024  # 1 MB

        async with aiofiles.open(path, "wb") as out_file:
            while content := await file.read(chunk_size):
                await out_file.write(content)
                hasher.update(content)

        return path, hasher.hexdigest()
