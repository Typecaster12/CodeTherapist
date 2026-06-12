# MongoDB & PyMongo Documentation Reference

## Handling ObjectIds in Queries
In MongoDB, documents use an `_id` field of type `ObjectId` (a 12-byte binary identifier). When querying documents by ID using PyMongo, passing a raw string representation of the ID will not yield any matches. You must explicitly convert the string to a BSON `ObjectId` object:
```python
from bson import ObjectId
document = collection.find_one({"_id": ObjectId(string_id)})
```

## Document Serialization in PyMongo
MongoDB queries return BSON documents containing binary types like `ObjectId` and `datetime` objects. Standard JSON encoders (like Python's `json` module or FastAPI's default response encoder) do not know how to serialize these types. You must convert these properties into standard strings before returning responses:
```python
def serialize_doc(doc):
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    if "timestamp" in doc:
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc
```

## Safe MongoDB Connections and Fallbacks
If MongoDB is hosted remotely (e.g. MongoDB Atlas), connection failures can occur due to network issues, IP whitelisting restrictions, or DNS issues. Always wrap connection initializations in try-except blocks and provide a local fallback (like saving files to local JSON) to ensure high availability:
```python
try:
    client = MongoClient(URI)
    db = client.my_database
except Exception as e:
    # Set DB collection handles to None and use JSON fallback
    db_collection = None
```
