from fastapi import APIRouter, File, HTTPException, UploadFile, status
from services.bullmq.queue import process_document_queue
from services.r2 import upload_file

document_router = APIRouter(prefix="/documents", tags=["Documents"])


@document_router.post("/")
async def upload_documents(file: UploadFile = File(...)) -> str:

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed !",
        )
    key = upload_file(file)
    await process_document_queue(key)
    return key
