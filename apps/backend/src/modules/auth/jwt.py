import jwt

SECRET_KEY = "secret"


def generate_token(payload: dict) -> str:
    return jwt.encode(payload, SECRET_KEY, "HS256")
