from pymongo import MongoClient
from langchain_aws import BedrockEmbeddings
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_mongodb import MongoDBAtlasVectorSearch
import streamlit as st

# MongoDB connection details
client = MongoClient("mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini")
db = client['test']  # Database name from the working script
collection = db['foods']  # Collection name from the working script

# Set up the embedding model
embedding_model = BedrockEmbeddings(
    model_id='amazon.titan-embed-text-v2:0',
    credentials_profile_name='default'
)

def get_data():
    """Get all food data from MongoDB"""
    temp_data = collection.find({})
    food_data = list(temp_data)
    print(f"Found {len(food_data)} documents in database")
    return food_data

def upsert_embedding():
    """Add embeddings to documents in MongoDB"""
    food_data = get_data()
    total = len(food_data)
    print(f"Processing {total} documents...")
    
    for i, data in enumerate(food_data, 1):
        try:
            if 'product_name' in data and data['product_name']:
                embedding = embedding_model.embed_query(data['product_name'])
                collection.update_one(
                    {'_id': data['_id']},
                    {'$set': {'embedding': embedding}},
                    upsert=True
                )
                print(f"Added embedding for: {data['product_name']}")
                if i % 100 == 0:
                    print(f'Processed {i}/{total} documents...')
        except Exception as e:
            print(f"Error processing document {data.get('_id', 'unknown')}: {e}")
    print("Finished processing all documents!")

def update_documents_with_text_field():
    """Update MongoDB documents to add a 'text' field that combines all relevant info"""
    try:
        docs = list(collection.find({}))
        print(f"Updating {len(docs)} documents with text field")
        
        for doc in docs:
            # Create text content from existing fields
            text_content = (f"Product ID: {doc.get('product_id', 'Unknown')}\n"
                     f"Product Name: {doc.get('product_name', 'Unknown')}\n"
                     f"Category: {doc.get('category', 'Unknown')}\n"
                     f"Quantity: {doc.get('quantity', 0)}\n"
                     f"Price: ${doc.get('price', 0)}\n"
                     f"Description: {doc.get('description', 'No description')}\n")
            
            # Update the document with a 'text' field
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"text": text_content}}
            )
        
        print("Documents updated successfully")
    except Exception as e:
        print(f"Error updating documents: {e}")

# Update documents to add the 'text' field
update_documents_with_text_field()

# Run the embedding process
upsert_embedding()
print("Embedding data insertion complete!")