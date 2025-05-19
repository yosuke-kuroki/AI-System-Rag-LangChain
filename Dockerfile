# 1) Base image
FROM python:3.10-slim AS base

# Metadata
LABEL org.opencontainers.image.source="https://github.com/hoangsonww/RAG-AI-System-Portfolio-Support"
LABEL org.opencontainers.image.description="RAG System for Portfolio Support: downloads MasterClass docs, builds FAISS vector store, dynamically extracts entities, aggregates API data and uses a Hugging Face embedding model + Ollama LLM."

WORKDIR /app

# 2) Install runtime dependencies
RUN pip install --no-cache-dir \
    langchain_community faiss-cpu sentence-transformers requests

# 3) Copy the code
COPY . .

# 4) Expose any ports if we spin up a webserver (optional)
# EXPOSE 8080

# 5) Default command: run the script
CMD ["python", "rag_langchain_ai_system.py"]
