from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from api.v1.schemas.response import ResponseError


async def http_exception_handler(_: Request, exception: HTTPException):
    return JSONResponse(
        status_code=exception.status_code,
        content=ResponseError(status_code=exception.status_code, message=exception.detail).model_dump_json(),
    )
