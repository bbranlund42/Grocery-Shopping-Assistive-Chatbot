import config
from pymongo import MongoClient

def main():
    client = MongoClient(config.URI)
    db = client['sample_mflix']
    collection = db['movies']

if __name__ == "main":
    main()