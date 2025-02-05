"""
This is a minimal interactive Python application for Google Colab that uses
the Hugging Face-based Ollama model (via LangChain Community) to answer queries.
No RAG or web server is used yet -- this is for testing purposes to ensure the model
is running correctly.

NOTE: This code is for reference only. It should be run inside a Google Colab notebook. Refer to the Google Colab notebook in this repository for more details.

Usage:
  - Simply run this cell.
  - Type your query when prompted.
  - Type 'exit' or 'quit' to end the session.
"""

# Import the necessary library
from langchain_community.llms import Ollama

# Initialize the Ollama model using the "llama2" model
try:
    llm = Ollama(model="llama2")
    print("Successfully initialized the Ollama model with llama2.")
except Exception as e:
    print(f"Error initializing the model: {e}")
    raise

# Start an interactive loop for user queries
print("\nEnter your queries below (type 'exit' or 'quit' to stop):")
while True:
    # Prompt the user for input
    user_query = input("\nYour Query: ")

    # Allow exit of the loop
    if user_query.lower() in ['exit', 'quit']:
        print("Exiting the interactive session. Goodbye!")
        break

    # Invoke the model with the provided query and print the response
    try:
        response = llm.invoke(user_query)
        print("\nResponse:", response)
    except Exception as e:
        print("Error during model invocation:", e)
