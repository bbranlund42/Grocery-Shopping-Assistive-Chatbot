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
                        {"role": "model", "text": bot_response, "timestamp": timestamp}
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

9. NEVER add `productID` to the `"answer"` field.
10. If no products match the query, return `"products": []` but still provide an `"answer"`.
11. DO NOT add unrelated responses or assume information that is not in the provided context.
12. If a product is unavailable, explicitly state that in the "answer" field instead of assuming stock.
13. Stick strictly to the context provided—DO NOT invent products or prices.
14. **DO NOT format your response with triple backticks (` ``` `). ONLY return raw JSON.**
15. The `"productID"` **MUST be in the format** `"PXXX"`, where `XXX` is a zero-padded three-digit number (e.g., `"P001"`, `"P002"`). DO NOT return just a number.
16. **DO NOT fabricate or sequentially number productIDs. If product data is missing, state that instead of making up an ID.**

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
    
    # Retrieve relevant documents from the vector database
    try:
        response = qa_chain.invoke({"query": user_query})
        retrieved_info = response["result"]
        # log_langchain_response("langchain",retrieved_info)
        log_message("Bot", retrieved_info)
        
        # used to log th echat history in the database
        log_chat_to_db(user_id, user_query, retrieved_info)
        
        return {"generation": retrieved_info}
    except Exception as e:
        retrieved_info = ""  # Fallback if retrieval fails
        log_message("System", f"Vector DB retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing request")
    
    
    # context = f"""You are a helpful assistant that assists shoppers in a grocery store.  
    #         You provide information about products, availability, and pricing while refraining  
    #         from discussing topics unrelated to grocery store products.  

    #         When asked to display inventory data, present the information in the following structured table format:

    #         | Product ID | Product Name        | Category   | Quantity | Price  | Description       |
    #         |------------|---------------------|------------|----------|--------|-------------------|
    #         | 12345      | Apples              | Produce    | 50       | $1.99  | Fresh red apples  |
    #         | 67890      | Milk (1 Gallon)     | Dairy      | 20       | $3.49  | Whole milk        |
    #         | 11223      | Bread (Whole Wheat) | Bakery     | 15       | $2.99  | Soft whole wheat  |
    #         | 44556      | Eggs (12 count)     | Dairy      | 30       | $4.29  | Farm-fresh eggs   |
    #         | 78901      | Chicken Breast (lb) | Meat       | 25       | $5.99  | Boneless, skinless|
    #         | 23456      | Rice (5 lb)         | Grains     | 10       | $6.49  | Long-grain rice   |

    #         Ensure that product details align with the available inventory. If data is missing,  
    #         notify the user rather than generating inaccurate information. Ensure the borders in the table line up so that the table is easily readable.
    #         Relevant information retrieved: {retrieved_info}""" if retrieved_info else "No relevant documents found."
    
    # context = f"""You are a helpful assistant that assists shoppers in a grocery store.  
    #     You provide information about products, pricing, and availability while refraining  
    #     from discussing topics unrelated to grocery store items.  

    #     When returning a list of items, format the response as a **properly aligned table**  
    #     with clear borders, ensuring readability. The table should include columns for  
    #     Product ID, Item Name, Category, Price, Quantity in Stock, and Description.  
    #     Only use real data, DO NOT fabricate data.
    #     If data is available, format it as follows:  

    #     | Product ID | Item Name          | Category   | Price  | Quantity | Description        |
    #     |------------|--------------------|------------|--------|----------|--------------------|
    #     | P002       | Apples             | Produce    | $1.99  | 50       | Fresh red apples   |
    #     | P003       | Milk (1 Gallon)    | Dairy      | $3.49  | 20       | Whole milk         |
    #     | P001       | Bread (Whole Wheat)| Bakery     | $2.99  | 15       | Soft whole wheat   |

    #     Ensure the table aligns properly by adjusting spaces as needed.  

    #     Relevant information retrieved: {retrieved_info}""" if retrieved_info else "No relevant documents found."
    
    # # Format the prompt
    # formatted_prompt = f"""
    # <|begin_of_text|>
    # <|start_header_id|>system<|end_header_id|>
    # {context}
    # <|eot_id|>
    # <|start_header_id|>user<|end_header_id|>
    # {user_query}
    # <|eot_id|>
    # <|start_header_id|>assistant<|end_header_id|>
    # """

    # native_request = {
    #     "prompt": formatted_prompt,
    #     "max_gen_len": 512,
    #     "temperature": 0.1,
    # }

    # try:
    #     response = client.invoke_model(modelId="meta.llama3-3-70b-instruct-v1:0", body=json.dumps(native_request))
    #     model_response = json.loads(response["body"].read())
    #     bot_reply = model_response.get("generation", "")
    #     log_message("Bot", bot_reply)
    #     return {"generation": bot_reply}
    # except (ClientError, Exception) as e:
    #     error_message = f"Failed to invoke model: {str(e)}"
    #     log_message("System", error_message)
    #     raise HTTPException(status_code=500, detail=error_message)
    
    
    
    #add a !@ before the first item and between all of the next items to delimit the items, display all the information from the database.
    #9. Display the JSON at the very end of the message, add !@# between your response and the JSON.