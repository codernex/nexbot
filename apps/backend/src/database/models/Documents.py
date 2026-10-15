from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import BaseModel


class Document(BaseModel):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(1000))
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    user: Mapped["User"] = relationship(back_populates="documents")
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class DocumentChunk(BaseModel):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)

    # Storing 1 vector per row allows standard vector similarity search
    embedding: Mapped[list[float]] = mapped_column(Vector(3072), nullable=False)

    document: Mapped["Document"] = relationship(back_populates="chunks")
