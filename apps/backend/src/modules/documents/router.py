import io
from typing import Annotated

from database import get_db
from database.models import Document as DocumentModel
from database.models import DocumentChunk as DocumentChunkModel
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from security.is_auth import AuthenticatedUser
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .embed import generate_embedding

document_router = APIRouter(prefix="/documents", tags=["Documents"])

Session = Annotated[AsyncSession, Depends(get_db)]


async def create_chunks_and_embeddings(
    file: UploadFile,
) -> tuple[list[Document], list[list[float]]]:
    # Read asynchronously from UploadFile
    file_bytes = await file.read()
    stream = io.BytesIO(file_bytes)

    pdf = PdfReader(stream)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""],
    )

    source_docs: list[Document] = []

    for idx, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text and text.strip():
            source_docs.append(Document(page_content=text, metadata={"page": idx + 1}))

    if not source_docs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF contains no readable text.",
        )

    chunks = splitter.split_documents(source_docs)
    embeddings = generate_embedding([text.page_content for text in chunks])

    return chunks, embeddings


@document_router.post("/")
async def upload_documents(
    session: Session,
    user: AuthenticatedUser,
    file: UploadFile = File(...),
) -> dict[str, str | int]:
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed!",
        )

    chunks, embeddings = await create_chunks_and_embeddings(file)

    # 1. Create the parent Document
    document = DocumentModel(
        url=file.filename or "unknown.pdf",
        user_id=user.id,
    )
    session.add(document)
    await session.flush()  # Populates document.id

    # 2. Bulk prepare all chunk models
    chunk_records = [
        DocumentChunkModel(
            document_id=document.id,
            chunk_index=index,
            content=chunk.page_content,
            embedding=vector,  # 1D vector list[float]
        )
        for index, (chunk, vector) in enumerate(zip(chunks, embeddings))
    ]

    session.add_all(chunk_records)
    await session.commit()

    return {
        "message": "Document and embeddings stored successfully",
        "document_id": document.id,
        "chunks_count": len(chunk_records),
    }


@document_router.get("/")
async def get_documents(session: Session, user: AuthenticatedUser):
    stmt = select(DocumentModel).where(DocumentModel.user_id == user.id)

    result = await session.scalars(statement=stmt)

    return result.all()
