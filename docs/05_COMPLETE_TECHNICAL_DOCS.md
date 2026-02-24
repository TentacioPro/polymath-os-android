# Polymath OS - Complete Technical Documentation

## Frontend Documentation

### Project Structure
```
frontend/
├── app/
│   ├── _layout.tsx                 # Root layout with SafeAreaProvider
│   └── (tabs)/                     # Tab navigation group
│       ├── _layout.tsx            # Tab bar configuration
│       ├── index.tsx              # Dashboard (Home)
│       ├── activities.tsx         # Activity management
│       ├── journal.tsx            # Journaling interface
│       ├── connections.tsx        # Knowledge visualization
│       └── export.tsx             # Export/Import
├── store/
│   └── useStore.ts                 # Zustand global state
├── assets/
│   ├── images/
│   └── fonts/
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── .env                            # Environment variables
```

### Screen Components

#### 1. Dashboard (index.tsx)
**Purpose**: Overview and entry point

**Key Features**:
- Stats cards (Activities, Journals, Connections count)
- Category distribution with colored chips
- Recent activities preview (5 items)
- Refresh data button

**API Calls**:
```typescript
// On mount
Promise.all([
  axios.get(`${BACKEND_URL}/api/stats`),
  axios.get(`${BACKEND_URL}/api/activities?limit=10`),
  axios.get(`${BACKEND_URL}/api/journals?limit=5`)
]);
```

**State Management**:
- Local state: stats, loading
- Global state: activities, journals (from useStore)

**UI Components**:
- Header with title and subtitle
- 3-column stat grid
- Category chips (dynamic based on data)
- Activity cards with metadata
- Action button

#### 2. Activities (activities.tsx)
**Purpose**: Activity input and management

**Key Features**:
- Activity list (chronological, newest first)
- Add manual activity (bottom sheet modal)
- Upload file (document picker)
- AI-generated category badges
- Empty state with clear CTA

**Modal Form Fields**:
- Title (required): Text input
- URL (optional): Text input with keyboard type
- Notes (optional): Multiline text area

**File Upload Flow**:
1. User taps upload icon
2. Document picker opens (JSON files)
3. File read with expo-file-system
4. Upload to backend via FormData
5. Backend parses and processes
6. Alert shows results (created vs duplicates)
7. List refreshes with new data

**API Calls**:
```typescript
// Create manual
POST /api/activities/manual
{
  title: string,
  url?: string,
  notes?: string,
  source: 'manual',
  timestamp: ISO-8601
}

// Upload file
POST /api/activities/upload
Content-Type: multipart/form-data
Body: FormData with file

// Get list
GET /api/activities?limit=100
```

#### 3. Journal (journal.tsx)
**Purpose**: Reflection and idea documentation

**Key Features**:
- Journal entry list (newest first)
- Create entry (bottom sheet modal)
- Tag system (comma-separated input)
- Formatted tag display with # prefix
- Full content preview (4 lines, expandable future)

**Modal Form Fields**:
- Title (required): Text input
- Content (required): Large text area (200px height)
- Tags (optional): Comma-separated text input

**Tag Processing**:
```typescript
// Parse tags
const tags = formData.tags
  .split(',')
  .map(t => t.trim())
  .filter(t => t);

// Display tags
tags.map(tag => (
  <View style={styles.tag}>
    <Text>#{tag}</Text>
  </View>
));
```

**API Calls**:
```typescript
// Create
POST /api/journals
{
  title: string,
  content: string,
  tags: string[],
  linked_activities: string[]
}

// Get list
GET /api/journals?limit=100
```

#### 4. Connections (connections.tsx)
**Purpose**: Knowledge visualization and discovery

**Three View Modes**:

**Timeline View** (Default):
- Chronological activity list
- Visual timeline (dots and lines)
- "Generate Connections" button per activity
- Shows category and date

**Graph View**:
- Connection cards
- Shows: From activity → To activity
- Connection type (related_concept, prerequisite, application)
- AI reasoning explanation
- Empty state if no connections

**Suggestions View**:
- "Generate Suggestions" button
- AI-powered recommendations
- Priority badges (P1-P5)
- Reasoning for each suggestion
- Based on complete learning history

**API Calls**:
```typescript
// Load data
GET /api/activities?limit=50
GET /api/connections

// Generate connections
POST /api/ai/generate-connections/{activity_id}

// Get suggestions
GET /api/ai/suggestions
```

**Tab Switching**:
```typescript
const [view, setView] = useState<'timeline' | 'graph' | 'suggestions'>('timeline');

// Render based on view
{view === 'timeline' && renderTimeline()}
{view === 'graph' && renderGraph()}
{view === 'suggestions' && renderSuggestions()}
```

#### 5. Export (export.tsx)
**Purpose**: Data portability and backup

**Export Options**:
1. **JSON Export**:
   - Complete backup
   - For app restoration
   - Includes all collections

2. **Markdown Export**:
   - Human-readable format
   - Formatted with headers
   - For documentation

3. **CSV Export**:
   - Spreadsheet format
   - Activities only
   - For analysis

**Export Flow**:
```typescript
const exportData = async (format: string) => {
  // Call backend API
  const res = await axios.post(`${BACKEND_URL}/api/export/${format}`);
  
  // Write to file system
  const fileUri = `${FileSystem.documentDirectory}polymath_export.${format}`;
  await FileSystem.writeAsStringAsync(fileUri, content);
  
  // Share
  await Sharing.shareAsync(fileUri);
};
```

**Import/Restore Flow**:
```typescript
const handleImport = async () => {
  // Pick file
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json'
  });
  
  // Read content
  const fileContent = await FileSystem.readAsStringAsync(result.uri);
  const data = JSON.parse(fileContent);
  
  // Send to backend
  const res = await axios.post(`${BACKEND_URL}/api/import/restore`, data);
  
  // Show results
  Alert.alert('Import Complete', `Imported: ${res.data}`);
};
```

### State Management (Zustand)

**Store Structure**:
```typescript
interface AppState {
  // Data Collections
  activities: Activity[];
  journals: Journal[];
  connections: Connection[];
  
  // UI State
  isLoading: boolean;
  
  // Setters
  setActivities: (activities: Activity[]) => void;
  setJournals: (journals: Journal[]) => void;
  setConnections: (connections: Connection[]) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}
```

**Usage Pattern**:
```typescript
import { useStore } from '../../store/useStore';

function MyComponent() {
  const { activities, setActivities } = useStore();
  
  // Update state
  const loadData = async () => {
    const res = await axios.get('/api/activities');
    setActivities(res.data);
  };
}
```

**Benefits**:
- No provider wrapper needed
- Simple API
- TypeScript support
- Minimal boilerplate
- React Native compatible

### Styling Approach

**StyleSheet Pattern**:
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  // ... more styles
});
```

**Design System**:
- 8pt spacing grid (8, 16, 24, 32)
- Consistent border radius (6, 12, 16, 24)
- Color palette (see UI_UX doc)
- Typography scale (12, 14, 16, 18, 20, 24, 32)

**Responsive Considerations**:
```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Adaptive sizing
const cardWidth = width - 32; // Full width minus padding
```

### Navigation Setup

**Expo Router Configuration**:
```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

// app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#1f2937' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      {/* ... other tabs */}
    </Tabs>
  );
}
```

**File-Based Routing**:
- `app/(tabs)/index.tsx` → `/` (Dashboard)
- `app/(tabs)/activities.tsx` → `/activities`
- `app/(tabs)/journal.tsx` → `/journal`
- `app/(tabs)/connections.tsx` → `/connections`
- `app/(tabs)/export.tsx` → `/export`

### Dependencies

**Core**:
- `expo`: ~54.0.33 - Framework
- `react`: 19.1.0 - UI library
- `react-native`: 0.81.5 - Mobile components
- `expo-router`: ~6.0.22 - File-based routing

**Navigation**:
- `@react-navigation/native`: ^7.1.6
- `@react-navigation/bottom-tabs`: ^7.3.10
- `react-native-screens`: ~4.16.0
- `react-native-safe-area-context`: ~5.6.0

**State & Data**:
- `zustand`: ^5.0.11 - State management
- `axios`: ^1.13.5 - HTTP client
- `@react-native-async-storage/async-storage`: ^3.0.1 - Local storage

**File Operations**:
- `expo-file-system`: ^19.0.21 - File read/write
- `expo-document-picker`: ^14.0.8 - File picker
- `expo-sharing`: ^14.0.8 - Share functionality

**UI Components**:
- `@expo/vector-icons`: ^15.0.3 - Icons (Ionicons)
- `react-native-svg`: ^15.15.3 - SVG rendering
- `react-native-gifted-charts`: ^1.4.74 - Charts
- `react-native-view-shot`: ^4.0.3 - Screenshot capture

### Environment Variables

**File**: `/app/frontend/.env`

```bash
# DO NOT MODIFY THESE (Protected)
EXPO_PACKAGER_PROXY_URL=https://polymath-hub.preview.emergentagent.com
EXPO_PACKAGER_HOSTNAME=polymath-hub.preview.emergentagent.com

# Backend API URL
EXPO_PUBLIC_BACKEND_URL=https://polymath-hub.preview.emergentagent.com
```

**Usage in Code**:
```typescript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
```

**Important**: Variables prefixed with `EXPO_PUBLIC_` are accessible in client code.

### TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Backend Documentation

### Project Structure
```
backend/
├── server.py                       # Main FastAPI application
├── requirements.txt                # Python dependencies
└── .env                            # Environment variables
```

### API Endpoints Reference

#### Activity Endpoints

**1. Create Manual Activity**
```http
POST /api/activities/manual
Content-Type: application/json

{
  "title": "Activity Title",
  "url": "https://example.com",
  "source": "manual",
  "notes": "Optional notes"
}

Response: Activity object with AI analysis
{
  "id": "uuid",
  "title": "...",
  "category": "AI",  // AI-generated
  "content_type": "Article",  // AI-generated
  "ai_analysis": { ... },
  "hash": "sha256...",
  "timestamp": "2025-02-24T15:30:00Z"
}
```

**2. Upload Activity File**
```http
POST /api/activities/upload
Content-Type: multipart/form-data

Body: file (YouTube/Google history JSON)

Response:
{
  "created": 15,
  "duplicates_skipped": 3,
  "total_processed": 18
}
```

**3. Get Activities**
```http
GET /api/activities?skip=0&limit=100&category=AI

Response: Array of Activity objects
[
  { "id": "...", "title": "...", ... }
]
```

**4. Delete Activity**
```http
DELETE /api/activities/{activity_id}

Response:
{
  "message": "Activity deleted"
}
```

#### Journal Endpoints

**1. Create Journal**
```http
POST /api/journals
Content-Type: application/json

{
  "title": "Journal Title",
  "content": "Full content text...",
  "tags": ["tag1", "tag2"],
  "linked_activities": ["activity-uuid"]
}

Response: Journal object
```

**2. Get Journals**
```http
GET /api/journals?skip=0&limit=100

Response: Array of Journal objects
```

**3. Update Journal**
```http
PUT /api/journals/{journal_id}
Content-Type: application/json

Body: Same as create

Response: Updated Journal object
```

**4. Delete Journal**
```http
DELETE /api/journals/{journal_id}

Response:
{
  "message": "Journal deleted"
}
```

#### AI Endpoints

**1. Analyze Activity**
```http
POST /api/ai/analyze/{activity_id}

Response: AI analysis object
{
  "category": "AI",
  "content_type": "Video",
  "key_topics": ["machine learning", "neural networks"],
  "domain": "Technology",
  "learning_value": 8
}
```

**2. Generate Connections**
```http
POST /api/ai/generate-connections/{activity_id}

Response:
{
  "connections_created": 2,
  "connections": [
    {
      "from_id": "uuid",
      "to_id": "uuid",
      "connection_type": "related_concept",
      "ai_reasoning": "Both discuss neural networks...",
      "strength": 0.85
    }
  ]
}
```

**3. Get AI Suggestions**
```http
GET /api/ai/suggestions

Response:
{
  "suggestions": [
    {
      "suggestion": "Explore deep learning architectures",
      "reasoning": "You've studied basics, ready for advanced topics",
      "priority": 5
    }
  ]
}
```

**4. Get All Connections**
```http
GET /api/connections

Response: Array of Connection objects
```

#### Export/Import Endpoints

**1. Export JSON**
```http
POST /api/export/json

Response:
{
  "export_date": "2025-02-24T15:30:00Z",
  "version": "1.0",
  "activities": [...],
  "journals": [...],
  "connections": [...]
}
```

**2. Export Markdown**
```http
POST /api/export/markdown

Response:
{
  "content": "# Polymath OS Export\n\n...",
  "filename": "polymath_export_20250224.md"
}
```

**3. Export CSV**
```http
POST /api/export/csv

Response:
{
  "content": "title,category,source,...\n...",
  "filename": "polymath_export_20250224.csv"
}
```

**4. Import/Restore**
```http
POST /api/import/restore
Content-Type: application/json

Body: Complete JSON export structure

Response:
{
  "activities_imported": 15,
  "journals_imported": 5,
  "connections_imported": 8
}
```

#### Statistics Endpoint

```http
GET /api/stats

Response:
{
  "total_activities": 45,
  "total_journals": 12,
  "total_connections": 23,
  "categories": {
    "AI": 15,
    "Tools": 10,
    "News": 8,
    "Market": 7,
    "Other": 5
  },
  "sources": {
    "manual": 20,
    "youtube": 15,
    "upload": 10
  }
}
```

### Backend Models (Pydantic)

```python
class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: Optional[str] = None
    source: str
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

class Connection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_id: str
    to_id: str
    connection_type: str
    ai_reasoning: str
    strength: float = 0.5
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

### Helper Functions

#### Hash Generation
```python
import hashlib

def generate_hash(title: str, url: Optional[str], timestamp: datetime) -> str:
    """Generate unique hash for deduplication"""
    content = f"{title}_{url}_{timestamp.isoformat()}"
    return hashlib.sha256(content.encode()).hexdigest()
```

#### Duplicate Check
```python
async def check_duplicate(hash: str) -> bool:
    """Check if activity already exists"""
    existing = await db.activities.find_one({"hash": hash})
    return existing is not None
```

#### AI Content Analysis
```python
from emergentintegrations.llm.chat import LlmChat, UserMessage

async def analyze_content_with_ai(title: str, url: Optional[str] = None) -> Dict[str, Any]:
    """Analyze content using AI"""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"analyze_{uuid.uuid4()}",
        system_message="You are an expert content analyzer. Always respond with valid JSON only."
    ).with_model("openai", "gpt-4o-mini")
    
    prompt = f"""Analyze this content:
Title: {title}
URL: {url or 'N/A'}

Respond with ONLY JSON:
{{
  "category": "AI|News|Tools|Market|Research|Tutorial|Other",
  "content_type": "Video|Article|Blog|Course|Documentation",
  "key_topics": ["topic1", "topic2"],
  "domain": "Technology|Science|Business|Arts",
  "learning_value": 1-10
}}"""
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    return json.loads(response.strip())
```

#### Connection Generation
```python
async def generate_connections(activity_id: str) -> List[Connection]:
    """Generate AI-powered connections"""
    activity = await db.activities.find_one({"id": activity_id})
    other_activities = await db.activities.find({"id": {"$ne": activity_id}}).to_list(50)
    
    chat = LlmChat(...).with_model("openai", "gpt-4o-mini")
    
    prompt = f"""Find connections between:
Main: {activity['title']}

Others:
{activities_list}

Respond with JSON array of connections."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    connections_data = json.loads(response)
    
    return [Connection(**conn) for conn in connections_data]
```

#### File Parsers
```python
def parse_youtube_history(file_content: str) -> List[Dict[str, Any]]:
    """Parse YouTube watch history JSON"""
    data = json.loads(file_content)
    activities = []
    for item in data:
        activities.append({
            "title": item.get("title", "Unknown"),
            "url": item.get("titleUrl", ""),
            "timestamp": item.get("time", datetime.utcnow().isoformat()),
            "source": "youtube"
        })
    return activities

def parse_google_history(file_content: str) -> List[Dict[str, Any]]:
    """Parse Google search history"""
    # Similar structure
    pass
```

### Database Operations

#### MongoDB Setup
```python
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
```

#### Common Patterns

**Insert**:
```python
await db.activities.insert_one(activity.dict())
```

**Find One**:
```python
activity = await db.activities.find_one({"id": activity_id})
```

**Find Many**:
```python
activities = await db.activities.find(query)
    .sort("timestamp", -1)
    .skip(skip)
    .limit(limit)
    .to_list(limit)
```

**Update**:
```python
await db.activities.update_one(
    {"id": activity_id},
    {"$set": {"category": "AI"}}
)
```

**Delete**:
```python
result = await db.activities.delete_one({"id": activity_id})
if result.deleted_count == 0:
    raise HTTPException(status_code=404)
```

**Count**:
```python
count = await db.activities.count_documents(query)
```

### Dependencies

**Core**:
- `fastapi==0.110.1` - Web framework
- `uvicorn==0.25.0` - ASGI server
- `motor==3.3.1` - MongoDB async driver
- `pydantic>=2.6.4` - Data validation

**Utilities**:
- `python-dotenv>=1.0.1` - Environment variables
- `requests>=2.31.0` - HTTP client
- `python-multipart>=0.0.9` - File upload handling

**AI Integration**:
- `emergentintegrations==0.1.0` - LLM client

**Export Libraries**:
- `openpyxl` - Excel export
- `python-pptx` - PowerPoint export
- `pypdf2` - PDF operations
- `reportlab` - PDF generation
- `pandas>=2.2.0` - Data manipulation

### Environment Variables

**File**: `/app/backend/.env`

```bash
# DO NOT MODIFY (Protected)
MONGO_URL=mongodb://localhost:27017
DB_NAME=polymath_db

# AI Configuration
EMERGENT_LLM_KEY=sk-emergent-86bFd414c571d0e164
```

**Loading in Code**:
```python
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Access
mongo_url = os.environ['MONGO_URL']
```

### Error Handling

**Pattern**:
```python
try:
    # Database operation
    result = await db.collection.operation()
    return result
except DuplicateKeyError:
    raise HTTPException(status_code=400, detail="Already exists")
except Exception as e:
    logging.error(f"Error: {e}")
    raise HTTPException(status_code=500, detail="Internal error")
```

**HTTP Status Codes Used**:
- `200`: Success
- `400`: Bad request (validation, duplicates)
- `404`: Not found
- `500`: Internal server error

### Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Usage
logger.info("Activity created")
logger.error(f"Failed: {error}")
```

---

## Database Documentation

### MongoDB Collections

#### activities
**Purpose**: Store all learning activities

**Schema**:
```javascript
{
  _id: ObjectId,               // MongoDB internal
  id: String,                  // UUID v4
  title: String,               // Required
  url: String?,                // Optional
  source: String,              // manual|youtube|google|upload
  category: String?,           // AI-generated
  content_type: String?,       // AI-generated
  notes: String?,              // User notes
  timestamp: ISODate,          // When learned
  raw_data: Object?,           // Original upload data
  ai_analysis: Object?,        // Full AI response
  hash: String                 // SHA-256 for deduplication
}
```

**Indexes**:
- `{ hash: 1 }` - Unique index for deduplication
- `{ timestamp: -1 }` - Descending sort for chronological display
- `{ category: 1 }` - Filter by category

**Queries**:
```javascript
// Find all, newest first
db.activities.find().sort({ timestamp: -1 })

// Find by category
db.activities.find({ category: "AI" })

// Check duplicate
db.activities.findOne({ hash: "sha256..." })
```

#### journals
**Purpose**: Store journal entries and ideas

**Schema**:
```javascript
{
  _id: ObjectId,
  id: String,                  // UUID v4
  title: String,               // Required
  content: String,             // Required
  tags: [String],              // Optional tags
  linked_activities: [String], // UUIDs of activities
  timestamp: ISODate           // Created date
}
```

**Indexes**:
- `{ timestamp: -1 }` - Sort by date
- `{ tags: 1 }` - Multikey index for tag search

#### connections
**Purpose**: Store AI-discovered relationships

**Schema**:
```javascript
{
  _id: ObjectId,
  id: String,                  // UUID v4
  from_id: String,             // Source activity UUID
  to_id: String,               // Target activity UUID
  connection_type: String,     // Type of relationship
  ai_reasoning: String,        // Why they're connected
  strength: Number,            // 0.0-1.0 confidence
  timestamp: ISODate           // When discovered
}
```

**Indexes**:
- `{ from_id: 1 }` - Find connections from an activity
- `{ to_id: 1 }` - Find connections to an activity

#### ai_config
**Purpose**: Store AI provider configuration

**Schema**:
```javascript
{
  _id: ObjectId,
  id: String,
  provider: String,            // openai|anthropic|gemini
  model: String,               // Model name
  api_key: String,             // API key
  is_active: Boolean           // Currently in use
}
```

---

## Integration Documentation

### emergentintegrations (AI)

**Installation**:
```bash
pip install emergentintegrations
```

**Setup**:
```python
from emergentintegrations.llm.chat import LlmChat, UserMessage

chat = LlmChat(
    api_key="sk-emergent-86bFd414c571d0e164",
    session_id="unique-session-id",
    system_message="Role definition"
).with_model("openai", "gpt-4o-mini")
```

**Supported Models**:
- **OpenAI**: gpt-4o-mini, gpt-4o, gpt-5.1, gpt-5.2
- **Anthropic**: claude-sonnet-4-6, claude-opus-4-6
- **Gemini**: gemini-3-flash, gemini-2.5-pro

**Usage**:
```python
user_message = UserMessage(text="Your prompt")
response = await chat.send_message(user_message)
result = json.loads(response)  # If expecting JSON
```

### expo-document-picker

**Usage**:
```typescript
import * as DocumentPicker from 'expo-document-picker';

const result = await DocumentPicker.getDocumentAsync({
  type: 'application/json',
  copyToCacheDirectory: true
});

if (!result.canceled && result.assets?.[0]) {
  const fileUri = result.assets[0].uri;
  const fileName = result.assets[0].name;
  // Process file
}
```

### expo-file-system

**Read File**:
```typescript
import * as FileSystem from 'expo-file-system';

const content = await FileSystem.readAsStringAsync(uri);
const data = JSON.parse(content);
```

**Write File**:
```typescript
const fileUri = `${FileSystem.documentDirectory}filename.json`;
await FileSystem.writeAsStringAsync(fileUri, content);
```

### expo-sharing

**Share File**:
```typescript
import * as Sharing from 'expo-sharing';

const isAvailable = await Sharing.isAvailableAsync();
if (isAvailable) {
  await Sharing.shareAsync(fileUri);
}
```

---

## Deployment

### Development Environment

**Services**:
1. **Backend**: Supervised by supervisorctl on port 8001
2. **Frontend**: Expo Metro bundler on port 3000
3. **MongoDB**: Local instance

**Commands**:
```bash
# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart expo

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/expo.out.log
```

### Production Deployment (Future)

**Backend**:
- Deploy to cloud (AWS, GCP, Azure)
- Use managed MongoDB (MongoDB Atlas)
- Environment variables via secrets manager
- HTTPS with SSL certificate
- Rate limiting and authentication

**Frontend**:
- Build with EAS: `eas build --platform all`
- Submit to App Store and Google Play
- Over-the-air updates with EAS Update
- Analytics integration

---

## Testing Documentation

### Backend Testing

**Manual Testing**:
```bash
# Test root
curl http://localhost:8001/api/

# Create activity
curl -X POST http://localhost:8001/api/activities/manual \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","source":"manual"}'

# Get activities
curl http://localhost:8001/api/activities
```

**Automated Testing** (via testing agent):
- All endpoints tested
- Success and error cases
- AI integration verified
- Database operations checked

### Frontend Testing

**Manual Testing**:
1. Open app in browser or Expo Go
2. Navigate through all tabs
3. Test form submissions
4. Verify data persistence

**Automated Testing** (via testing agent):
- Playwright scripts
- Mobile viewport simulation
- User flow verification
- Screenshot capture

---

## Troubleshooting

### Common Issues

**1. Backend not starting**
```bash
# Check logs
tail -50 /var/log/supervisor/backend.err.log

# Check MongoDB connection
echo $MONGO_URL

# Restart
sudo supervisorctl restart backend
```

**2. Frontend build errors**
```bash
# Clear cache
cd /app/frontend
rm -rf node_modules/.cache

# Reinstall
yarn install

# Restart
sudo supervisorctl restart expo
```

**3. API calls failing**
- Check EXPO_PUBLIC_BACKEND_URL in .env
- Verify backend is running: `curl http://localhost:8001/api/`
- Check CORS configuration
- View network tab in browser console

**4. Duplicate detection not working**
- Verify hash generation
- Check MongoDB index exists
- Review timestamp format consistency

**5. AI not responding**
- Check EMERGENT_LLM_KEY in backend/.env
- Verify emergentintegrations installed
- Check API rate limits
- Review error logs

---

## Code Examples

### Adding a New Screen

1. **Create file**: `app/(tabs)/newscreen.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

2. **Add to tab layout**: `app/(tabs)/_layout.tsx`

```typescript
<Tabs.Screen
  name="newscreen"
  options={{
    title: 'New',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="star" size={size} color={color} />
    ),
  }}
/>
```

### Adding a New API Endpoint

1. **Define Model** (if needed):
```python
class NewModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    field1: str
    field2: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

2. **Create Endpoint**:
```python
@api_router.post("/new-endpoint", response_model=NewModel)
async def create_new(input: NewModelCreate):
    obj = NewModel(**input.dict())
    await db.collection.insert_one(obj.dict())
    return obj
```

3. **Call from Frontend**:
```typescript
const response = await axios.post(
  `${BACKEND_URL}/api/new-endpoint`,
  { field1: 'value', field2: 123 }
);
```

### Adding AI Feature

```python
@api_router.post("/ai/new-feature")
async def new_ai_feature(input_data: dict):
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"feature_{uuid.uuid4()}",
        system_message="Role definition"
    ).with_model("openai", "gpt-4o-mini")
    
    prompt = f"""Your AI task description
    Input: {input_data}
    Output format: JSON"""
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    
    return json.loads(response)
```

---

## Performance Optimization Tips

### Frontend
1. **Memoization**: Use React.memo for expensive components
2. **Lazy Loading**: Dynamic imports for heavy screens
3. **Image Optimization**: Use expo-image instead of Image
4. **List Virtualization**: Use @shopify/flash-list for long lists
5. **Debouncing**: For search and filter inputs

### Backend
1. **Database Indexing**: Ensure proper indexes
2. **Query Optimization**: Use projection to limit fields
3. **Caching**: Redis for frequently accessed data
4. **Parallel Processing**: asyncio.gather for independent operations
5. **Connection Pooling**: Motor handles automatically

### AI
1. **Response Caching**: Store and reuse AI results
2. **Batch Processing**: Analyze multiple items together
3. **Model Selection**: Use smaller models where appropriate
4. **Timeout Handling**: Set reasonable timeouts
5. **Fallback Logic**: Default values if AI fails

---

## Security Best Practices

### Current Implementation
- ✅ Environment variables for secrets
- ✅ Input validation (Pydantic)
- ✅ CORS configuration
- ✅ No SQL injection (parameterized queries)

### Future Additions
- ⏳ User authentication (JWT)
- ⏳ API rate limiting
- ⏳ File size limits
- ⏳ Content sanitization
- ⏳ HTTPS in production
- ⏳ API key rotation
- ⏳ Audit logging

---

## Maintenance

### Regular Tasks
1. **Update Dependencies**: Monthly security updates
2. **Database Cleanup**: Archive old data (optional)
3. **Log Rotation**: Prevent disk full
4. **Backup Testing**: Verify restore works
5. **Performance Monitoring**: Check API response times

### Monitoring Checklist
- [ ] Backend service running
- [ ] MongoDB connected
- [ ] Frontend accessible
- [ ] API response times < 2s
- [ ] No critical errors in logs
- [ ] Disk space > 20%
- [ ] AI integration working

---

## Quick Reference

### File Locations
- Backend: `/app/backend/server.py`
- Frontend: `/app/frontend/app/`
- Store: `/app/frontend/store/useStore.ts`
- Docs: `/app/docs/`

### URLs
- Frontend: `https://polymath-hub.preview.emergentagent.com`
- Backend API: `https://polymath-hub.preview.emergentagent.com/api`
- Local backend: `http://localhost:8001`

### Key Commands
```bash
# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart expo

# Install packages
cd /app/backend && pip install package && pip freeze > requirements.txt
cd /app/frontend && yarn add package

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/expo.out.log

# Test API
curl http://localhost:8001/api/
```

### Support Resources
- Expo Docs: https://docs.expo.dev
- FastAPI Docs: https://fastapi.tiangolo.com
- MongoDB Docs: https://docs.mongodb.com
- React Native Docs: https://reactnative.dev
