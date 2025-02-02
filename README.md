# RAG System for Portfolio Support in Google Colab

This repository contains a Google Colab Notebook that implements a Retrieval-Augmented Generation (RAG) system for portfolio support. The system integrates document retrieval, dynamic entity extraction, and external API calls to generate informed, context-aware responses using a Hugging Face language model via Ollama. The entire application runs in Google Colab and is designed to work on both Linux and Windows environments.

- **Author:** David Nguyen
- **Project for:** PeakSpan Capital

---

## Embedding and Language Models Used

- **Embedding Model:**  
  We use the Hugging Face model `all-MiniLM-L6-v2` to encode text chunks extracted from MasterClass documents. This model generates vector representations that enable fast similarity searches using a FAISS vector store.

- **Language Model:**  
  The system utilizes the Ollama integration with the `llama2` model to generate natural language responses based on the retrieved context and API data.

---

## Strategies for Retrieval Accuracy and Persistent Memory

- **Document Processing and Retrieval:**  
  1. The system downloads a ZIP file of MasterClass documents via the `/api/documents/download` endpoint.
  2. It extracts all text files and splits them into manageable chunks using a `CharacterTextSplitter`.
  3. These text chunks are then embedded using the `all-MiniLM-L6-v2` model and stored in an in-memory FAISS vector store, which allows for efficient retrieval of relevant content based on user queries.

- **Persistent Memory:**  
  Conversation history is maintained in a global variable (or via session data) so that context is preserved across multiple user queries. This persistent memory enables the system to handle follow-up questions accurately and generate coherent, context-aware responses.

---

## API Tool Integration Methodology

- **External API Endpoints:**  
  The system integrates with multiple API endpoints, including:
  - **/ping:** Verifies API credentials.
  - **/api/documents/download:** Downloads MasterClass documents.
  - **/api/team** and **/api/team/insights:** Retrieve team profiles and related insights.
  - **/api/investments** and **/api/investments/insights:** Retrieve investment details.
  - **/api/sectors:** Retrieves information about specific sectors.
  - **/api/consultations:** Retrieves consultation details.
  - **/api/scrape:** Scrapes content from provided URLs.

- **Dynamic Entity Extraction:**  
  Regular expressions are used to extract entities (e.g., person names, company names, sectors, URLs) from the user's query or conversation history. Based on keywords such as "consult", "profile", "investment", "sector", or "scrape", the corresponding API endpoint is called.  
  The retrieved data (or friendly messages if no data is found) is then appended to the prompt used to generate the final response.

---

## How to Deploy / Use the Code

### 1. Set Up Your Colab Environment

> **Note:** Please use a Google Colab instance with a GPU (e.g. T4 GPU) for better performance.

**a. Install the Colab XTerm extension (for command-line support):**
```python
!pip install colab-xterm
%load_ext colabxterm
```

**b. Launch an XTerm terminal within Colab:**
```python
%xterm
```
This opens a full-screen terminal window within your notebook.

**c. Install and serve Ollama:**

In the XTerm terminal, run:
```bash
curl https://ollama.ai/install.sh | sh
ollama serve &
```
- The first command installs Ollama.
- The second command starts the Ollama server in the background.  
  *(Tip: Check the `server.log` file for startup messages.)*

**d. Pull an AI Model (Example using `llama2`):**
```bash
ollama pull llama2
```
This downloads the model for use.

**e. Verify the Ollama Installation:**
```python
!ollama -version
```
If you see the version number, your Ollama server is running correctly.

---

### 2. Install Required Python Packages

Run the following cell in Colab:
```python
!pip install langchain_community faiss-cpu sentence-transformers requests flask pyngrok
```

---

### 3. Run the RAG Script

Copy the full RAG system script (provided in the notebook) into a new cell and run it. The script will:
1. Download and extract MasterClass documents.
2. Build a FAISS vector store from the document contents.
3. Initialize the Ollama language model.
4. Start an interactive conversation loop where you can type queries.
5. Retrieve relevant document context and external API data to generate responses.

**Note:**  
- Update `API_TOKEN` and `API_BASE_URL` with your credentials.
- Type queries in the interactive loop. Type `exit` or `quit` to end the session.

---

### 4. Running the Flask App

1. **Set Up ngrok for Colab:**

   - Install pyngrok and Flask if not already installed:
     ```python
     !pip install flask pyngrok
     ```
   - Set your ngrok authtoken (replace `"YOUR_NGROK_AUTH_TOKEN"` with your actual token):
     ```python
     from pyngrok import ngrok
     ngrok.set_auth_token("YOUR_NGROK_AUTH_TOKEN")
     ```

2. **Run the Flask App Cell:**

   Execute the cell containing the Flask app code. Once the documents are loaded and indexed, the app will start on port 5000 and ngrok will create a public tunnel. The output will display a public URL (e.g., `https://your-ngrok-url.ngrok-free.app`).

3. **Test the Flask Endpoint:**

   Send a POST request to the `/chat` endpoint using the public URL. For example, in a new Colab cell:
   ```bash
   !curl -X POST "https://your-ngrok-url.ngrok-free.app/chat" -H "Content-Type: application/json" -d '{"query": "hello"}'
   ```
   Replace `https://your-ngrok-url.ngrok-free.app` with the actual URL printed by ngrok.

---

## Demonstration Examples

Below are some example interactions from the notebook (which you can also verify by viewing the console output in the notebook - under the "RAG System" code section).

- **Example 1: Greeting**
  - **User Query:** `Hello`
  - **Assistant Response:**  
    `Hello! I'm your assistant here to help with information about PeakSpan MasterClasses, team profiles, investments, sectors, and more. How can I assist you today?`

- **Example 2: Query about PeakSpan**
  - **User Query:** `Tell me about PeakSpan`
  - **Assistant Response:**  
    Provides detailed information about PeakSpan, including its investment focus, team structure, and market insights based on the MasterClass documents and API data.

- **Example 3: Consultation Data Query**
  - **User Query:** `I consulted with James Isaacs recently. I forgot, which PeakSpan portfolio companies did James consult with recently?`
  - **Assistant Response:**  
    Retrieves consultation details from the API (or returns a friendly message if no data is found). Note that in this case, James Iaaacs is actually not found in the consultation API (querying the API gives the 404 error). Please also test this functionality with Scott Varner instead.

- **Example 4: Capabilities Query**
  - **User Query:** `My name is Charlie, I work for a company named Vizzo. What are you and what can you do?`
  - **Assistant Response:**  
    `I am an intelligent assistant designed to provide you with up-to-date information about PeakSpan MasterClasses, team profiles, investments, sectors, and related insights. I retrieve document-based context and external API data to help answer your questions accurately. How may I assist you today?`

And many more features can be tested interactively in the notebook.

---

## Time and Challenges

- **Time to Create:** Approximately 5.5-6 hours.
- **Challenges Faced:**
  - Integrating multiple external APIs with robust error handling:
    - Combining various endpoints (team, investments, sectors, consultations, scrape, ping) with robust error handling was challenging. I overcame this by creating dedicated helper functions and using try/except blocks to gracefully handle any failures.
  - Implementing dynamic entity extraction using regular expressions:
    - Implementing dynamic extraction using regular expressions to accurately capture names, companies, sectors, and URLs required several iterations. I refined the regex patterns until the extraction was reliable.
  - Maintaining conversation context (persistent memory) across queries:
    - Preserving conversation history across queries was critical for generating context-aware responses. I implemented a global variable (or session mechanism) to store and update conversation history.
  - Configuring ngrok in Google Colab (including setting the ngrok authtoken) to expose the Flask app:
    - Exposing the Flask app via ngrok required additional setup, including installing pyngrok and setting the ngrok authtoken. I followed online guides and adjusted parameters to ensure a stable public URL.

---

## Why Use Google Colab

Google Colab provides a free, cloud-based Jupyter notebook environment with GPU support, making it an ideal platform for running AI models, training neural networks, and executing complex computations compared to local machines.

Thus, I have elected to use Google Colab for this project to leverage its great GPU capabilities, easy setup, and seamless integration with external APIs and services. 

---

## Code Sharing 

- **BitBucket Repository:** [https://bitbucket.org/hoangsonw/rag-system-peakspan](https://bitbucket.org/hoangsonw/rag-system-peakspan)
- **Google Drive Link for the Colab Notebook:** [https://colab.research.google.com/drive/1rIYsnLwLvSit4Xf7VyT_IIFyDFlohyH7?usp=sharing](https://colab.research.google.com/drive/1rIYsnLwLvSit4Xf7VyT_IIFyDFlohyH7?usp=sharing)

---

## Conclusion

This RAG system for portfolio support in Google Colab demonstrates the integration of document retrieval, dynamic entity extraction, and external API calls to generate context-aware responses using a Hugging Face language model via Ollama. The system is designed to provide accurate and informative responses based on user queries and conversation history. By leveraging the power of AI models and external data sources, the system can assist users in accessing relevant information about PeakSpan MasterClasses, team profiles, investments, sectors, and more.

This was a truly enjoyable project to work on, and I hope that the system meets your expectations and provides valuable support for your portfolio management needs. If you have any feedback, suggestions, or additional requirements, please feel free to reach out. Thank you for the opportunity to work on this project, and I look forward to hearing your thoughts on the system! 🚀
