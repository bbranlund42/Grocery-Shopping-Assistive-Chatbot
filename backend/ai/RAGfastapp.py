from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import boto3
import json
from botocore.exceptions import ClientError
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
from pymongo import MongoClient
from langchain_aws import BedrockEmbeddings, BedrockLLM
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

app = FastAPI()

# Add this middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with the specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a Bedrock Runtime client
client = boto3.client("bedrock-runtime", region_name="us-east-2")

# MongoDB Connection
mongo_client = MongoClient("mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini")
db = mongo_client["test"]
collection = db['foods']

# added for chat history
chat_collection = db["chat_history"]  # New collection for chat logs


# Setup local logging
LOG_FILE = "chat_history.log"
LOG_FILE2 = "langchain_history.log"

# logs the chat history to local copy
def log_message(speaker: str, message: str):
    """Logs chat history with timestamps."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {speaker}: {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(log_entry)

# depricated function for returning what langchain returns
# def log_langchain_response(speaker: str, message: str):
#     """Logs langchain history with timestamps."""
#     timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#     log_entry = f"[{timestamp}] {speaker}: {message}\n"
#     with open(LOG_FILE2, "a", encoding="utf-8") as file:
#         file.write(log_entry)

# this is used to log the chat history to the database
def log_chat_to_db(user_id, user_message, bot_response):
    timestamp = datetime.now()
    chat_collection.update_one(
        {"user_id": user_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "text": user_message, "timestamp": timestamp},
                        {"role": "assistant", "text": bot_response, "timestamp": timestamp}
                    ]
                }
            }
        },
        upsert=True  # Creates a new document if user_id doesn't exist
    )


# Configure LangChain RAG

def get_bedrock_embeddings():
    return BedrockEmbeddings(
        client=client,
        model_id="amazon.titan-embed-text-v2:0"
    )

def get_llama_llm():
    return BedrockLLM(
        client=client,
        model_id="meta.llama3-3-70b-instruct-v1:0",
        model_kwargs={
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 512
        }
    )

def setup_rag_chain():
    embedding_function = get_bedrock_embeddings()
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embedding_function,
        index_name="food2", # update with the atlas Index
        embedding_key="embedding"
    )
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6}
    )
    llm = get_llama_llm()
    prompt = PromptTemplate(
        template="""<|begin_of_text|>
<|start_header_id|>system<|end_header_id|>
You are Chuck Cartis (Tell them it's a play on words with Cart), an AI assistant specialized in helping shoppers at a grocery store. You provide accurate information about products, pricing, inventory, and store services.

GUIDELINES:
1. ONLY answer questions about grocery products and store-related topics.
2. ONLY use data from the provided context - NEVER fabricate product information.
3. If specific information is missing, clearly state what's not available rather than guessing.
4. For pricing questions, be specific about units, quantities, and any promotions.
5. For inventory questions, provide current stock levels when available.
6. For product location questions, specify aisle and section when available.
7. Answer concisely but completely.
8. Your response **must always be in JSON format** with two keys:
    - `"answer"`: A short, direct response to the user's query (DO NOT include product IDs here).
    - `"products"`: A list of product details, where each product includes:
        - `"product_name"`
        - `"quantity"`
        - `"price"` (as a number)
        - `"productID"` **(must be exactly as provided in the database, e.g., `"P001"`, `"P002"`)**.
        - `"category"` **(must be exactly as provided in the database, e.g., `"Snack"`, `"Dairy"`)**.
        - `"location"` **(must be exactly as provided in the database, e.g., `"A01"`, `"A87"`)**.

9. NEVER add `productID` to the `"answer"` field.
10. If no products match the query, return `"products": []` but still provide an `"answer"`.
11. DO NOT add unrelated responses or assume information that is not in the provided context.
12. If a product is unavailable, explicitly state that in the "answer" field instead of assuming stock.
13. Stick strictly to the context provided—DO NOT invent products or prices.
14. **DO NOT format your response with triple backticks (` ``` `). ONLY return raw JSON.**
15. The `"productID"` **MUST be in the format** `"PXXX"`, where `XXX` is a zero-padded three-digit number (e.g., `"P001"`, `"P002"`). DO NOT return just a number.
16. **DO NOT fabricate or sequentially number productIDs. If product data is missing, state that instead of making up an ID.**
17. Tone & Personality: Maintain a friendly and helpful tone. Always greet customers warmly, e.g., "Hello! I'm Chuck Cartis. How can I assist you today?"

RELEVANT PRODUCT DATABASE INFORMATION:
{context}
<|eot_id|>
<|start_header_id|>user<|end_header_id|>
{question}
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
""",
    input_variables=["context", "question"]
    )
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )

qa_chain = setup_rag_chain()

# Define a request model
class PromptRequest(BaseModel):
    prompt: str

# used to store the chat history in the database
@app.get("/chat-history/{user_id}")
async def get_chat_history(user_id: str):
    chat = chat_collection.find_one({"user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="No chat history found.")
    return {"messages": chat["messages"]}

@app.post("/invoke-model")
async def invoke_model(request: PromptRequest):
    user_query = request.prompt.strip()
    log_message("User", user_query)
    user_id = "1111"
    
    try:
        response = qa_chain.invoke({"query": user_query})
        retrieved_info = response["result"]
        log_message("Assistant", retrieved_info)
        
        # Extract only the most recent user message from the prompt
        last_user_message = user_query.strip().split("\n")[-1]
        if last_user_message.lower().startswith("user:"):
            last_user_message = last_user_message[5:].strip()

        # Extract just the assistant's answer
        try:
            parsed = json.loads(retrieved_info)
            answer_only = parsed.get("answer", retrieved_info)
        except Exception:
            answer_only = retrieved_info

        log_chat_to_db(user_id, last_user_message, answer_only)
        
        return {"generation": retrieved_info}
    except Exception as e:
        log_message("System", f"Vector DB retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing request")


# function for Chat History
@app.get("/chat-history/{user_id}")
async def get_chat_history(user_id: str):
    chat = chat_collection.find_one({"user_id": user_id})
    if not chat:
        # Return empty messages array instead of 404 error
        return {"messages": []}
    
    # Format timestamps for frontend display if they exist
    for message in chat["messages"]:
        if "timestamp" in message:
            message["timestamp"] = message["timestamp"].isoformat()
    
    return {"messages": chat["messages"]}