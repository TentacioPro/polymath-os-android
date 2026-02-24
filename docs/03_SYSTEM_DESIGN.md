# Polymath OS - System Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile Client                        │
│                  (Expo React Native)                     │
│  ┌────────────┬────────────┬──────────┬──────────────┐  │
│  │ Dashboard  │ Activities │ Journal  │ Connections  │  │
│  └────────────┴────────────┴──────────┴──────────────┘  │
│              Zustand State Management                    │
└─────────────────────────────────────────────────────────┘
                         ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    Backend API Layer                     │
│                       (FastAPI)                          │
│  ┌──────────┬───────────┬─────────┬──────────────────┐  │
│  │ Activity │  Journal  │   AI    │  Export/Import   │  │
│  │  Service │  Service  │ Service │     Service      │  │
│  └──────────┴───────────┴─────────┴──────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│                      (MongoDB)                           │
│  ┌──────────┬──────────┬─────────────┬──────────────┐  │
│  │activities│ journals │ connections │  ai_config   │  │
│  └──────────┴──────────┴─────────────┴──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
│  ┌──────────────┬──────────────┬───────────────────┐   │
│  │ Emergent LLM │   YouTube    │   Google APIs     │   │
│  │     API      │     API      │   (Future)        │   │
│  └──────────────┴──────────────┴───────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layer

#### 1. Presentation Layer
```
app/
├── _layout.tsx                    # Root layout
├── (tabs)/                        # Tab navigation group
│   ├── _layout.tsx               # Tab configuration
│   ├── index.tsx                 # Dashboard
│   ├── activities.tsx            # Activity management
│   ├── journal.tsx               # Journaling
│   ├── connections.tsx           # Visualizations
│   └── export.tsx                # Export/Import
```

#### 2. State Management
```
store/
└── useStore.ts                    # Zustand store
    ├── activities: Activity[]     # Cached activities
    ├── journals: Journal[]        # Cached journals
    ├── connections: Connection[]  # Cached connections
    └── isLoading: boolean        # Global loading state
```

#### 3. Data Flow
```
User Action → Component → API Call → Backend → Database
                  ↓                      ↓
            Update Store ← Parse Response ←
                  ↓
            Re-render UI
```

### Backend Layer

#### 1. API Structure
```python
server.py
├── Models (Pydantic)
│   ├── Activity, ActivityCreate
│   ├── Journal, JournalCreate
│   ├── Connection
│   ├── AIConfig, AIConfigCreate
│   └── ExportRequest, ImportRequest
│
├── Helper Functions
│   ├── generate_hash()              # Deduplication
│   ├── check_duplicate()            # Hash lookup
│   ├── analyze_content_with_ai()    # Content analysis
│   ├── generate_connections()       # Find relationships
│   ├── parse_youtube_history()      # Parse uploads
│   └── parse_google_history()       # Parse uploads
│
└── API Routes
    ├── Activity Management (5 endpoints)
    ├── Journal Management (4 endpoints)
    ├── AI Operations (4 endpoints)
    ├── Export/Import (4 endpoints)
    └── Statistics (1 endpoint)
```

#### 2. Service Layer Pattern
```
HTTP Request
    ↓
FastAPI Router (@api_router)
    ↓
Request Validation (Pydantic)
    ↓
Business Logic (async functions)
    ↓
Database Operations (Motor)
    ↓
Response Serialization
    ↓
HTTP Response
```

### Database Layer

#### Schema Design

**Activities Collection**
```javascript
{
  _id: ObjectId,                    // MongoDB internal
  id: "uuid-v4",                    // App-level ID
  title: "string",
  url: "string | null",
  source: "manual | youtube | google | upload",
  category: "string | null",        // AI-generated
  content_type: "string | null",   // AI-generated
  notes: "string | null",
  timestamp: ISODate,
  raw_data: {},                     // Original upload data
  ai_analysis: {},                  // Full AI response
  hash: "sha256-string"             // For deduplication
}
```

**Indexes**:
- `hash`: unique (deduplication)
- `timestamp`: descending (chronological queries)
- `category`: non-unique (filtering)

**Journals Collection**
```javascript
{
  _id: ObjectId,
  id: "uuid-v4",
  title: "string",
  content: "string",
  tags: ["string"],
  linked_activities: ["uuid"],
  timestamp: ISODate
}
```

**Indexes**:
- `timestamp`: descending
- `tags`: multikey (tag search)

**Connections Collection**
```javascript
{
  _id: ObjectId,
  id: "uuid-v4",
  from_id: "uuid",                  // Source activity
  to_id: "uuid",                    // Target activity
  connection_type: "related_concept | prerequisite | application",
  ai_reasoning: "string",
  strength: 0.0-1.0,
  timestamp: ISODate
}
```

**Indexes**:
- `from_id`: non-unique (lookup connections)
- `to_id`: non-unique (reverse lookup)

## Data Flow Diagrams

### 1. Activity Creation Flow
```
User Input (Manual)
    ↓
Frontend Validation
    ↓
POST /api/activities/manual
    ↓
Generate Hash (title + url + timestamp)
    ↓
Check Duplicate (database lookup)
    ↓
AI Content Analysis ──→ emergentintegrations ──→ OpenAI GPT-4o-mini
    ↓                           ↓
Create Activity Model      Parse Response
    ↓                           ↓
Insert to MongoDB ←────────────┘
    ↓
Return Activity Object
    ↓
Update Frontend Store
    ↓
Re-render Activity List
```

### 2. File Upload Flow
```
User Selects File (expo-document-picker)
    ↓
Read File Content (expo-file-system)
    ↓
POST /api/activities/upload (multipart/form-data)
    ↓
Detect Format (filename heuristics)
    ↓
Parse Content
├── YouTube History → parse_youtube_history()
├── Google History → parse_google_history()
└── Generic JSON → direct parse
    ↓
For Each Activity:
├── Generate Hash
├── Check Duplicate
├── AI Analysis (parallel)
└── Insert to Database
    ↓
Return Summary (created, duplicates skipped)
    ↓
Show Alert to User
    ↓
Refresh Activity List
```

### 3. Connection Generation Flow
```
User Taps "Generate Connections" on Activity
    ↓
POST /api/ai/generate-connections/{activity_id}
    ↓
Fetch Target Activity (database)
    ↓
Fetch Other Activities (limit 50)
    ↓
Construct AI Prompt
├── Main activity details
├── List of other activities with IDs
└── Instructions for finding connections
    ↓
Call emergentintegrations (GPT-4o-mini)
    ↓
Parse JSON Response
    ↓
For Each Connection:
├── Create Connection Object
├── Validate IDs exist
└── Insert to Database
    ↓
Return Connection Objects
    ↓
Update Frontend
    ↓
User Views in Graph Tab
```

### 4. Export/Import Flow
```
EXPORT:
User Taps Export Format
    ↓
POST /api/export/{format}
    ↓
Query All Collections
├── activities.find().to_list()
├── journals.find().to_list()
└── connections.find().to_list()
    ↓
Format Data
├── JSON: Raw structure
├── Markdown: Formatted text
└── CSV: Tabular format
    ↓
Return Formatted Data
    ↓
Write to FileSystem (expo-file-system)
    ↓
Share (expo-sharing)
    ↓
User Saves to Device/Cloud

IMPORT:
User Selects JSON File
    ↓
Read File (expo-file-system)
    ↓
Parse JSON
    ↓
POST /api/import/restore
    ↓
For Each Collection:
├── Check if item exists (by ID or hash)
├── Skip if exists
└── Insert if new
    ↓
Return Import Counts
    ↓
Show Success Alert
    ↓
User Navigates to View Restored Data
```

## AI Integration Architecture

### LLM Client Setup
```python
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Initialize for each request
chat = LlmChat(
    api_key=EMERGENT_LLM_KEY,
    session_id=f"unique_session_{uuid}",
    system_message="Role definition"
).with_model("openai", "gpt-4o-mini")

# Send message
user_message = UserMessage(text=prompt)
response = await chat.send_message(user_message)
```

### AI Use Cases

#### 1. Content Categorization
- **Trigger**: Automatic on activity creation
- **Model**: GPT-4o-mini (fast, cost-effective)
- **Input**: Title + URL
- **Output**: Category, content_type, key_topics, domain, learning_value
- **Fallback**: Default "Other" category if AI fails

#### 2. Connection Discovery
- **Trigger**: User-initiated per activity
- **Model**: GPT-4o-mini
- **Input**: Target activity + list of other activities
- **Output**: Up to 3 connections with reasoning
- **Logic**: AI selects most relevant connections

#### 3. Learning Suggestions
- **Trigger**: User-initiated from Suggestions tab
- **Model**: GPT-4o-mini
- **Input**: Recent 20 activities + category distribution
- **Output**: 5 prioritized suggestions with reasoning
- **Value**: Identifies gaps and emerging topics

### Prompt Engineering

**Best Practices Applied**:
1. Clear role definition in system message
2. Explicit JSON output format
3. Structured input with labels
4. Specific constraints (e.g., "up to 3 connections")
5. Examples in prompt (implicit)

## Deduplication System

### Hash Generation
```python
import hashlib
from datetime import datetime

def generate_hash(title: str, url: Optional[str], timestamp: datetime) -> str:
    content = f"{title}_{url}_{timestamp.isoformat()}"
    return hashlib.sha256(content.encode()).hexdigest()
```

### Deduplication Logic
1. **On Activity Creation**:
   - Generate hash from title + URL + timestamp
   - Query database for existing hash
   - If exists: Return 400 error (frontend shows alert)
   - If not exists: Proceed with creation

2. **On File Upload**:
   - Parse file into activity list
   - For each activity:
     * Generate hash
     * Check duplicate
     * Skip if exists (increment counter)
     * Create if new (increment counter)
   - Return summary: created vs. skipped

3. **On Import/Restore**:
   - Activities: Check by hash
   - Journals: Check by ID
   - Connections: Check by ID
   - Only insert if not exists

### Hash Collision Handling
- **Probability**: Negligible with SHA-256
- **Detection**: If collision occurs, will be caught by duplicate check
- **Resolution**: Timestamp uniqueness ensures different hash

## State Management

### Zustand Store Design
```typescript
interface AppState {
  // Data
  activities: Activity[];
  journals: Journal[];
  connections: Connection[];
  
  // UI State
  isLoading: boolean;
  
  // Actions
  setActivities: (activities: Activity[]) => void;
  setJournals: (journals: Journal[]) => void;
  setConnections: (connections: any[]) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}
```

### State Updates
1. **On Screen Mount**: Fetch from API → Update store
2. **On Create/Update**: API call → Refresh from API → Update store
3. **On Delete**: API call → Remove from store (or refresh)
4. **On Import**: API restore → Navigate to screen → Fetch data

### Why Zustand?
- **Lightweight**: ~1KB vs 5KB (Redux)
- **Simple API**: No boilerplate
- **TypeScript**: First-class support
- **React Native**: Full compatibility
- **No Provider**: Direct hook usage

## API Design

### RESTful Principles

**Resource Naming**:
- `/api/activities` - Collection
- `/api/activities/{id}` - Specific resource
- `/api/activities/manual` - Action endpoint
- `/api/activities/upload` - Action endpoint

**HTTP Methods**:
- `GET`: Retrieve (idempotent)
- `POST`: Create or action
- `PUT`: Update (idempotent)
- `DELETE`: Remove

**Status Codes**:
- `200`: Success
- `400`: Bad request (duplicate, validation)
- `404`: Not found
- `500`: Server error

### Request/Response Patterns

#### Standard Response
```json
{
  "id": "uuid",
  "...fields": "values",
  "timestamp": "ISO-8601"
}
```

#### List Response
```json
[
  { "id": "uuid", "...fields": "values" },
  { "id": "uuid", "...fields": "values" }
]
```

#### Action Response
```json
{
  "message": "Success message",
  "count": 5,
  "details": {}
}
```

#### Error Response
```json
{
  "detail": "Human-readable error message"
}
```

### Pagination Strategy
```python
@api_router.get("/activities")
async def get_activities(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
):
    # Query with skip/limit
    # Return paginated results
```

**Frontend Implementation**:
- Initial: Load first 100 items
- Future: Infinite scroll with skip/limit

## File Processing System

### Supported Formats

#### YouTube Watch History
```json
[
  {
    "title": "Video Title",
    "titleUrl": "https://youtube.com/watch?v=...",
    "time": "2025-01-15T10:30:00Z"
  }
]
```

#### Google Search History
```json
[
  {
    "title": "Search Query",
    "url": "https://...",
    "time": "2025-01-15T10:30:00Z"
  }
]
```

#### Generic Format
```json
[
  {
    "title": "string",
    "url": "string",
    "timestamp": "ISO-8601",
    "source": "string"
  }
]
```

### Parsing Strategy
1. **Filename Detection**: Check for keywords (youtube, google, watch, search)
2. **Structure Analysis**: Try specific parsers first
3. **Fallback**: Generic JSON parser
4. **Error Handling**: Return 400 with clear message

## Export/Import System

### Export Formats

#### JSON (Master Format)
```json
{
  "export_date": "2025-02-24T15:30:00Z",
  "version": "1.0",
  "activities": [...],
  "journals": [...],
  "connections": [...]
}
```
- **Purpose**: Complete app state backup
- **Usage**: Full restoration after reinstall
- **Size**: Can be large (thousands of activities)

#### Markdown
```markdown
# Polymath OS Export

Export Date: 2025-02-24 15:30:00

---

## Learning Activities

### Activity Title
- **Category**: AI
- **Source**: youtube
- **Date**: 2025-02-20
- **URL**: https://...
```
- **Purpose**: Human-readable documentation
- **Usage**: Sharing, review, printing

#### CSV
```csv
title,category,source,url,timestamp,notes
"Activity 1","AI","manual","https://...","2025-02-20T10:00:00Z","Notes"
```
- **Purpose**: Spreadsheet analysis
- **Usage**: Excel, Google Sheets, data analysis

### Import/Restore Logic
```python
# Read JSON file
import_data = json.loads(file_content)

# Process each collection
for activity in import_data['activities']:
    if not await check_duplicate(activity['hash']):
        await db.activities.insert_one(activity)

for journal in import_data['journals']:
    if not await db.journals.find_one({"id": journal['id']}):
        await db.journals.insert_one(journal)

for connection in import_data['connections']:
    if not await db.connections.find_one({"id": connection['id']}):
        await db.connections.insert_one(connection)

# Return counts
return {
    "activities_imported": count_activities,
    "journals_imported": count_journals,
    "connections_imported": count_connections
}
```

## Security Considerations

### Current Implementation
- ✅ CORS enabled (development mode)
- ✅ Environment variables for secrets
- ✅ Input validation (Pydantic)
- ✅ No SQL injection (MongoDB query objects)

### Future Enhancements
- ⏳ User authentication
- ⏳ API rate limiting
- ⏳ File size limits
- ⏳ Content sanitization
- ⏳ HTTPS in production

## Performance Optimization

### Backend
1. **Async Operations**: All database calls async
2. **Parallel Processing**: File upload processes activities in sequence (could be parallelized)
3. **Indexing**: Proper MongoDB indexes
4. **Connection Pooling**: Motor handles automatically

### Frontend
1. **Lazy Loading**: Screens load data on mount
2. **Caching**: Zustand holds data between navigations
3. **Optimistic Updates**: Could add (future)
4. **Debouncing**: For search (future)

### Database
1. **Indexes**: hash (unique), timestamp (sorted), category (filter)
2. **Limits**: Default limit of 100 items per query
3. **Projection**: Return only needed fields (future)

## Scalability Considerations

### Current Capacity
- **Activities**: Handles thousands
- **Connections**: Grows O(n²) in worst case
- **AI Calls**: Rate limited by provider

### Scaling Strategies
1. **Horizontal**: Add more backend instances
2. **Database**: MongoDB sharding
3. **Caching**: Redis for frequently accessed data
4. **AI**: Batch processing, caching results
5. **CDN**: For exported files (future)

## Error Handling Strategy

### Backend
```python
try:
    # Operation
    result = await some_operation()
    return result
except SpecificException as e:
    logging.error(f"Context: {e}")
    raise HTTPException(status_code=400, detail="User-friendly message")
except Exception as e:
    logging.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

### Frontend
```typescript
try {
  setLoading(true);
  const response = await axios.post(url, data);
  // Handle success
  Alert.alert('Success', 'Operation completed');
} catch (error: any) {
  console.error('Error:', error);
  Alert.alert('Error', error.response?.data?.detail || 'Operation failed');
} finally {
  setLoading(false);
}
```

### Error Categories
1. **Validation Errors**: User input issues (400)
2. **Not Found**: Resource doesn't exist (404)
3. **Duplicate**: Already exists (400)
4. **Server Errors**: Unexpected failures (500)
5. **Network Errors**: Connection issues (caught by frontend)

## Logging & Monitoring

### Backend Logging
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Logged Events**:
- API requests (FastAPI automatic)
- AI calls (emergentintegrations logs)
- Errors and exceptions
- Database operations (on error)

### Frontend Logging
```typescript
console.log('Info:', data);
console.error('Error:', error);
```

**Logged Events**:
- API calls (URL and response)
- Errors (with stack trace)
- Navigation events
- User actions (future)

## Testing Strategy

### Backend Testing
- ✅ Manual curl tests
- ✅ Automated test suite (via testing agent)
- ⏳ Unit tests
- ⏳ Integration tests
- ⏳ Load tests

### Frontend Testing
- ✅ Manual navigation testing
- ✅ Playwright automation
- ⏳ Component tests
- ⏳ E2E tests
- ⏳ Device testing (iOS/Android)

## Deployment Architecture

### Current (Development)
```
Docker Container
├── Backend (port 8001)
├── Frontend (port 3000)
├── MongoDB (internal)
└── Supervisor (process management)
```

### Production (Future)
```
Mobile Apps (iOS/Android)
    ↓
API Gateway (HTTPS)
    ↓
Backend Cluster (Kubernetes)
    ↓
MongoDB Atlas (Managed)
```

## Data Privacy & Ownership

### Design Principles
1. **Local Storage**: All data in user's database
2. **Export Anytime**: No lock-in
3. **Transparent AI**: Clear what's being analyzed
4. **No Tracking**: App doesn't send analytics

### GDPR Compliance (If Needed)
- ✅ Right to access: Export feature
- ✅ Right to erasure: Delete functions
- ✅ Data portability: Multiple export formats
- ⏳ Consent management: For AI processing

## Technology Decisions Rationale

### Why Expo?
- Cross-platform (iOS, Android, Web)
- Hot reload for fast iteration
- Rich ecosystem of libraries
- Easy deployment to app stores
- Native feel with React Native

### Why FastAPI?
- Async by default (MongoDB compatibility)
- Automatic API documentation
- Type safety with Pydantic
- Fast performance
- Python ecosystem access

### Why MongoDB?
- Flexible schema (varying activity types)
- Easy to add fields
- Good for document storage
- Async driver (Motor)
- JSON-like structure (matches API)

### Why emergentintegrations?
- Single key for multiple providers
- Simplified API
- Cost management
- Provider flexibility
- Built for this use case

## Integration Points

### Current Integrations
1. **emergentintegrations**: AI content analysis
2. **expo-document-picker**: File uploads
3. **expo-file-system**: File operations
4. **expo-sharing**: Data export

### Future Integrations
1. **YouTube Data API**: Real-time watch history
2. **Google Search API**: Real-time search history
3. **Cloud Storage**: Auto-backup (Drive, Dropbox)
4. **Social Sharing**: Share insights (Twitter, LinkedIn)
5. **Calendar**: Learning schedule
6. **Notifications**: Learning reminders

## Performance Benchmarks

### API Response Times (Expected)
- Activity creation: ~2-3 seconds (includes AI)
- Get activities: <500ms
- Journal CRUD: <200ms
- Connection generation: ~3-5 seconds (AI dependent)
- Export JSON: ~1 second (1000 activities)
- Import restore: ~2-5 seconds (1000 activities)

### Frontend Render Times
- Initial load: 2-3 seconds
- Navigation: <100ms
- Modal open: <200ms
- List render: <500ms (100 items)

## Disaster Recovery

### Backup Strategy
1. **User-Initiated**: Export JSON anytime
2. **Frequency**: User's choice
3. **Storage**: User's device/cloud
4. **Restoration**: Import JSON

### Data Loss Prevention
1. **MongoDB Persistence**: Data survives app restart
2. **Export Reminders**: (future) prompt user periodically
3. **Auto-Backup**: (future) scheduled exports
4. **Version Control**: Export includes version number

## Monitoring & Observability

### Current
- Backend logs via Supervisor
- Frontend console logs
- MongoDB logs

### Future
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Usage analytics (privacy-preserving)
- AI cost tracking

## System Constraints

### Hard Limits
- **MongoDB Document**: 16MB max
- **API Timeout**: 30 seconds default
- **File Upload**: Limited by proxy (needs chunking for large files)

### Soft Limits (Configurable)
- **Activities per query**: 100 (pagination)
- **Connections generated**: 3 per activity
- **Suggestions**: 5 per request
- **AI context**: 50 activities max

## Future Technical Debt

1. **File Upload Chunking**: For large history files
2. **Optimistic Updates**: Faster perceived performance
3. **Background Sync**: For API integrations
4. **Offline Support**: Queue actions when offline
5. **Image Optimization**: For watermarked exports
6. **Test Coverage**: Unit and integration tests
7. **Error Boundaries**: Better crash handling
8. **Performance Monitoring**: Real metrics
