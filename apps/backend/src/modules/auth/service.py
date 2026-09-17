import bcrypt
from database.models import User
from errors import InvalidCredentialError
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .dto import LoginPayload, LoginResponse, SignUpPayload


class AuthService:
    @staticmethod
    async def signup(payload: SignUpPayload, db: AsyncSession):
        hashed_pwd = AuthService._hash_password(payload.password)
        user = User(username=payload.username, email=payload.email, password=hashed_pwd)

        db.add(user)

        await db.flush()
        return user

    @staticmethod
    async def login(payload: LoginPayload, db: AsyncSession):
        stmt = select(User).where(
            or_(User.email == payload.identity, User.username == payload.identity)
        )
        result = await db.scalars(stmt)

        user = result.one_or_none()

        if not user:
            raise InvalidCredentialError("username or email is invalide")

        if not AuthService._verify_password(user.password, payload.password):
            raise InvalidCredentialError("username or email is invalide")

        from .jwt import generate_token

        user_dict = {"username": user.username, "email": user.email, "id": user.id}
        token = generate_token(user_dict)

        return LoginResponse(access_token=token, user=user_dict)

    @staticmethod
    def _hash_password(plain_text: str) -> str:
        return bcrypt.hashpw(plain_text.encode(), bcrypt.gensalt()).decode()

    @staticmethod
    def _verify_password(hash_pwd: str, text_pwd: str) -> bool:
        return bcrypt.checkpw(text_pwd.encode(), hash_pwd.encode())
