from typing import Annotated

from database import get_db
from database.models import Document, DocumentChunk, User
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from langchain.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..documents.embed import generate_embedding

chat_router = APIRouter(tags=["Chat"], prefix="/chat")

api_key = APIKeyHeader(name="X-API-KEY")


class ChatDTO(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


chat_llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    api_key="AQ.Ab8RN6L3kGyV79oyFQ18x8IYIELI8Q-21c1JRoeDkZ2Mnnq5QQ",  # Reuses existing key
    temperature=0.2,
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ".", " ", ""],
)

Session = Annotated[AsyncSession, Depends(get_db)]


@chat_router.post("/")
async def chat(session: Session, payload: ChatDTO, api_key=Security(api_key), limit=3):
    print("🐍 File: chat/router.py | Line: 48 | undefined ~ api_key", api_key)
    chunk = splitter.split_text(payload.message)
    query_vector = generate_embedding(chunk)

    stmt = select(User).where(User.api_key == api_key)

    result = await session.scalars(stmt)

    user = result.first()

    if not user:
        raise HTTPException(401, "Missing or invalid api-key")

    stmt = (
        select(DocumentChunk)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(Document.user_id == user.id)  # Only query user's own docs
        .order_by(DocumentChunk.embedding.cosine_distance(query_vector[0]))
        .limit(limit)
    )

    results = await session.scalars(stmt)

    chunks = results.all()
    if chunks:
        context_text = "\n\n---\n\n".join(
            [f"[Chunk {chunk.id}]:\n{chunk.content}" for chunk in chunks]
        )
    else:
        context_text = "No relevant context found in documents"

    system_prompt = (
        "You are an intelligent document assistant. Use the provided context extracted "
        "from the user's documents to answer the question truthfully and accurately. "
        "If the answer cannot be determined from the context, clarify that the documents "
        "do not contain that information, but answer helpfully if possible.\n\n"
        f"Context:\n{context_text}"
    )

    response = await chat_llm.ainvoke(
        [
            SystemMessage(content=system_prompt),
            HumanMessage(content=payload.message),
        ]
    )
    return ChatResponse(
        answer=response.content[0]["text"],
        sources=[
            {"id": c.id, "document_id": c.document_id, "content": c.content[:200]}
            for c in chunks
        ],
    )
