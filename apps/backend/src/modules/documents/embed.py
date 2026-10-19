from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

embedding_llm = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    api_key="AQ.Ab8RN6L3kGyV79oyFQ18x8IYIELI8Q-21c1JRoeDkZ2Mnnq5QQ",  # type:ignore
)


def generate_embedding(chunks: list[str]) -> list[list[float]]:
    return embedding_llm.embed_documents(chunks)
