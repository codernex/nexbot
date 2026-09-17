from typing import Annotated

from database import get_db
from errors import InvalidCredentialError
from fastapi import APIRouter, Depends, HTTPException, status
from security.is_auth import is_auth
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .dto import LoginPayload, LoginResponse, SignUpPayload, UserResponse
from .service import AuthService

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@auth_router.post("/sign-up", response_model=UserResponse)
async def signup(payload: SignUpPayload, db: DbSession):
    try:
        user = await AuthService.signup(payload, db)
        return user
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="username or email already exist",
        )


@auth_router.post("/sign-in", response_model=LoginResponse)
async def login(payload: LoginPayload, db: DbSession):
    try:
        return await AuthService.login(payload, db)
    except InvalidCredentialError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@auth_router.get("/me")
async def me(user=Depends(is_auth)):
    return user
