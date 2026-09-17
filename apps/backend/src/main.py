from fastapi import APIRouter, FastAPI
from modules import auth_router, document_router

app = FastAPI(title="AI Chatbot (nexbot)")


v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(auth_router)
v1_router.include_router(document_router)

app.include_router(v1_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", reload=True, port=9090)
