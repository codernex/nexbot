import uuid

from database import get_db
from database.models import User
from fastapi import APIRouter, Depends
from security.is_auth import AuthenticatedUser
from sqlalchemy.ext.asyncio import AsyncSession

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.get("/api-key")
async def generate_api_key(
    auth: AuthenticatedUser,
    session: AsyncSession = Depends(get_db),
):
    api_key = str(uuid.uuid4())

    user = await session.get(User, auth.id)
    if user:
        user.api_key = api_key
        await session.commit()
    return api_key


@user_router.get("/api-key/list")
async def get_api_key(auth: AuthenticatedUser, session: AsyncSession = Depends(get_db)):
    user = await session.get(User, auth.id)
    if user:
        return user.api_key
    return ""
