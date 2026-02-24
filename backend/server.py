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
from emergentintegrations.llm import LLMClient
import csv
from openpyxl import Workbook
from pptx import Presentation
from pptx.util import Inches, Pt
from PyPDF2 import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import tempfile

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize LLM client
llm_client = LLMClient(api_key="sk-emergent-86bFd414c571d0e164", provider="openai")

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
        prompt = f"""
Analyze this content and categorize it:
Title: {title}
URL: {url or 'N/A'}

Provide analysis in this format:
1. Category (AI, News, Tools, Market, Research, Tutorial, Other)
2. Content Type (Video, Article, Blog, Course, Documentation)
3. Key Topics (comma-separated list)
4. Domain (Technology, Science, Business, Arts, etc.)
5. Learning Value (1-10)

Respond in JSON format.
"""
        
        response = llm_client.generate_text(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o-mini",
            temperature=0.3
        )
        
        # Parse AI response
        try:
            analysis = json.loads(response.strip())
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
        prompt = f"""
Find connections between this activity and others:

Main Activity:
Title: {activity['title']}
Category: {activity.get('category', 'Unknown')}

Other Activities:
{chr(10).join([f"- {a.get('title', '')} ({a.get('category', 'Unknown')})" for a in other_activities[:10]])}

Identify up to 3 strongest connections and explain why they're related.
Respond in JSON format: [{"to_id": "id", "type": "related_concept|prerequisite|application", "reasoning": "explanation", "strength": 0.0-1.0}]
"""
        
        response = llm_client.generate_text(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o-mini",
            temperature=0.5
        )
        
        try:
            connections_data = json.loads(response.strip())
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

# ============= API ENDPOINTS =============

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
    
    prompt = f"""
Based on this learning history, provide 5 actionable suggestions for next topics to explore:

Recent activities:
{chr(10).join([f"- {a.get('title', '')} ({a.get('category', 'Unknown')})" for a in activities[:10]])}

Category distribution: {categories}

Provide suggestions that:
1. Connect different domains
2. Fill knowledge gaps
3. Explore emerging topics
4. Deepen understanding

Respond in JSON format: [{"suggestion": "text", "reasoning": "why", "priority": 1-5}]
"""
    
    try:
        response = llm_client.generate_text(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o-mini",
            temperature=0.7
        )
        suggestions = json.loads(response.strip())
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
