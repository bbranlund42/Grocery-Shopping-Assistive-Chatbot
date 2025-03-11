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

# Setup logging
LOG_FILE = "chat_history.log"

def log_message(speaker: str, message: str):
    """Logs chat history with timestamps."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {speaker}: {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(log_entry)

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
            "temperature": 0.3,
            "top_p": 0.9,
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
        template="""You are a helpful assistant that helps shoppers 
        in a grocery store with a variety of issues. Please refrain 
        from discussing anything but grocery-store and product-related 
        questions and topics. If providing a list of items and their
        information, please provide the information in the format of a table.
        Context information from the product database:
        {context}
        Question: {question}
        Provide a comprehensive answer based only on the information in the context.""",
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

@app.post("/invoke-model")
async def invoke_model(request: PromptRequest):
    user_query = request.prompt.strip()
    log_message("User", user_query)
    
    # Retrieve relevant documents from the vector database
    try:
        response = qa_chain.invoke({"query": user_query})
        retrieved_info = response["result"]
    except Exception as e:
        retrieved_info = ""  # Fallback if retrieval fails
        log_message("System", f"Vector DB retrieval error: {str(e)}")
    
    context = f"Relevant information retrieved: {retrieved_info}" if retrieved_info else "No relevant documents found."
    
    # Format the prompt
    formatted_prompt = f"""
    <|begin_of_text|>
    <|start_header_id|>system<|end_header_id|>
    {context}
    <|eot_id|>
    <|start_header_id|>user<|end_header_id|>
    {user_query}
    <|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    """

    native_request = {
        "prompt": formatted_prompt,
        "max_gen_len": 512,
        "temperature": 0.3,
    }

    try:
        response = client.invoke_model(modelId="meta.llama3-3-70b-instruct-v1:0", body=json.dumps(native_request))
        model_response = json.loads(response["body"].read())
        bot_reply = model_response.get("generation", "")
        log_message("Bot", bot_reply)
        return {"generation": bot_reply}
    except (ClientError, Exception) as e:
        error_message = f"Failed to invoke model: {str(e)}"
        log_message("System", error_message)
        raise HTTPException(status_code=500, detail=error_message)