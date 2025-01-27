from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import boto3
import json
from botocore.exceptions import ClientError
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/invoke-model")
async def invoke_model(request: PromptRequest):
    model_id = "meta.llama3-3-70b-instruct-v1:0"
    formatted_prompt = f"""
    <|begin_of_text|><|start_header_id|>user<|end_header_id|>
    {request.prompt}
    <|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    """

    native_request = {
        "prompt": formatted_prompt,
        "max_gen_len": 128,
        "temperature": 0.5,
    }

    try:
        # Invoke the model with the request
        response = client.invoke_model(modelId=model_id, body=json.dumps(native_request))
        model_response = json.loads(response["body"].read())
        return {"generation": model_response["generation"]}
    except (ClientError, Exception) as e:
        raise HTTPException(status_code=500, detail=f"Failed to invoke model: {str(e)}")