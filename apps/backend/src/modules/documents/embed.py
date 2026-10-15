from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

embedding_llm = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    api_key="AQ.Ab8RN6KltDI6KGMHCxjBe8XhN1eWWVS2rVRuuwnZvAu3EI25MA",  # type:ignore
)


def generate_embedding(chunks: list[str]) -> list[list[float]]:
    return embedding_llm.embed_documents(chunks)
