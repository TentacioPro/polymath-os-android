from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import hashlib
import json
import io
from openai import AsyncOpenAI
import csv
from openpyxl import Workbook
from pptx import Presentation
from pptx.util import Inches, Pt
from PyPDF2 import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import tempfile
import sentry_sdk

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ── Sentry Error Tracking ────────────────────────────────
# Set SENTRY_DSN in your .env to enable. Free tier: 10k events/month.
# Get your DSN at https://sentry.io → Projects → Python → FastAPI
_sentry_dsn = os.environ.get('SENTRY_DSN', '')
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        traces_sample_rate=0.2,       # 20% of requests get performance traces
        profiles_sample_rate=0.1,     # 10% profiling
        environment=os.environ.get('SENTRY_ENV', 'development'),
        release=os.environ.get('SENTRY_RELEASE', 'polymath-backend@0.1.0'),
        send_default_pii=False,       # Don't send user PII
    )

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize LLM (OpenAI direct — no proxy)
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

def _strip_json_fences(text: str) -> str:
    """Strip markdown code fences from LLM responses so json.loads works."""
    t = text.strip()
    if t.startswith("```json"):
        t = t[7:]
    elif t.startswith("```"):
        t = t[3:]
    if t.endswith("```"):
        t = t[:-3]
    return t.strip()

async def ai_chat(system_message: str, user_prompt: str, model: str = "gpt-4o-mini") -> str:
    """Send a chat completion request to OpenAI directly."""
    completion = await openai_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_prompt},
        ],
    )
    return completion.choices[0].message.content or ""

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: Optional[str] = None
    source: str  # manual, youtube, google, upload
    category: Optional[str] = None
    content_type: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime
    raw_data: Optional[Dict[str, Any]] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    hash: str

class ActivityCreate(BaseModel):
    title: str
    url: Optional[str] = None
    source: str
    notes: Optional[str] = None
    timestamp: Optional[datetime] = None

class Journal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    tags: List[str] = []
    linked_activities: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class JournalCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    linked_activities: List[str] = []

class Connection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_id: str
    to_id: str
    connection_type: str
    ai_reasoning: str
    strength: float = 0.5
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AIConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    provider: str
    model: str
    api_key: str
    is_active: bool = True

class AIConfigCreate(BaseModel):
    provider: str
    model: str
    api_key: str

class ExportRequest(BaseModel):
    format: str  # json, markdown, csv, pdf, ppt
    include_journals: bool = True
    include_activities: bool = True
    include_connections: bool = True

class ImportRequest(BaseModel):
    data: Dict[str, Any]

class AgentMemory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memory_type: str  # short_term, long_term, insight, pattern
    content: str
    source: str  # activity, journal, interaction, learning
    metadata: Dict[str, Any] = {}
    importance: float = 0.5  # 0.0-1.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    access_count: int = 0

class AgentPersona(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Learning Assistant"
    role: str = "Polymath Guide"
    focus_areas: List[str] = []
    learning_style_preferences: Dict[str, Any] = {}
    behavior_traits: List[str] = []
    custom_instructions: str = ""
    is_active: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class LearningLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    learned_at: datetime = Field(default_factory=datetime.utcnow)
    insight: str
    source_data: Dict[str, Any] = {}
    applied_to: List[str] = []  # Where this learning was applied

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    focus_areas: Optional[List[str]] = None
    learning_style_preferences: Optional[Dict[str, Any]] = None
    behavior_traits: Optional[List[str]] = None
    custom_instructions: Optional[str] = None

# ============= HELPER FUNCTIONS =============

def generate_hash(title: str, url: Optional[str], timestamp: datetime) -> str:
    """Generate unique hash for deduplication"""
    content = f"{title}_{url}_{timestamp.isoformat()}"
    return hashlib.sha256(content.encode()).hexdigest()

async def check_duplicate(hash: str) -> bool:
    """Check if activity already exists"""
    existing = await db.activities.find_one({"hash": hash})
    return existing is not None

async def analyze_content_with_ai(title: str, url: Optional[str] = None) -> Dict[str, Any]:
    """Analyze content using AI"""
    try:
        prompt = f"""Analyze this content and categorize it:
Title: {title}
URL: {url or 'N/A'}

Respond with ONLY this JSON structure (no other text):
{{
  "category": "AI" or "News" or "Tools" or "Market" or "Research" or "Tutorial" or "Other",
  "content_type": "Video" or "Article" or "Blog" or "Course" or "Documentation",
  "key_topics": ["topic1", "topic2"],
  "domain": "Technology" or "Science" or "Business" or "Arts",
  "learning_value": 1-10
}}"""
        
        response = await ai_chat(
            system_message="You are an expert content analyzer. Always respond with valid JSON only.",
            user_prompt=prompt
        )
        
        # Parse AI response
        try:
            analysis = json.loads(_strip_json_fences(response))
        except:
            analysis = {
                "category": "Other",
                "content_type": "Unknown",
                "key_topics": [title[:50]],
                "domain": "Technology",
                "learning_value": 5
            }
        
        return analysis
    except Exception as e:
        logging.error(f"AI analysis failed: {e}")
        return {
            "category": "Other",
            "content_type": "Unknown",
            "error": str(e)
        }

async def generate_connections(activity_id: str) -> List[Connection]:
    """Generate AI-powered connections between activities"""
    try:
        # Get the activity
        activity = await db.activities.find_one({"id": activity_id})
        if not activity:
            return []
        
        # Get other activities
        other_activities = await db.activities.find({"id": {"$ne": activity_id}}).to_list(50)
        
        if not other_activities:
            return []
        
        # Use AI to find connections
        prompt = f"""Find connections between this activity and others:

Main Activity:
Title: {activity['title']}
Category: {activity.get('category', 'Unknown')}

Other Activities:
{chr(10).join([f"- ID: {a.get('id', '')} | {a.get('title', '')} ({a.get('category', 'Unknown')})" for a in other_activities[:10]])}

Identify up to 3 strongest connections. Respond with ONLY this JSON array (no other text):
[{{"to_id": "exact_id_from_above", "type": "related_concept", "reasoning": "why they connect", "strength": 0.8}}]"""
        
        response = await ai_chat(
            system_message="You are an expert at finding knowledge connections. Always respond with valid JSON only.",
            user_prompt=prompt
        )
        
        try:
            connections_data = json.loads(_strip_json_fences(response))
            connections = []
            for conn in connections_data:
                connection = Connection(
                    from_id=activity_id,
                    to_id=conn["to_id"],
                    connection_type=conn["type"],
                    ai_reasoning=conn["reasoning"],
                    strength=conn.get("strength", 0.5)
                )
                connections.append(connection)
            return connections
        except:
            return []
    except Exception as e:
        logging.error(f"Connection generation failed: {e}")
        return []

def parse_youtube_history(file_content: str) -> List[Dict[str, Any]]:
    """Parse YouTube watch history JSON"""
    try:
        data = json.loads(file_content)
        activities = []
        for item in data:
            if isinstance(item, dict):
                activities.append({
                    "title": item.get("title", item.get("titleUrl", "Unknown")),
                    "url": item.get("titleUrl", ""),
                    "timestamp": item.get("time", datetime.utcnow().isoformat()),
                    "source": "youtube"
                })
        return activities
    except:
        return []

def parse_google_history(file_content: str) -> List[Dict[str, Any]]:
    """Parse Google search history"""
    try:
        data = json.loads(file_content)
        activities = []
        for item in data:
            if isinstance(item, dict):
                activities.append({
                    "title": item.get("title", item.get("query", "Unknown")),
                    "url": item.get("url", ""),
                    "timestamp": item.get("time", datetime.utcnow().isoformat()),
                    "source": "google"
                })
        return activities
    except:
        return []


# ============= AGENT MEMORY SYSTEM =============

async def extract_insights_from_activities() -> List[str]:
    """Extract learning patterns and insights from activities"""
    try:
        activities = await db.activities.find().sort("timestamp", -1).limit(50).to_list(50)
        
        if len(activities) < 5:
            return []
        
        # Analyze patterns
        categories = {}
        domains = {}
        for activity in activities:
            cat = activity.get("category", "Other")
            categories[cat] = categories.get(cat, 0) + 1
            
            if activity.get("ai_analysis"):
                domain = activity["ai_analysis"].get("domain", "Unknown")
                domains[domain] = domains.get(domain, 0) + 1
        
        prompt = f"""Analyze this learning data and extract 3-5 key insights:

Total activities: {len(activities)}
Recent titles: {[a.get('title', '')[:50] for a in activities[:10]]}
Category distribution: {categories}
Domain distribution: {domains}

Respond with ONLY JSON array:
[{{"insight": "pattern or trend discovered", "importance": 0.8}}]"""
        
        response = await ai_chat(
            system_message="You are a learning analyst. Extract insights from patterns. Respond with JSON only.",
            user_prompt=prompt
        )
        
        insights = json.loads(_strip_json_fences(response))
        return insights
    except Exception as e:
        logging.error(f"Insight extraction failed: {e}")
        return []

async def learn_from_interaction(interaction_type: str, data: Dict[str, Any]):
    """Learn from user interactions and store in memory"""
    try:
        prompt = f"""From this user interaction, what should I learn about their learning style?

Interaction: {interaction_type}
Data: {json.dumps(data, indent=2)[:500]}

Respond with ONLY JSON:
{{"learned": "what you learned", "application": "how to use this knowledge", "importance": 0.7}}"""
        
        response = await ai_chat(
            system_message="You are a learning assistant. Extract what you learned from this interaction.",
            user_prompt=prompt
        )
        
        learned = json.loads(_strip_json_fences(response))
        
        # Store as learning log
        log = LearningLog(
            insight=learned.get("learned", ""),
            source_data={"type": interaction_type, "data": data}
        )
        await db.learning_logs.insert_one(log.dict())
        
        # Store as long-term memory
        memory = AgentMemory(
            memory_type="insight",
            content=learned.get("learned", ""),
            source="interaction",
            metadata={"application": learned.get("application", "")},
            importance=learned.get("importance", 0.5)
        )
        await db.agent_memory.insert_one(memory.dict())
        
        return learned
    except Exception as e:
        logging.error(f"Learning from interaction failed: {e}")
        return None

async def get_relevant_memories(context: str, limit: int = 5) -> List[AgentMemory]:
    """Retrieve relevant memories based on context"""
    try:
        # Get recent and important memories
        memories = await db.agent_memory.find().sort([
            ("importance", -1),
            ("last_accessed", -1)
        ]).limit(limit * 2).to_list(limit * 2)
        
        if not memories or len(memories) == 0:
            return []
        
        # Use AI to rank relevance
        prompt = f"""Rank these memories by relevance to context: "{context}"

Memories:
{chr(10).join([f"- ID: {m.get('id')} | {m.get('content', '')[:100]}" for m in memories[:10]])}

Respond with ONLY JSON array of top {limit} relevant memory IDs:
[{{"id": "memory_id", "relevance": 0.9}}]"""
        
        response = await ai_chat(
            system_message="You rank memory relevance. Respond with JSON only.",
            user_prompt=prompt
        )
        
        ranked = json.loads(_strip_json_fences(response))
        if not isinstance(ranked, list):
            return []
        relevant_ids = [r["id"] for r in ranked[:limit] if isinstance(r, dict) and "id" in r]
        
        # Update access stats
        for mem_id in relevant_ids:
            await db.agent_memory.update_one(
                {"id": mem_id},
                {
                    "$set": {"last_accessed": datetime.utcnow()},
                    "$inc": {"access_count": 1}
                }
            )
        
        # Return memories
        relevant_memories = [m for m in memories if m.get("id") in relevant_ids]
        return [AgentMemory(**m) for m in relevant_memories]
    except Exception as e:
        logging.error(f"Memory retrieval failed: {e}")
        return []

async def consolidate_memories():
    """Consolidate short-term memories into long-term insights"""
    try:
        # Get recent short-term memories
        short_term = await db.agent_memory.find({"memory_type": "short_term"}).sort("timestamp", -1).limit(20).to_list(20)
        
        if len(short_term) < 5:
            return {"consolidated": 0}
        
        prompt = f"""Consolidate these short-term memories into 2-3 long-term insights:

Memories:
{chr(10).join([m.get('content', '')[:100] for m in short_term])}

Respond with ONLY JSON:
[{{"insight": "consolidated insight", "importance": 0.8, "sources": ["id1", "id2"]}}]"""
        
        response = await ai_chat(
            system_message="You consolidate memories into long-term insights. Respond with JSON only.",
            user_prompt=prompt
        )
        
        insights = json.loads(_strip_json_fences(response))
        
        consolidated_count = 0
        for insight_data in insights:
            memory = AgentMemory(
                memory_type="long_term",
                content=insight_data["insight"],
                source="consolidation",
                metadata={"source_memories": insight_data.get("sources", [])},
                importance=insight_data.get("importance", 0.7)
            )
            await db.agent_memory.insert_one(memory.dict())
            consolidated_count += 1
        
        # Archive old short-term memories
        for mem in short_term:
            await db.agent_memory.update_one(
                {"id": mem["id"]},
                {"$set": {"memory_type": "archived"}}
            )
        
        return {"consolidated": consolidated_count, "archived": len(short_term)}
    except Exception as e:
        logging.error(f"Memory consolidation failed: {e}")
        return {"consolidated": 0, "error": str(e)}

# ============= API ENDPOINTS =============

@api_router.get("/health")
async def health_check():
    """System health check endpoint"""
    try:
        # Check MongoDB connection
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    ai_status = "configured" if OPENAI_API_KEY else "not_configured"
    
    return {
        "status": "operational" if db_status == "connected" else "degraded",
        "database": db_status,
        "ai": ai_status,
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.get("/")
async def root():
    return {"message": "Polymath OS API"}

# ACTIVITIES
@api_router.post("/activities/manual", response_model=Activity)
async def create_manual_activity(input: ActivityCreate):
    """Create a manual activity entry"""
    timestamp = input.timestamp or datetime.utcnow()
    hash_val = generate_hash(input.title, input.url, timestamp)
    
    # Check for duplicates
    if await check_duplicate(hash_val):
        raise HTTPException(status_code=400, detail="Duplicate activity detected")
    
    # Analyze with AI
    ai_analysis = await analyze_content_with_ai(input.title, input.url)
    
    activity = Activity(
        title=input.title,
        url=input.url,
        source=input.source,
        notes=input.notes,
        timestamp=timestamp,
        hash=hash_val,
        category=ai_analysis.get("category"),
        content_type=ai_analysis.get("content_type"),
        ai_analysis=ai_analysis
    )
    
    await db.activities.insert_one(activity.dict())
    return activity

@api_router.post("/activities/upload")
async def upload_activities(file: UploadFile = File(...)):
    """Upload and parse activity history files"""
    content = await file.read()
    file_content = content.decode('utf-8')
    
    # Try to parse as different formats
    activities_data = []
    if "youtube" in file.filename.lower() or "watch" in file.filename.lower():
        activities_data = parse_youtube_history(file_content)
    elif "google" in file.filename.lower() or "search" in file.filename.lower():
        activities_data = parse_google_history(file_content)
    else:
        # Try generic JSON parse
        try:
            data = json.loads(file_content)
            if isinstance(data, list):
                activities_data = data
        except:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    
    # Process and deduplicate
    created_count = 0
    duplicate_count = 0
    
    for item in activities_data:
        try:
            timestamp = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00")) if isinstance(item.get("timestamp"), str) else datetime.utcnow()
        except:
            timestamp = datetime.utcnow()
        
        hash_val = generate_hash(item["title"], item.get("url"), timestamp)
        
        if await check_duplicate(hash_val):
            duplicate_count += 1
            continue
        
        ai_analysis = await analyze_content_with_ai(item["title"], item.get("url"))
        
        activity = Activity(
            title=item["title"],
            url=item.get("url"),
            source=item.get("source", "upload"),
            timestamp=timestamp,
            hash=hash_val,
            category=ai_analysis.get("category"),
            content_type=ai_analysis.get("content_type"),
            ai_analysis=ai_analysis,
            raw_data=item
        )
        
        await db.activities.insert_one(activity.dict())
        created_count += 1
    
    return {
        "created": created_count,
        "duplicates_skipped": duplicate_count,
        "total_processed": len(activities_data)
    }

@api_router.get("/activities", response_model=List[Activity])
async def get_activities(skip: int = 0, limit: int = 100, category: Optional[str] = None):
    """Get all activities with optional filtering"""
    query = {}
    if category:
        query["category"] = category
    
    activities = await db.activities.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    return [Activity(**activity) for activity in activities]

@api_router.get("/activities/{activity_id}")
async def get_activity_detail(activity_id: str):
    """Get a single activity by ID with full details"""
    activity = await db.activities.find_one({"id": activity_id})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if "_id" in activity:
        del activity["_id"]
    # Also fetch related connections
    connections = await db.connections.find({
        "$or": [{"from_id": activity_id}, {"to_id": activity_id}]
    }).to_list(50)
    for c in connections:
        if "_id" in c:
            del c["_id"]
    activity["related_connections"] = connections
    return activity

@api_router.get("/search")
async def search_all(q: str, limit: int = 30):
    """Full-text search across activities, journals, and connections"""
    if not q or len(q) < 2:
        return {"activities": [], "journals": [], "connections": []}
    
    regex_pattern = {"$regex": q, "$options": "i"}
    
    # Search activities
    act_query = {"$or": [
        {"title": regex_pattern},
        {"notes": regex_pattern},
        {"category": regex_pattern},
        {"content_type": regex_pattern},
    ]}
    activities = await db.activities.find(act_query).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Search journals
    jrnl_query = {"$or": [
        {"title": regex_pattern},
        {"content": regex_pattern},
        {"tags": regex_pattern},
    ]}
    journals = await db.journals.find(jrnl_query).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Search connections
    conn_query = {"$or": [
        {"ai_reasoning": regex_pattern},
        {"connection_type": regex_pattern},
    ]}
    connections = await db.connections.find(conn_query).limit(limit).to_list(limit)
    
    def clean(doc):
        if doc and "_id" in doc:
            del doc["_id"]
        return doc
    
    return {
        "activities": [clean(a) for a in activities],
        "journals": [clean(j) for j in journals],
        "connections": [clean(c) for c in connections],
        "total": len(activities) + len(journals) + len(connections),
    }

@api_router.get("/notifications")
async def get_notifications(limit: int = 20):
    """Get system notifications based on recent activity"""
    notifications = []
    
    # Recent connections discovered
    recent_connections = await db.connections.find().sort("timestamp", -1).limit(5).to_list(5)
    for conn in recent_connections:
        if "_id" in conn:
            del conn["_id"]
        notifications.append({
            "id": conn.get("id", str(uuid.uuid4())),
            "title": "Connection discovered",
            "desc": conn.get("ai_reasoning", "New semantic link found")[:80],
            "type": "info",
            "timestamp": conn.get("timestamp", datetime.utcnow()).isoformat() if isinstance(conn.get("timestamp"), datetime) else str(conn.get("timestamp", "")),
        })
    
    # Recent learning logs
    recent_logs = await db.learning_logs.find().sort("learned_at", -1).limit(3).to_list(3)
    for log in recent_logs:
        if "_id" in log:
            del log["_id"]
        notifications.append({
            "id": log.get("id", str(uuid.uuid4())),
            "title": "Learning event",
            "desc": log.get("insight", "Agent learned something new")[:80],
            "type": "success",
            "timestamp": log.get("learned_at", datetime.utcnow()).isoformat() if isinstance(log.get("learned_at"), datetime) else str(log.get("learned_at", "")),
        })
    
    # Check data health
    total_activities = await db.activities.count_documents({})
    total_connections = await db.connections.count_documents({})
    if total_activities > 0 and total_connections == 0:
        notifications.append({
            "id": "no-connections-hint",
            "title": "No connections yet",
            "desc": f"You have {total_activities} activities. Generate connections from the Neural Mesh screen.",
            "type": "warning",
            "timestamp": datetime.utcnow().isoformat(),
        })
    
    # Sort by timestamp descending
    notifications.sort(key=lambda n: n.get("timestamp", ""), reverse=True)
    return notifications[:limit]

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str):
    """Delete an activity"""
    result = await db.activities.delete_one({"id": activity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted"}

# JOURNALS
@api_router.post("/journals", response_model=Journal)
async def create_journal(input: JournalCreate):
    """Create a journal entry"""
    journal = Journal(
        title=input.title,
        content=input.content,
        tags=input.tags,
        linked_activities=input.linked_activities
    )
    await db.journals.insert_one(journal.dict())
    return journal

@api_router.get("/journals", response_model=List[Journal])
async def get_journals(skip: int = 0, limit: int = 100):
    """Get all journal entries"""
    journals = await db.journals.find().sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    return [Journal(**journal) for journal in journals]

@api_router.put("/journals/{journal_id}", response_model=Journal)
async def update_journal(journal_id: str, input: JournalCreate):
    """Update a journal entry"""
    result = await db.journals.find_one({"id": journal_id})
    if not result:
        raise HTTPException(status_code=404, detail="Journal not found")
    
    await db.journals.update_one(
        {"id": journal_id},
        {"$set": {
            "title": input.title,
            "content": input.content,
            "tags": input.tags,
            "linked_activities": input.linked_activities
        }}
    )
    
    updated = await db.journals.find_one({"id": journal_id})
    return Journal(**updated)

@api_router.delete("/journals/{journal_id}")
async def delete_journal(journal_id: str):
    """Delete a journal entry"""
    result = await db.journals.delete_one({"id": journal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal not found")
    return {"message": "Journal deleted"}

# AI OPERATIONS
@api_router.post("/ai/analyze/{activity_id}")
async def analyze_activity(activity_id: str):
    """Analyze a specific activity with AI"""
    activity = await db.activities.find_one({"id": activity_id})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    analysis = await analyze_content_with_ai(activity["title"], activity.get("url"))
    
    await db.activities.update_one(
        {"id": activity_id},
        {"$set": {
            "ai_analysis": analysis,
            "category": analysis.get("category"),
            "content_type": analysis.get("content_type")
        }}
    )
    
    return analysis

@api_router.post("/ai/generate-connections/{activity_id}")
async def create_connections(activity_id: str):
    """Generate AI-powered connections for an activity"""
    connections = await generate_connections(activity_id)
    
    for connection in connections:
        await db.connections.insert_one(connection.dict())
    
    return {"connections_created": len(connections), "connections": [c.dict() for c in connections]}

@api_router.get("/connections")
async def get_all_connections():
    """Get all connections"""
    connections = await db.connections.find().to_list(1000)
    return connections

@api_router.get("/ai/suggestions")
async def get_ai_suggestions():
    """Get AI-generated learning suggestions based on activity history"""
    activities = await db.activities.find().sort("timestamp", -1).limit(20).to_list(20)
    
    if not activities:
        return {"suggestions": []}
    
    categories = {}
    for activity in activities:
        cat = activity.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1
    
    try:
        prompt = f"""Based on this learning history, provide 5 actionable suggestions for next topics to explore:

Recent activities:
{chr(10).join([f"- {a.get('title', '')} ({a.get('category', 'Unknown')})" for a in activities[:10]])}

Category distribution: {categories}

Provide suggestions that connect domains, fill gaps, explore emerging topics, deepen understanding.

Respond with ONLY this JSON array (no other text):
[{{"suggestion": "text", "reasoning": "why", "priority": 5}}]"""
        
        response = await ai_chat(
            system_message="You are a learning advisor. Always respond with valid JSON only.",
            user_prompt=prompt
        )
        suggestions = json.loads(_strip_json_fences(response))
        return {"suggestions": suggestions}
    except Exception as e:
        logging.error(f"Suggestions generation failed: {e}")
        return {"suggestions": [], "error": str(e)}

# AI CONFIG
@api_router.post("/ai-config", response_model=AIConfig)
async def create_ai_config(input: AIConfigCreate):
    """Configure AI provider"""
    # Deactivate existing configs
    await db.ai_config.update_many({}, {"$set": {"is_active": False}})
    
    config = AIConfig(
        provider=input.provider,
        model=input.model,
        api_key=input.api_key
    )
    await db.ai_config.insert_one(config.dict())
    return config

@api_router.get("/ai-config")
async def get_ai_config():
    """Get active AI configuration"""
    config = await db.ai_config.find_one({"is_active": True})
    if config:
        # Don't expose full API key
        config["api_key"] = config["api_key"][:10] + "..."
    return config or {"provider": "openai", "model": "gpt-4o-mini", "api_key": "sk-emerge..."}

# EXPORT/IMPORT
@api_router.post("/export/json")
async def export_json():
    """Export all data as JSON"""
    activities = await db.activities.find().to_list(10000)
    journals = await db.journals.find().to_list(10000)
    connections = await db.connections.find().to_list(10000)
    
    # Remove MongoDB ObjectId fields to avoid serialization issues
    def clean_document(doc):
        if doc and "_id" in doc:
            del doc["_id"]
        return doc
    
    activities = [clean_document(doc) for doc in activities]
    journals = [clean_document(doc) for doc in journals]
    connections = [clean_document(doc) for doc in connections]
    
    export_data = {
        "export_date": datetime.utcnow().isoformat(),
        "version": "1.0",
        "activities": activities,
        "journals": journals,
        "connections": connections
    }
    
    return export_data

@api_router.post("/export/markdown")
async def export_markdown():
    """Export data as Markdown"""
    activities = await db.activities.find().sort("timestamp", -1).to_list(10000)
    journals = await db.journals.find().sort("timestamp", -1).to_list(10000)
    
    md_content = "# Polymath OS Export\n\n"
    md_content += f"Export Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    md_content += "---\n\n"
    
    md_content += "## Learning Activities\n\n"
    for activity in activities:
        md_content += f"### {activity.get('title', 'Untitled')}\n\n"
        md_content += f"- **Category**: {activity.get('category', 'Unknown')}\n"
        md_content += f"- **Source**: {activity.get('source', 'Unknown')}\n"
        md_content += f"- **Date**: {activity.get('timestamp', datetime.utcnow()).strftime('%Y-%m-%d')}\n"
        if activity.get('url'):
            md_content += f"- **URL**: {activity.get('url')}\n"
        if activity.get('notes'):
            md_content += f"- **Notes**: {activity.get('notes')}\n"
        md_content += "\n"
    
    md_content += "\n---\n\n## Journal Entries\n\n"
    for journal in journals:
        md_content += f"### {journal.get('title', 'Untitled')}\n\n"
        md_content += f"{journal.get('content', '')}\n\n"
        if journal.get('tags'):
            md_content += f"**Tags**: {', '.join(journal.get('tags', []))}\n\n"
        md_content += f"*{journal.get('timestamp', datetime.utcnow()).strftime('%Y-%m-%d %H:%M:%S')}*\n\n"
        md_content += "---\n\n"
    
    return {"content": md_content, "filename": f"polymath_export_{datetime.utcnow().strftime('%Y%m%d')}.md"}

@api_router.post("/export/csv")
async def export_csv():
    """Export activities as CSV"""
    activities = await db.activities.find().sort("timestamp", -1).to_list(10000)
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=['title', 'category', 'source', 'url', 'timestamp', 'notes'])
    writer.writeheader()
    
    for activity in activities:
        writer.writerow({
            'title': activity.get('title', ''),
            'category': activity.get('category', ''),
            'source': activity.get('source', ''),
            'url': activity.get('url', ''),
            'timestamp': activity.get('timestamp', datetime.utcnow()).isoformat(),
            'notes': activity.get('notes', '')
        })
    
    return {"content": output.getvalue(), "filename": f"polymath_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"}

@api_router.post("/import/restore", response_model=Dict[str, int])
async def import_restore(data: Dict[str, Any]):
    """Restore app state from exported data"""
    try:
        activities_count = 0
        journals_count = 0
        connections_count = 0
        
        # Import activities
        if "activities" in data:
            for activity in data["activities"]:
                hash_val = activity.get("hash")
                if hash_val and not await check_duplicate(hash_val):
                    await db.activities.insert_one(activity)
                    activities_count += 1
        
        # Import journals
        if "journals" in data:
            for journal in data["journals"]:
                # Check if journal already exists by id
                existing = await db.journals.find_one({"id": journal.get("id")})
                if not existing:
                    await db.journals.insert_one(journal)
                    journals_count += 1
        
        # Import connections
        if "connections" in data:
            for connection in data["connections"]:
                existing = await db.connections.find_one({"id": connection.get("id")})
                if not existing:
                    await db.connections.insert_one(connection)
                    connections_count += 1
        
        return {
            "activities_imported": activities_count,
            "journals_imported": journals_count,
            "connections_imported": connections_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

# STATISTICS
@api_router.get("/stats")
async def get_statistics():
    """Get learning statistics"""
    total_activities = await db.activities.count_documents({})
    total_journals = await db.journals.count_documents({})
    total_connections = await db.connections.count_documents({})
    
    # Category distribution
    activities = await db.activities.find().to_list(10000)
    categories = {}
    sources = {}
    
    for activity in activities:
        cat = activity.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1
        
        src = activity.get("source", "Unknown")
        sources[src] = sources.get(src, 0) + 1
    
    return {
        "total_activities": total_activities,
        "total_journals": total_journals,
        "total_connections": total_connections,
        "categories": categories,
        "sources": sources
    }


# AGENT MEMORY & PERSONA
@api_router.get("/agent/memory")
async def get_agent_memories(memory_type: Optional[str] = None, limit: int = 50):
    """Get agent memories"""
    query = {}
    if memory_type:
        query["memory_type"] = memory_type
    
    memories = await db.agent_memory.find(query).sort([("importance", -1), ("timestamp", -1)]).limit(limit).to_list(limit)
    
    # Remove MongoDB ObjectId fields to avoid serialization issues
    def clean_document(doc):
        if doc and "_id" in doc:
            del doc["_id"]
        return doc
    
    memories = [clean_document(doc) for doc in memories]
    return memories

@api_router.post("/agent/memory", response_model=AgentMemory)
async def create_agent_memory(memory_type: str, content: str, source: str, importance: float = 0.5):
    """Manually create agent memory"""
    memory = AgentMemory(
        memory_type=memory_type,
        content=content,
        source=source,
        importance=importance
    )
    await db.agent_memory.insert_one(memory.dict())
    return memory

@api_router.put("/agent/memory/{memory_id}")
async def update_agent_memory(memory_id: str, content: str, importance: Optional[float] = None):
    """Update agent memory"""
    update_data = {"content": content}
    if importance is not None:
        update_data["importance"] = importance
    
    result = await db.agent_memory.update_one(
        {"id": memory_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    updated = await db.agent_memory.find_one({"id": memory_id})
    return updated

@api_router.delete("/agent/memory/{memory_id}")
async def delete_agent_memory(memory_id: str):
    """Delete agent memory"""
    result = await db.agent_memory.delete_one({"id": memory_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"message": "Memory deleted"}

@api_router.post("/agent/learn")
async def trigger_learning():
    """Trigger agent to learn from current data"""
    try:
        # Extract insights from activities
        insights = await extract_insights_from_activities()
        
        # Store as memories
        memories_created = 0
        for insight_data in insights:
            memory = AgentMemory(
                memory_type="insight",
                content=insight_data["insight"],
                source="learning",
                importance=insight_data.get("importance", 0.7)
            )
            await db.agent_memory.insert_one(memory.dict())
            memories_created += 1
        
        # Learn from recent journals
        recent_journals = await db.journals.find().sort("timestamp", -1).limit(10).to_list(10)
        for journal in recent_journals:
            await learn_from_interaction("journal_entry", {
                "title": journal.get("title"),
                "content": journal.get("content", "")[:200],
                "tags": journal.get("tags", [])
            })
        
        return {
            "insights_extracted": len(insights),
            "memories_created": memories_created,
            "journals_processed": len(recent_journals)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning failed: {str(e)}")

@api_router.post("/agent/consolidate")
async def trigger_memory_consolidation():
    """Consolidate short-term memories into long-term insights"""
    result = await consolidate_memories()
    return result

@api_router.get("/agent/persona")
async def get_agent_persona():
    """Get active agent persona"""
    persona = await db.agent_persona.find_one({"is_active": True})
    if not persona:
        # Create default persona
        default_persona = AgentPersona(
            name="Learning Assistant",
            role="Polymath Guide",
            focus_areas=["Technology", "AI", "Learning Optimization"],
            behavior_traits=["Curious", "Analytical", "Supportive"],
            custom_instructions="Help the user track and optimize their learning journey across domains."
        )
        await db.agent_persona.insert_one(default_persona.dict())
        return default_persona.dict()
    
    # Remove MongoDB ObjectId fields to avoid serialization issues
    if "_id" in persona:
        del persona["_id"]
    return persona

@api_router.put("/agent/persona")
async def update_agent_persona(update: PersonaUpdate):
    """Update agent persona"""
    persona = await db.agent_persona.find_one({"is_active": True})
    
    if not persona:
        raise HTTPException(status_code=404, detail="No active persona found")
    
    update_data = {}
    if update.name:
        update_data["name"] = update.name
    if update.role:
        update_data["role"] = update.role
    if update.focus_areas:
        update_data["focus_areas"] = update.focus_areas
    if update.learning_style_preferences:
        update_data["learning_style_preferences"] = update.learning_style_preferences
    if update.behavior_traits:
        update_data["behavior_traits"] = update.behavior_traits
    if update.custom_instructions:
        update_data["custom_instructions"] = update.custom_instructions
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.agent_persona.update_one(
        {"id": persona["id"]},
        {"$set": update_data}
    )
    
    updated = await db.agent_persona.find_one({"id": persona["id"]})
    
    # Remove MongoDB ObjectId fields to avoid serialization issues
    if updated and "_id" in updated:
        del updated["_id"]
    return updated

@api_router.get("/agent/learning-logs")
async def get_learning_logs(limit: int = 50):
    """Get agent learning progression logs"""
    logs = await db.learning_logs.find().sort("learned_at", -1).limit(limit).to_list(limit)
    
    # Remove MongoDB ObjectId fields to avoid serialization issues
    def clean_document(doc):
        if doc and "_id" in doc:
            del doc["_id"]
        return doc
    
    logs = [clean_document(doc) for doc in logs]
    return logs

@api_router.get("/agent/chat")
async def chat_with_agent(message: str):
    """Chat with the learning assistant agent (with memory)"""
    try:
        # Get relevant memories
        relevant_memories = await get_relevant_memories(message, limit=5)
        
        # Get persona
        persona = await db.agent_persona.find_one({"is_active": True})
        if not persona:
            persona = {
                "name": "Learning Assistant",
                "role": "Polymath Guide",
                "custom_instructions": "Help track and optimize learning."
            }
        
        # Build context from memories
        memory_context = "\n".join([f"- {m.content}" for m in relevant_memories])
        
        # Create chat with memory-enhanced system message
        persona_name = persona.get('name', 'Learning Assistant')
        persona_role = persona.get('role', 'Polymath Guide')
        custom_inst = persona.get('custom_instructions', 'Help the user with their learning journey.')
        
        system_message = f"You are {persona_name}, a {persona_role}. Your memories: {memory_context}. Custom instructions: {custom_inst}. Respond naturally and helpfully."
        
        response = await ai_chat(
            system_message=system_message,
            user_prompt=message
        )
        
        # Store interaction as short-term memory
        interaction_memory = AgentMemory(
            memory_type="short_term",
            content=f"User asked: {message[:100]}... I responded about their learning.",
            source="chat",
            metadata={"user_message": message, "response": response[:200]},
            importance=0.6
        )
        await db.agent_memory.insert_one(interaction_memory.dict())
        
        # Learn from interaction
        await learn_from_interaction("chat", {"message": message, "response": response})
        
        return {
            "response": response,
            "memories_used": len(relevant_memories),
            "persona": persona.get("name")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@api_router.get("/agent/stats")
async def get_agent_stats():
    """Get agent memory statistics"""
    total_memories = await db.agent_memory.count_documents({})
    short_term = await db.agent_memory.count_documents({"memory_type": "short_term"})
    long_term = await db.agent_memory.count_documents({"memory_type": "long_term"})
    insights = await db.agent_memory.count_documents({"memory_type": "insight"})
    patterns = await db.agent_memory.count_documents({"memory_type": "pattern"})
    total_learning_logs = await db.learning_logs.count_documents({})
    
    # Get most accessed memories
    top_memories = await db.agent_memory.find().sort("access_count", -1).limit(5).to_list(5)
    
    return {
        "total_memories": total_memories,
        "breakdown": {
            "short_term": short_term,
            "long_term": long_term,
            "insights": insights,
            "patterns": patterns
        },
        "total_learning_events": total_learning_logs,
        "most_accessed_memories": [{"content": m.get("content", "")[:100], "access_count": m.get("access_count", 0)} for m in top_memories]
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
