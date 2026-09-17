from pydantic import BaseModel, ConfigDict


class SignUpPayload(BaseModel):
    username: str
    email: str
    password: str


class LoginPayload(BaseModel):
    identity: str  # (email | username)
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    user: dict
