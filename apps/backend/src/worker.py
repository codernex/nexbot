import asyncio
import io
import signal

from bullmq import Worker
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from services.r2 import get_file


async def process(job, job_token):
    response = get_file(job.data)

    stream = io.BytesIO(response["Body"].read())

    pdf = PdfReader(stream)

    splitter = RecursiveCharacterTextSplitter(separators=["\n\n", "\n", ".", " ", ""])

    source_docs = []

    for page in pdf.pages:
        source_docs.append(
            Document(
                page_content=page.extract_text(), metadata={"source": page.page_number}
            )
        )

    chunks = splitter.split_documents(source_docs)

    print(chunks)


async def main():
    # Create an event that will be triggered for shutdown
    shutdown_event = asyncio.Event()

    def signal_handler(signal, frame):
        print("Signal received, shutting down.")
        shutdown_event.set()

    # Assign signal handlers to SIGTERM and SIGINT
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    # Feel free to remove the connection parameter, if your redis runs on localhost
    worker = Worker("documents_queue", process)

    # Wait until the shutdown event is set
    await shutdown_event.wait()

    # close the worker
    print("Cleaning up worker...")
    await worker.close()
    print("Worker shut down successfully.")


if __name__ == "__main__":
    asyncio.run(main())
