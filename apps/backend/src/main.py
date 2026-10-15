from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules import auth_router, chat_router, document_router, user_router

app = FastAPI(title="AI Chatbot (nexbot)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(auth_router)
v1_router.include_router(document_router)
v1_router.include_router(chat_router)
v1_router.include_router(user_router)

app.include_router(v1_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", reload=True, port=9090)
