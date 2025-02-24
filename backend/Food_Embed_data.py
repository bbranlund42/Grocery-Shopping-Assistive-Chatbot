from pymongo import MongoClient
from langchain_aws import ChatBedrock
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_mongodb import MongoDBAtlasVectorSearch
import streamlit as st
from Food_embed import LlamaBedrockEmbeddings

# MongoDB connection details
client = MongoClient("mongodb+srv://user:123@capgemini.zcb5v.mongodb.net/?retryWrites=true&w=majority&appName=CapGemini")
db = client['test']  # Database name from the working script
collection = db['foods']  # Collection name from the working script


# Set up the embedding model
embedding_model = LlamaBedrockEmbeddings(
    model_id='meta.llama3-3-70b-instruct-v1:0',
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

# Run the embedding process
upsert_embedding()
print("Embedding data insertion complete!")

# Create vector store
vectorstore = MongoDBAtlasVectorSearch(
    collection, 
    embedding_model,
    index_name="Foods_index",
    text_key="product_name",
    embedding_key="embedding"
)

# Set up prompt template
prompt_template = """ 
You are a grocery store assistant. Users ask about products that we have and relevant details about the product.
Please generate answers based on the context only and do not use any general knowledge.
Based on the context, answer below. Answer should be less than 3 sentences.
1. The Item name and other items that go with the specified item
2. The Item count.
Context: {context}
Question: {question}
Answer:"""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

# Set up the LLM
llm = ChatBedrock(model_id="meta.llama3-3-70b-instruct-v1:0	")

# Create the QA chain
qa = RetrievalQA.from_chain_type(
    llm=llm,  
    chain_type="stuff",
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 1}
    ),
    chain_type_kwargs={"prompt": PROMPT},
    return_source_documents=True
)

def get_response(input_text):
    """Get response from the QA chain"""
    try:
        temp_res = qa.invoke({"query": input_text})
        if 'source_documents' in temp_res and len(temp_res['source_documents']) > 0:
            # Extract product details
            doc = temp_res['source_documents'][0]
            product_name = doc.page_content
            product_details = f"Product: {product_name}"
            if hasattr(doc, 'metadata'):
                if 'quantity' in doc.metadata:
                    product_details += f", Quantity: {doc.metadata['quantity']}"
                if 'category' in doc.metadata:
                    product_details += f", Category: {doc.metadata['category']}"
        else:
            product_details = "No matching products found"
            
        response = temp_res['result']
        return product_details, response
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Error", f"An error occurred: {str(e)}"

# Streamlit UI
st.markdown("<h1 style='text-align: center;'>MongoDB Atlas Vector Search</h1>", unsafe_allow_html=True)
st.markdown("<h1 style='text-align: center;'>Demo Webpage 🍃</h1>", unsafe_allow_html=True)
st.markdown("<br><br>", unsafe_allow_html=True)

input_text = st.text_area("Input text", label_visibility="collapsed")
go_button = st.button("Go", type="primary")

if go_button:
    product_details, response = get_response(input_text)
    st.write(product_details)
    st.write(response)