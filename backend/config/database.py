import os
import logging
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

logger = logging.getLogger("code_therapist")

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = None
db = None
sessions_collection = None

if not MONGO_URI:
    logger.warning("MONGO_URI env variable is missing! MongoDB connection not initialized.")
else:
    try:
        # Create a MongoClient using certifi certs
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        # Send a ping to confirm a successful connection
        client.admin.command('ping')
        logger.info("MongoDB connection established successfully.")
        db = client["code_therapist"]
        sessions_collection = db["sessions"]
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")

