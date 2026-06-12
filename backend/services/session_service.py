import os
import json
import uuid
import logging
from datetime import datetime, timezone
from bson import ObjectId
from config.database import sessions_collection

logger = logging.getLogger("code_therapist")

# Define file path for fallback JSON storage
FALLBACK_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sessions.json"))

def ensure_fallback_dir():
    """
    Ensure the data folder and sessions.json file exist.
    """
    try:
        os.makedirs(os.path.dirname(FALLBACK_FILE), exist_ok=True)
        if not os.path.exists(FALLBACK_FILE):
            with open(FALLBACK_FILE, "w") as f:
                json.dump([], f)
    except Exception as e:
        logger.error(f"Error initializing fallback directory: {e}")

def save_session_to_json(doc: dict) -> str:
    """
    Saves a session record to a local JSON file as fallback.
    """
    try:
        ensure_fallback_dir()
        doc_copy = dict(doc)
        doc_copy["_id"] = str(uuid.uuid4())
        if isinstance(doc_copy["timestamp"], datetime):
            doc_copy["timestamp"] = doc_copy["timestamp"].isoformat()
        else:
            doc_copy["timestamp"] = str(doc_copy["timestamp"])
            
        with open(FALLBACK_FILE, "r+") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
            data.append(doc_copy)
            f.seek(0)
            json.dump(data, f, indent=2)
            f.truncate()
        logger.info(f"Saved session to local JSON fallback: {doc_copy['_id']}")
        return doc_copy["_id"]
    except Exception as e:
        logger.error(f"Failed to save session to JSON fallback: {e}")
        return "fallback-mock-id"

def get_all_sessions_from_json(limit: int = 50) -> list:
    """
    Reads sessions from the local JSON file.
    """
    try:
        ensure_fallback_dir()
        if not os.path.exists(FALLBACK_FILE):
            return []
        with open(FALLBACK_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
        data.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return data[:limit]
    except Exception as e:
        logger.error(f"Failed to read sessions from JSON fallback: {e}")
        return []

def get_learning_profile_from_json(sessions: list) -> dict:
    """
    Computes learning profile aggregations in-memory from a list of sessions.
    """
    if not sessions:
        return get_default_profile()
        
    try:
        total_sessions = len(sessions)
        total_time_stuck = sum(int(s.get("timeStuck", 0)) for s in sessions)
        avg_time_stuck = total_time_stuck / total_sessions
        
        # Category distribution
        cat_counts = {}
        for s in sessions:
            cat = s.get("diagnosedCategory") or "Unknown"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        category_distribution = [{"category": k, "count": v} for k, v in cat_counts.items()]
        category_distribution.sort(key=lambda x: x["count"], reverse=True)
        
        # Technology distribution
        tech_counts = {}
        for s in sessions:
            tech = s.get("technology") or "Unknown"
            tech_counts[tech] = tech_counts.get(tech, 0) + 1
        technology_distribution = [{"tech": k, "count": v} for k, v in tech_counts.items()]
        technology_distribution.sort(key=lambda x: x["count"], reverse=True)
        
        # Average time stuck per category
        cat_times = {}
        for s in sessions:
            cat = s.get("diagnosedCategory") or "Unknown"
            time = int(s.get("timeStuck", 0))
            if cat not in cat_times:
                cat_times[cat] = []
            cat_times[cat].append(time)
            
        avg_time_stuck_by_category = []
        for cat, times in cat_times.items():
            avg_time_stuck_by_category.append({
                "category": cat,
                "avgTimeStuck": round(sum(times) / len(times), 1)
            })
        avg_time_stuck_by_category.sort(key=lambda x: x["avgTimeStuck"], reverse=True)
        
        # Weekly trends
        weekly_counts = {}
        for s in sessions:
            ts_str = s.get("timestamp", "")
            try:
                # Handle ISO datetime parsing
                if ts_str.endswith("Z"):
                    ts_str = ts_str.replace("Z", "+00:00")
                dt = datetime.fromisoformat(ts_str)
                week_str = dt.strftime("%Y-W%U")
            except Exception:
                week_str = "Unknown"
            weekly_counts[week_str] = weekly_counts.get(week_str, 0) + 1
            
        weekly_trends = [{"week": k, "count": v} for k, v in weekly_counts.items()]
        weekly_trends.sort(key=lambda x: x["week"])
        
        top_blocker = category_distribution[0]["category"] if category_distribution else "None"
        problematic_tech = technology_distribution[0]["tech"] if technology_distribution else "None"

        insights = [
            f"Your most frequent struggle area is '{top_blocker}'. Pay close attention to your study concepts in this area.",
            f"You spend most of your stuck time troubleshooting issues in '{problematic_tech}'.",
            f"Your average time spent stuck is {round(avg_time_stuck, 1)} minutes. Aim to diagnose early to reduce this overhead."
        ]

        return {
            "totalSessions": total_sessions,
            "avgTimeStuck": round(avg_time_stuck, 1),
            "categoryDistribution": category_distribution,
            "technologyDistribution": technology_distribution,
            "averageTimeStuckByCategory": avg_time_stuck_by_category,
            "weeklyTrends": weekly_trends,
            "insights": insights
        }
    except Exception as e:
        logger.error(f"Error compiling in-memory learning profile: {e}", exc_info=True)
        return get_default_profile()


def serialize_doc(doc):
    """
    Helper function to serialize MongoDB BSON documents into JSON-compatible dicts.
    """
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "timestamp" in doc and isinstance(doc["timestamp"], datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc

def save_session(session_data: dict) -> str:
    """
    Saves a diagnostic session to MongoDB, or local JSON if MongoDB is unavailable.
    """
    # Build standard session document structure
    doc = {
        "userId": session_data.get("userId", "guest"),
        "error": session_data.get("error", ""),
        "code": session_data.get("code", ""),
        "goal": session_data.get("goal", ""),
        "technology": session_data.get("technology") or session_data.get("tech") or "",
        "emotion": session_data.get("emotion", ""),
        "timeStuck": int(session_data.get("timeStuck", 0)),
        "diagnosedCategory": session_data.get("diagnosedCategory") or session_data.get("category") or "",
        "confidence": float(session_data.get("confidence", 0.0)),
        "prescription": session_data.get("prescription") or {},
        "timestamp": datetime.now(timezone.utc)
    }

    if sessions_collection is None:
        logger.warning("MongoDB is unavailable. Storing session in local JSON.")
        return save_session_to_json(doc)
        
    try:
        result = sessions_collection.insert_one(doc)
        inserted_id = str(result.inserted_id)
        logger.info(f"Saved diagnosis session to MongoDB: {inserted_id}")
        return inserted_id
    except Exception as e:
        logger.error(f"MongoDB save failed: {e}. Falling back to local JSON.", exc_info=True)
        return save_session_to_json(doc)

def get_all_sessions(limit: int = 50) -> list:
    """
    Retrieves all historical sessions from MongoDB or local JSON.
    """
    if sessions_collection is None:
        logger.warning("MongoDB is unavailable. Fetching sessions from local JSON.")
        return get_all_sessions_from_json(limit)
        
    try:
        cursor = sessions_collection.find().sort("timestamp", -1).limit(limit)
        return [serialize_doc(doc) for doc in cursor]
    except Exception as e:
        logger.error(f"MongoDB fetch failed: {e}. Falling back to local JSON.", exc_info=True)
        return get_all_sessions_from_json(limit)

def get_learning_profile() -> dict:
    """
    Retrieves aggregated learning statistics from MongoDB or local JSON.
    """
    if sessions_collection is None:
        logger.warning("MongoDB is unavailable. Compiling learning profile from local JSON.")
        local_sessions = get_all_sessions_from_json(limit=1000)
        return get_learning_profile_from_json(local_sessions)
        
    try:
        # Check if we have any sessions at all
        total_sessions = sessions_collection.count_documents({})
        if total_sessions == 0:
            return get_default_profile()

        # Calculate average time stuck
        avg_pipeline = [
            {"$group": {"_id": None, "avgTime": {"$avg": "$timeStuck"}}}
        ]
        avg_res = list(sessions_collection.aggregate(avg_pipeline))
        avg_time_stuck = avg_res[0]["avgTime"] if avg_res else 0.0

        # Category distribution
        cat_pipeline = [
            {"$group": {"_id": "$diagnosedCategory", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        cat_res = list(sessions_collection.aggregate(cat_pipeline))
        category_distribution = [{"category": item["_id"] or "Unknown", "count": item["count"]} for item in cat_res]

        # Technology distribution
        tech_pipeline = [
            {"$group": {"_id": "$technology", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        tech_res = list(sessions_collection.aggregate(tech_pipeline))
        technology_distribution = [{"tech": item["_id"] or "Unknown", "count": item["count"]} for item in tech_res]

        # Average time stuck per category
        avg_by_cat_pipeline = [
            {"$group": {"_id": "$diagnosedCategory", "avgTimeStuck": {"$avg": "$timeStuck"}}},
            {"$sort": {"avgTimeStuck": -1}}
        ]
        avg_by_cat_res = list(sessions_collection.aggregate(avg_by_cat_pipeline))
        avg_time_stuck_by_category = [{"category": item["_id"] or "Unknown", "avgTimeStuck": round(item["avgTimeStuck"], 1)} for item in avg_by_cat_res]

        # Weekly trends
        weekly_pipeline = [
            {
                "$project": {
                    "week": {
                        "$dateToString": {
                            "format": "%Y-W%U", 
                            "date": "$timestamp"
                        }
                    }
                }
            },
            {"$group": {"_id": "$week", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        weekly_res = list(sessions_collection.aggregate(weekly_pipeline))
        weekly_trends = [{"week": item["_id"] or "Unknown", "count": item["count"]} for item in weekly_res]

        # Simple learning insights
        top_blocker = category_distribution[0]["category"] if category_distribution else "None"
        problematic_tech = technology_distribution[0]["tech"] if technology_distribution else "None"

        insights = [
            f"Your most frequent struggle area is '{top_blocker}'. Pay close attention to your study concepts in this area.",
            f"You spend most of your stuck time troubleshooting issues in '{problematic_tech}'.",
            f"Your average time spent stuck is {round(avg_time_stuck, 1)} minutes. Aim to diagnose early to reduce this overhead."
        ]

        return {
            "totalSessions": total_sessions,
            "avgTimeStuck": round(avg_time_stuck, 1),
            "categoryDistribution": category_distribution,
            "technologyDistribution": technology_distribution,
            "averageTimeStuckByCategory": avg_time_stuck_by_category,
            "weeklyTrends": weekly_trends,
            "insights": insights
        }
    except Exception as e:
        logger.error(f"MongoDB aggregation failed: {e}. Falling back to local JSON compilation.", exc_info=True)
        local_sessions = get_all_sessions_from_json(limit=1000)
        return get_learning_profile_from_json(local_sessions)

def get_default_profile() -> dict:
    return {
        "totalSessions": 0,
        "avgTimeStuck": 0.0,
        "categoryDistribution": [],
        "technologyDistribution": [],
        "averageTimeStuckByCategory": [],
        "weeklyTrends": [],
        "insights": ["No diagnosis sessions recorded yet. Complete a diagnosis to view your learning insights."]
    }
