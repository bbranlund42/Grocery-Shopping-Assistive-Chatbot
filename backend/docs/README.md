# 2 Parts of this READMEand FASTAPI

**Quick Links:**
- [README: FastAPI Bedrock API Setup](#overview)

---

# README: FastAPI Bedrock API Setup

## Overview
This project provides a FastAPI-based backend to interact with Amazon Bedrock Runtime. It allows users to invoke a machine learning model using the `/invoke-model` endpoint.

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

1. **AWS CLI** (configured with appropriate credentials)
   - [Install AWS CLI]
   - Run `aws configure` to set up your access key, secret key, and region.
2. **Node.js and npm** (for running the JavaScript backend services)
   - Download from [Node.js official website](https://nodejs.org/)
   - Verify installation using:
     ```bash
     node -v
     npm -v
     ```
3. **Concurrently** (for running multiple backend services in one command)
   - Install it globally:
     ```bash
     npm install -g concurrently
     ```

---

## Installation Steps

### Step 1: Install Dependencies

#### Python Dependencies:
Install required Python libraries:
```bash
pip install -r requirements.txt
```
These requirements are:
```bash
fastapi
uvicorn
boto3
pydantic
botocore
pymongo
langchain
langchain-community
langchain-aws
slowapi
```

#### JavaScript Dependencies:
If your `.js` files require npm packages, navigate to the project directory and install dependencies:
```bash
npm install
```

---

### Step 2: Configure AWS Credentials

Ensure your AWS CLI is configured and has the necessary permissions to interact with Amazon Bedrock. Use:
```bash
aws configure
```
Provide your access key, secret key, and region (e.g., `us-east-2`).

---

## Running the Server Locally

### Run FastAPI with JavaScript Services Simultaneously

To start the FastAPI server and JavaScript backend services in a single command, update your `package.json` with the following script:

```json
"scripts": {
  "start:backend": "concurrently \"node index.js\" \"node User_cart.js\""
}
```

Then, simply run:
```bash
npm run start:backend
```

### Or to start all services use the following script, YOU HAVE TO BE IN BACKEND DIRECTORY
```json
"scripts": {
  "start:all": "concurrently \"cd routes && node index.js\" \"cd routes && node User_cart.js\" \"cd routes && node order_history.js\" \"cd ai && uvicorn RAGfastapp:app --host 0.0.0.0 --port 5001 --reload\" \"cd ../frontend && npm start\""
}
```

Then, simply run:
```bash
npm run start:all
```

This will start `uvicorn` and all `.js` services in parallel in one terminal using `concurrently`.

---


### Run FastAPI Server Alone
If you only need to run the FastAPI server, use:
```bash
uvicorn RAGfastapp:app --host 0.0.0.0 --port 5001 --reload
```
for if you want to use the new RAG implementation

##### OR

If you only need to run the FastAPI server, use:
```bash
uvicorn fastapp:app --host 0.0.0.0 --port 5001 --reload
```

---
