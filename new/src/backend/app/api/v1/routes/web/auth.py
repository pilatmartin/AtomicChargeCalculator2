"""Auth routes."""

import os
import secrets
import urllib
import urllib.parse

import httpx
from core.dependency_injection.container import Container
from db.models.user.user import User
from db.repositories.user_repository import UserRepository
from dependency_injector.wiring import Provide, inject
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.routing import APIRouter
from fastapi_login import LoginManager
from pydantic import BaseModel

from jose import jwt

OIDC_DISCOVERY_URL = "https://login.aai.lifescience-ri.eu/oidc/.well-known/openid-configuration"

oidc_config = {}
state_store = {}
session_store = {}

load_dotenv()


class TokenResponse(BaseModel):
    """JWT Token response."""

    access_token: str
    token_type: str
    expires_in: int
    scope: str
    id_token: str


manager = LoginManager(
    secret=secrets.token_hex(32),
    token_url="/login",
    use_header=False,
    use_cookie=True,
    cookie_name="access_token",
)


@manager.user_loader()
@inject
async def user_loader(
    openid: str, user_repository: UserRepository = Depends(Provide[Container.user_repository])
) -> User | None:
    """Get a user from the database.

    Args:
        openid (str): Openid of the user.

    Returns:
        User | None: User with provided openid if exists, otherwise None.
    """
    return user_repository.get(openid)


async def get_oidc_config() -> dict:
    """Get the OIDC configuration from the discovery endpoint or cache, if available.

    Returns:
        dict: OIDC configuration.
    """

    global oidc_config
    if oidc_config:
        return oidc_config

    async with httpx.AsyncClient() as client:
        response = await client.get(OIDC_DISCOVERY_URL)
        response.raise_for_status()
        oidc_config = response.json()

    return oidc_config


auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.get("/login", tags=["login"])
async def login():
    """Initiate the OIDC authentication flow."""
    # state = secrets.token_urlsafe(32)
    # state_store[state] = {"created_at": datetime.now(timezone.utc)}

    config = await get_oidc_config()
    auth_endpoint = config["authorization_endpoint"]

    params = {
        "response_type": "code",
        "client_id": "ba457349-a931-4908-b0d3-434efc715489",
        "scope": "openid",
        "redirect_uri": "https://acc2-dev.biodata.ceitec.cz/api/v1/auth/callback",
        # "redirect_uri": "http://localhost:8000/v1/auth/callback",
        # "state": state,
    }

    query = urllib.parse.urlencode(params)

    return RedirectResponse(f"{auth_endpoint}?{query}")


@auth_router.get("/logout", tags=["logout"])
async def logout():
    """Log out the user."""
    response = RedirectResponse(url="/")
    response.delete_cookie(manager.cookie_name)
    return response


@auth_router.get("/callback", tags=["callback"])
@inject
async def auth_callback(
    code: str, user_repository: UserRepository = Depends(Provide[Container.user_repository])
):
    """Handle the callback from the OIDC provider."""

    # if state not in state_store:
    # raise HTTPException(status_code=400, detail="Invalid state parameter.")

    # state_data = state_store.pop(state)

    # if datetime.now(timezone.utc) - state_data["created_at"] > timedelta(minutes=10):
    # raise HTTPException(status_code=400, detail="State parameter expired.")

    config = await get_oidc_config()
    token_endpoint = config["token_endpoint"]

    async with httpx.AsyncClient() as client:
        response = await client.post(
            token_endpoint,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": "https://acc2-dev.biodata.ceitec.cz/api/v1/auth/callback",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            auth=httpx.BasicAuth(
                username=os.environ.get("OIDC_CLIENT_ID"),
                password=os.environ.get("OIDC_CLIENT_SECRET"),
            ),
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to get token: {response.text}",
            )

        tokens = TokenResponse(**response.json())

        claims = jwt.get_unverified_claims(tokens.access_token)
        openid = claims["sub"]

        # create user if does not exist
        user = user_repository.get(openid)
        if user is None:
            user = User(openid=openid)
            user_repository.store(user)

        if tokens.id_token is not None:
            # TODO verify token
            pass

        # set session cookie
        response = RedirectResponse(url="https://acc2-dev.biodata.ceitec.cz/")
        manager.set_cookie(response, tokens.access_token)

        return response


@auth_router.get("/me", tags=["me"])
async def get_current_user(request: Request):
    """Get informatin about current user (me)."""
    return request.state.user
