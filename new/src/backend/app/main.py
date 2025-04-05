"""Main module for the application."""

import os
import shutil

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from typing import Tuple

from api.v1.routes.charges import charges_router
from api.v1.routes.auth import auth_router
from api.v1.routes.files import files_router
from api.v1.middleware.logging import LoggingMiddleware
from api.v1.middleware.exceptions import http_exception_handler
from api.v1.middleware.user_loader import UserLoaderMiddleware

from core.dependency_injection.container import Container


PREFIX = "/v1"
WEB_PREFIX = f"{PREFIX}"


def create_app() -> FastAPI:
    """Creates FastAPI aps with routers and middleware."""

    if not load_dotenv():
        raise EnvironmentError("Could not load environment variables.")

    # Move example files to example directory
    if not (examples_dir := os.environ.get("ACC2_EXAMPLES_DIR")):
        raise EnvironmentError("ACC2_EXAMPLES_DIR environment variable is not set.")

    try:
        shutil.copytree("examples", examples_dir, dirs_exist_ok=True)
    except Exception as e:
        raise EnvironmentError(f"Could not copy example files. {str(e)}") from e

    # Create DI container
    container = Container()


    app = FastAPI(root_path="/api")

    container.wire()

    app.add_middleware(LoggingMiddleware)
    app.add_middleware(UserLoaderMiddleware)

    app.add_exception_handler(HTTPException, http_exception_handler)

    app.include_router(router=charges_router, prefix=PREFIX)
    app.include_router(router=files_router, prefix=PREFIX)
    app.include_router(router=auth_router, prefix=PREFIX)

    return app


web_app = create_app()
