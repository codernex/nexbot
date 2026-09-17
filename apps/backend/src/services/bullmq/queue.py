from bullmq import Queue

queue = Queue("documents_queue")

DOCUMENT_QUEUE = "document_processor"


async def process_document_queue(KEY: str):
    await queue.add(DOCUMENT_QUEUE, KEY)
    await queue.close()
