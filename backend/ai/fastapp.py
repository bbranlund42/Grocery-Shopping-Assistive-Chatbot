from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import boto3
import json
from botocore.exceptions import ClientError
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

app = FastAPI()

# Add this middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with the specific frontend URL in production (example,"http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (like POST, GET, OPTIONS)
    allow_headers=["*"],  # Allow all headers
)

# Create a Bedrock Runtime client
client = boto3.client("bedrock-runtime", region_name="us-east-2")

# Define a request model
class PromptRequest(BaseModel):
    prompt: str

# Setup logging
LOG_FILE = "chat_history.log"

def log_message(speaker: str, message: str):
    """Logs chat history with timestamps."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {speaker}: {message}\n"
    
    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(log_entry)

@app.post("/invoke-model")
async def invoke_model(request: PromptRequest):
    model_id = "meta.llama3-3-70b-instruct-v1:0"

    context = """You are a helpful assistant that helps shoppers 
        in a grocery store with a variety of issues. Please refrain 
        from discussing anything but grocery-store and product-related 
        questions and topics."""

    # Parse the chat history from the frontend
    messages = request.prompt.strip().split("\n")  # Split by newlines
    formatted_prompt = f"""<|begin_of_text|>
    <|start_header_id|>system<|end_header_id|>
    {context}
    <|eot_id|>"""

    # Alternate user and assistant messages properly
    for i, message in enumerate(messages):
        if i % 2 == 0:  # User message
            formatted_prompt += f"\n<|start_header_id|>user<|end_header_id|>\n{message}\n<|eot_id|>"
            log_message("User", message)
        else:  # Assistant message
            formatted_prompt += f"\n<|start_header_id|>assistant<|end_header_id|>\n{message}\n<|eot_id|>"
            log_message("Bot", message)

    # Append assistant token to generate new response
    formatted_prompt += "\n<|start_header_id|>assistant<|end_header_id|>\n"

    native_request = {
        "prompt": formatted_prompt,
        "max_gen_len": 128,
        "temperature": 0.5,
    }

    try:
        response = client.invoke_model(modelId=model_id, body=json.dumps(native_request))
        model_response = json.loads(response["body"].read())
        
        bot_reply = model_response.get("generation", "")
        log_message("Bot", bot_reply)  # Log bot's response

        return {"generation": bot_reply}
    
    except (ClientError, Exception) as e:
        error_message = f"Failed to invoke model: {str(e)}"
        log_message("System", error_message)  # Log errors
        raise HTTPException(status_code=500, detail=error_message)