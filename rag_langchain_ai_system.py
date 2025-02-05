"""
RAG System for Portfolio Support in Google Colab with Full API Integration,
Dynamic Entity Extraction, Conversation History, and Reduced Hallucinations

This script:
  1. Downloads a ZIP file containing MasterClass documents from the /api/documents/download endpoint.
  2. Unzips and reads all text files.
  3. Splits each document into more manageable text chunks.
  4. Uses a Hugging Face embedding model to encode these chunks and build an in‑memory FAISS vector store.
  5. At startup, calls the /ping endpoint to verify API credentials.
  6. Runs an interactive conversation loop that:
       - Retrieves relevant document chunks based on the user's query.
       - Dynamically extracts entities (person names, company names, sectors, URLs) from the query or conversation history.
       - Based on keywords (e.g. "consult", "profile", "investment", "sector", "scrape"), calls the corresponding API endpoints:
            • /api/consultations
            • /api/team and /api/team/insights
            • /api/investments and /api/investments/insights
            • /api/sectors
            • /api/scrape
            • /ping (checked once at startup)
       - Appends the retrieved API information (or friendly messages if data is unavailable), document context, and conversation history to the prompt.
       - Uses a Hugging Face language model (via the Ollama integration) to generate an answer.

Before running, ensure you have installed these packages:
    !pip install langchain_community faiss-cpu sentence-transformers requests

NOTE: This script is for reference only and should be run in a local environment or Google Colab. Refer to the full code in the notebook to run the system.

Author: David Nguyen
Date: 2/2/2025
"""

import os
import io
import zipfile
import re
import requests
import logging

# LangChain imports
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

# Ollama integration (from LangChain Community) for LLM
from langchain_community.llms import Ollama

# Set up logging for debugging
logging.basicConfig(level=logging.INFO)

# Override logging.error to suppress error messages from appearing on the console.
logging.error = lambda *args, **kwargs: None

#########################
# Configuration Section #
#########################

# Replace the URL if you are hosting the API elsewhere and have a different base URL
API_BASE_URL = "https://rag-langchain-ai-system.onrender.com"
DOCUMENTS_DOWNLOAD_ENDPOINT = f"{API_BASE_URL}/api/documents/download"
API_TOKEN = "token"  # Call the /auth/token endpoint first to get a token

# NOTE: If you are using the sample Express API in this repo, you can call the API endpoint at /auth/token
# and use the token generated from the response here.

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
LLM_MODEL_NAME = "llama2"

###############################
# API Helper Functions        #
###############################

def api_get(endpoint: str, params: dict) -> dict:
    """
    Call a GET endpoint with Authorization.
    """
    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    url = f"{API_BASE_URL}{endpoint}"
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


# Ping endpoint: verifies token validity
def get_ping() -> dict:
    return api_get("/ping", {})


# Team endpoints
def get_team_profile(name: str) -> dict:
    return api_get("/api/team", {"name": name})


def get_team_insights(name: str) -> dict:
    return api_get("/api/team/insights", {"name": name})


# Investments endpoints
def get_investments(company_name: str) -> dict:
    return api_get("/api/investments", {"company_name": company_name})


def get_investments_insights(company_name: str) -> dict:
    return api_get("/api/investments/insights", {"company_name": company_name})


# Sectors endpoint
def get_sectors(sector: str) -> dict:
    return api_get("/api/sectors", {"sector": sector})


# Consultations endpoint
def get_consultations(name: str) -> dict:
    return api_get("/api/consultations", {"name": name})


# Scrape endpoint
def get_scrape(url: str) -> dict:
    return api_get("/api/scrape", {"url": url})


#######################################
# Dynamic Entity Extraction Functions #
#######################################

def extract_person_name(text: str, keyword: str) -> str:
    """
    Extract a person’s name based on a keyword (e.g. "consult", "profile", "team").
    Looks for patterns like "consulted with <Name>" or "profile for <Name>".
    """
    pattern = re.compile(rf"{keyword}\s+(?:with|for)?\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)", re.IGNORECASE)
    match = pattern.search(text)
    if match:
        return match.group(1).strip()
    return None


def extract_company_name(text: str) -> str:
    """
    Extract a company name from the text.
    Looks for patterns like "company <CompanyName>".
    """
    pattern = re.compile(r"company\s+([A-Z][a-zA-Z0-9& ]+)", re.IGNORECASE)
    match = pattern.search(text)
    if match:
        return match.group(1).strip()
    return None


def extract_sector(text: str) -> str:
    """
    Extract a sector name from the text.
    Looks for patterns like "sector of <Sector Name>" or "sector <Sector Name>".
    """
    pattern = re.compile(r"sector(?:s)?(?:\s+of)?\s+([A-Za-z ]+)", re.IGNORECASE)
    match = pattern.search(text)
    if match:
        return match.group(1).strip()
    return None


def extract_url(text: str) -> str:
    """
    Extract a URL from the text.
    """
    match = re.search(r"(https?://\S+)", text)
    if match:
        return match.group(1).strip()
    return None


##################################
# Document Download & Processing #
##################################

def download_documents_zip(api_token: str) -> bytes:
    """
    Download a zip file containing documents from the API using the provided API token.
    """
    headers = {"Authorization": f"Bearer {api_token}"}
    try:
        logging.info("Requesting documents zip from API...")
        response = requests.get(DOCUMENTS_DOWNLOAD_ENDPOINT, headers=headers)
        response.raise_for_status()
        logging.info("Successfully downloaded documents zip.")
        return response.content
    except Exception as e:
        logging.error("Failed to download documents zip: %s", e)
        raise


def extract_documents(zip_bytes: bytes) -> dict:
    """
    Extract text documents from a zip file provided as bytes.
    """
    documents = {}
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for file_info in z.infolist():
            if file_info.filename.endswith(".txt"):
                with z.open(file_info) as f:
                    content = f.read().decode("utf-8")
                    documents[file_info.filename] = content
                    logging.info("Extracted document: %s", file_info.filename)
    if not documents:
        logging.warning("No text documents found in the zip file.")
    return documents


def build_vector_store(documents: dict) -> FAISS:
    """
    Build a FAISS vector store from a dictionary of documents.

    The function formats each document by appending its source filename, splits the text
    into chunks using a CharacterTextSplitter, generates embeddings for the text chunks using
    a specified HuggingFace model, and finally builds a FAISS vector store with these embeddings.
    """
    all_texts = []
    for filename, content in documents.items():
        text_with_source = f"[{filename}]\n{content}"
        all_texts.append(text_with_source)
    text_splitter = CharacterTextSplitter(separator="\n", chunk_size=500, chunk_overlap=100)
    texts = []
    for text in all_texts:
        texts.extend(text_splitter.split_text(text))
    logging.info("Total text chunks generated: %d", len(texts))
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    vector_store = FAISS.from_texts(texts, embeddings)
    logging.info("Built FAISS vector store.")
    return vector_store


###############################
# LLM Initialization (Ollama) #
###############################

try:
    llm = Ollama(model=LLM_MODEL_NAME)
    logging.info("Successfully initialized Ollama model: %s", LLM_MODEL_NAME)
except Exception as e:
    logging.error("Error initializing the LLM: %s", e)
    raise


###############################
# API Information Aggregation #
###############################

def fetch_api_info(query: str, conversation_history: str) -> str:
    """
    Dynamically extract entities from the query or conversation history and call all relevant API endpoints.
    Returns a formatted string with retrieved API data or friendly messages if not found.
    """
    additional_info = ""

    # If the query is a simple greeting, return nothing extra.
    if query.strip().lower() in ["hello", "hi", "hey"]:
        return additional_info

    # Ping endpoint: (call once at startup; here we include it if mentioned)
    if "ping" in query.lower():
        try:
            ping_info = get_ping()
            additional_info += "\n[Ping Info]\n" + str(ping_info) + "\n"
        except Exception as e:
            logging.error("Error fetching ping info: %s", e)
            additional_info += "\n[Note: Unable to verify API credentials at this time.]\n"

    # Consultations (if query contains "consult")
    if "consult" in query.lower():
        person = extract_person_name(query, "consult")
        if not person:
            person = extract_person_name(conversation_history, "consult")
        if person:
            try:
                consultations = get_consultations(person)
                if consultations:
                    additional_info += f"\n[Consultations for {person}]\n" + str(consultations) + "\n"
                else:
                    additional_info += f"\n[Note: No consultations found for {person}.]\n"
            except Exception as e:
                logging.error("Error fetching consultations for %s: %s", person, e)
                additional_info += f"\n[Note: No consultations found for {person}.]\n"
        else:
            additional_info += "\n[Note: No consultant name found for consultation lookup.]\n"

    # Team profile and insights (if query mentions "profile" or "team")
    if "profile" in query.lower() or "team" in query.lower():
        person = extract_person_name(query, "profile")
        if not person:
            person = extract_person_name(query, "team")
        if not person:
            person = extract_person_name(conversation_history, "profile")
        if person:
            try:
                team_profile = get_team_profile(person)
                if team_profile:
                    additional_info += f"\n[Team Profile for {person}]\n" + str(team_profile) + "\n"
                else:
                    additional_info += f"\n[Note: No team profile found for {person}.]\n"
            except Exception as e:
                logging.error("Error fetching team profile for %s: %s", person, e)
                additional_info += f"\n[Note: No team profile found for {person}.]\n"
            try:
                team_insights = get_team_insights(person)
                if team_insights:
                    additional_info += f"\n[Team Insights for {person}]\n" + str(team_insights) + "\n"
                else:
                    additional_info += f"\n[Note: No team insights found for {person}.]\n"
            except Exception as e:
                logging.error("Error fetching team insights for %s: %s", person, e)
                additional_info += f"\n[Note: No team insights found for {person}.]\n"
        else:
            additional_info += "\n[Note: No person name found for team profile lookup.]\n"

    # Investments and investment insights (if query mentions "investment", "invest", or "company")
    if "investment" in query.lower() or "invest" in query.lower() or "company" in query.lower():
        company = extract_company_name(query)
        if not company:
            company = extract_company_name(conversation_history)
        if company:
            try:
                investments = get_investments(company)
                if investments:
                    additional_info += f"\n[Investments info for {company}]\n" + str(investments) + "\n"
                else:
                    additional_info += f"\n[Note: No investment info found for {company}.]\n"
            except Exception as e:
                logging.error("Error fetching investments for %s: %s", company, e)
                additional_info += f"\n[Note: No investment info found for {company}.]\n"
            try:
                inv_insights = get_investments_insights(company)
                if inv_insights:
                    additional_info += f"\n[Investment Insights for {company}]\n" + str(inv_insights) + "\n"
                else:
                    additional_info += f"\n[Note: No investment insights found for {company}.]\n"
            except Exception as e:
                logging.error("Error fetching investment insights for %s: %s", company, e)
                additional_info += f"\n[Note: No investment insights found for {company}.]\n"
        else:
            additional_info += "\n[Note: No company name found for investment lookup.]\n"

    # Sector information (if query mentions "sector")
    if "sector" in query.lower():
        sector = extract_sector(query)
        if not sector:
            sector = extract_sector(conversation_history)
        if sector:
            try:
                sectors_info = get_sectors(sector)
                if sectors_info:
                    additional_info += f"\n[Sectors info for {sector}]\n" + str(sectors_info) + "\n"
                else:
                    additional_info += f"\n[Note: No sector info found for {sector}.]\n"
            except Exception as e:
                logging.error("Error fetching sector info for %s: %s", sector, e)
                additional_info += f"\n[Note: No sector info found for {sector}.]\n"
        else:
            additional_info += "\n[Note: No sector name found for lookup.]\n"

    # Scrape endpoint (if a URL is present)
    url = extract_url(query)
    if not url:
        url = extract_url(conversation_history)
    if url:
        try:
            scrape_info = get_scrape(url)
            if scrape_info:
                additional_info += f"\n[Scraped Content from {url}]\n" + str(scrape_info) + "\n"
            else:
                additional_info += f"\n[Note: No scraped content found for {url}.]\n"
        except Exception as e:
            logging.error("Error scraping URL %s: %s", url, e)
            additional_info += f"\n[Note: Unable to scrape content from {url}.]\n"

    return additional_info


##################################
# Retrieval-Augmented Generation #
##################################

def generate_answer(query: str, conversation_history: str, vector_store: FAISS) -> str:
    """
    Generate an answer by combining document-based context, additional API info, and conversation history.
    For simple greetings or introductory queries, return a generic introduction.
    """
    lower_query = query.strip().lower()
    # Generic introduction for greetings.
    if lower_query in ["hello", "hi", "hey"]:
        return ("Hello! I'm your assistant here to help with information about PeakSpan MasterClasses, "
                "team profiles, investments, sectors, and more. How can I assist you today?")

    # Check for introductory queries like "what are you and what can you do"
    if "what are you" in lower_query and "what can you do" in lower_query:
        return ("I am an intelligent assistant designed to provide you with up-to-date information "
                "about PeakSpan MasterClasses, team profiles, investments, sectors, and related insights. "
                "I retrieve document-based context and external API data to help answer your questions accurately. "
                "How may I assist you today?")

    try:
        retrieved_docs = vector_store.similarity_search(query, k=3)
        context_text = "\n\n".join([doc.page_content for doc in retrieved_docs])
    except Exception as e:
        logging.error("Error during similarity search: %s", e)
        context_text = ""

    api_info = fetch_api_info(query, conversation_history)

    prompt = (
        "You are a knowledgeable assistant with access to PeakSpan MasterClass documents and external API data.\n\n"
        "Relevant Document Context:\n"
        f"{context_text}\n\n"
        "Additional API Information:\n"
        f"{api_info}\n\n"
        "Conversation History:\n"
        f"{conversation_history}\n\n"
        f"User: {query}\n"
        "Assistant:"
    )

    try:
        response = llm.invoke(prompt)
        return response
    except Exception as e:
        logging.error("Error invoking the LLM: %s", e)
        return "Sorry, I encountered an error while generating the answer."


##############################
# Main Interactive Loop      #
##############################

def main():
    # 1. Verify API credentials via the ping endpoint
    try:
        ping_info = get_ping()
        logging.info("API Ping successful: %s", ping_info)
    except Exception as e:
        logging.error("API Ping failed: %s", e)
        print("Error: Unable to verify API credentials. Please check your token.")
        return

    # 2. Download and process documents
    try:
        zip_bytes = download_documents_zip(API_TOKEN)
        docs = extract_documents(zip_bytes)
        if not docs:
            print("No documents found. Exiting.")
            return
        vector_store = build_vector_store(docs)
    except Exception as e:
        print("Error during document preparation:", e)
        return

    print("Documents are loaded and indexed. You can now start asking questions!")
    print("Type 'exit' or 'quit' to end the session.")

    # 3. The user can now interact with the AI normally
    conversation_history = ""

    while True:
        user_query = input("\nYour Query: ").strip()
        if user_query.lower() in ['exit', 'quit']:
            print("Exiting the session. Goodbye!")
            break

        conversation_history += f"\nUser: {user_query}"
        answer = generate_answer(user_query, conversation_history, vector_store)
        print("\nAssistant:", answer)
        conversation_history += f"\nAssistant: {answer}"


if __name__ == "__main__":
    main()
