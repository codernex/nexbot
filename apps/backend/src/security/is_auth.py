from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from modules.auth.dto import UserResponse

auth_scheme = HTTPBearer()


def is_auth(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(auth_scheme)],
) -> UserResponse:
    token = credentials.credentials

    user_dict = jwt.decode(token, "secret", "HS256")
    print("🐍 File: security/is_auth.py | Line: 17 | undefined ~ user_dict", user_dict)

    return UserResponse(**user_dict)


AuthenticatedUser = Annotated[UserResponse, Depends(is_auth)]
