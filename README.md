# Polymath OS - Learning Tracker

A comprehensive mobile application for tracking and organizing your learning journey across multiple domains. Built with Expo (React Native), FastAPI, and MongoDB.

## 🎯 Features

### 1. **Activity Tracking**
- **Manual Entry**: Add learning activities with title, URL, notes
- **File Upload**: Import YouTube watch history and Google search history (JSON format)
- **API Integration**: Ready for YouTube/Google API integration (setup UI included)
- **AI-Powered Categorization**: Automatic content analysis using GPT-4o-mini
- **Deduplication**: Smart hash-based system prevents duplicate entries
- **Chronological Display**: All activities sorted by timestamp

### 2. **Journaling System**
- Create and manage journal entries
- Tag system for organization
- Link journal entries to learning activities
- Full CRUD operations

### 3. **Dots to Connect - Knowledge Visualization**
Three visualization modes:

#### Timeline View
- Chronological display of learning journey
- Visual timeline with categories
- One-click connection generation for any activity

#### Graph View
- Network visualization of knowledge connections
- AI-generated relationship explanations
- Shows connection types (related_concept, prerequisite, application)
- Interactive connection cards

#### AI Suggestions
- Personalized learning recommendations
- Based on your complete activity history
- Identifies knowledge gaps and emerging topics
- Priority-ranked suggestions

### 4. **Export & Restore**
Complete data portability:

#### Export Formats
- **JSON**: Complete backup for app restoration
- **Markdown**: Human-readable documentation
- **CSV**: Spreadsheet format for analysis
- **PPT**: Presentation mode (backend ready)
- **PDF**: Formatted reports (backend ready)

#### Import/Restore
- Upload previously exported JSON
- Restore complete app state after reinstallation
- Duplicate detection during import
- Works across devices

### 5. **AI Integration**
- **Content Analysis**: Automatic categorization of activities
- **Connection Discovery**: AI finds relationships between topics
- **Learning Suggestions**: Personalized recommendations
- **Flexible Provider**: Support for OpenAI, Anthropic, Google (configured with emergentintegrations)

## 🏗️ Technical Architecture

### Frontend (Expo React Native)
- **Framework**: Expo Router with file-based routing
- **State Management**: Zustand
- **Navigation**: React Navigation with bottom tabs
- **UI Components**: Native iOS/Android components
- **Libraries**:
  - axios (API calls)
  - expo-document-picker (file uploads)
  - expo-file-system (file operations)
  - expo-sharing (data export)
  - @react-native-async-storage (local caching)
  - react-native-svg (visualizations)

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: emergentintegrations library
- **Export Engine**: Multiple format support
- **API Design**: RESTful with proper error handling

### Database Schema
```
activities {
  id, title, url, source, category, content_type,
  notes, timestamp, raw_data, ai_analysis, hash
}

journals {
  id, title, content, tags, linked_activities, timestamp
}

connections {
  id, from_id, to_id, connection_type, ai_reasoning, strength, timestamp
}

ai_config {
  id, provider, model, api_key, is_active
}
```

## 📱 App Screens

1. **Dashboard**: Overview with stats, recent activities, categories
2. **Activities**: List/add activities, upload files
3. **Journal**: Create and view journal entries
4. **Connections**: Three visualization modes (Timeline, Graph, Suggestions)
5. **Export**: Export data in multiple formats, import backups

## 🔧 API Endpoints

### Activities
- `POST /api/activities/manual` - Create manual entry
- `POST /api/activities/upload` - Upload history file
- `GET /api/activities` - Get all activities
- `DELETE /api/activities/{id}` - Delete activity

### Journals
- `POST /api/journals` - Create journal entry
- `GET /api/journals` - Get all journals
- `PUT /api/journals/{id}` - Update journal
- `DELETE /api/journals/{id}` - Delete journal

### AI Operations
- `POST /api/ai/analyze/{activity_id}` - Analyze content
- `POST /api/ai/generate-connections/{activity_id}` - Generate connections
- `GET /api/ai/suggestions` - Get learning suggestions
- `GET /api/connections` - Get all connections

### Export/Import
- `POST /api/export/json` - Export as JSON
- `POST /api/export/markdown` - Export as Markdown
- `POST /api/export/csv` - Export as CSV
- `POST /api/import/restore` - Restore from backup

### Stats
- `GET /api/stats` - Get dashboard statistics

## 🚀 Setup & Configuration

### Environment Variables
Backend (.env):
```
MONGO_URL=mongodb://...
DB_NAME=polymath_os
EMERGENT_LLM_KEY=sk-emergent-...
```

Frontend (.env):
```
EXPO_PUBLIC_BACKEND_URL=https://your-app.preview.emergentagent.com
```

### Running the App
Backend: `uvicorn server:app --host 0.0.0.0 --port 8001`
Frontend: `expo start --tunnel`

## 📊 Data Flow

1. **Input**: Manual entry / File upload / API sync
2. **Processing**: AI content analysis, deduplication
3. **Storage**: MongoDB with proper indexing
4. **Visualization**: Timeline, Graph, Suggestions
5. **Export**: Multiple formats for backup/sharing

## 🎨 Design Principles

- **Mobile-First**: Native feel with proper touch targets
- **Dark Theme**: Easy on the eyes for extended use
- **Data Ownership**: Complete export/import capability
- **AI-Enhanced**: Smart categorization and insights
- **Cross-Platform**: Works on iOS, Android, and Web

## 🔐 Data Privacy

- All data stored locally in your MongoDB instance
- Export your data anytime in multiple formats
- No vendor lock-in - full data portability
- AI processing using emergentintegrations (configurable)

## 🛠️ Future Enhancements

- [ ] Image export with watermarks (backend ready)
- [ ] PDF and PPT export (backend ready)
- [ ] Real-time YouTube/Google API sync
- [ ] Enhanced graph visualization
- [ ] Mobile app distribution (iOS/Android)
- [ ] Offline mode with sync
- [ ] Collaborative learning features

## 📝 Notes

- Deduplication uses SHA-256 hashing of (title + URL + timestamp)
- AI analysis happens automatically on activity creation
- Connection generation is on-demand (user initiated)
- Export includes complete app state for restoration
- All dates/times stored in ISO format for consistency

## 🏆 Key Achievements

✅ **Complete Data Lifecycle**: Track → Analyze → Connect → Export → Restore
✅ **AI-Powered Insights**: Automatic categorization and connection discovery
✅ **Multi-Format Export**: JSON, Markdown, CSV (+ PDF/PPT backend ready)
✅ **Zero Data Loss**: Full backup and restore capability
✅ **Cross-Domain Learning**: Track and connect learning across any field

## 🧠 Agent Memory System (NEW!)

### Long-Term Learning Assistant

Polymath OS includes an AI agent with persistent memory that learns from your data and interactions over time.

**Key Features**:
- **Memory Types**: Short-term, long-term, insights, patterns
- **Automatic Learning**: Extracts insights from activities and journals
- **Memory Consolidation**: Merges short-term into long-term insights
- **Persona Configuration**: Customize agent name, role, traits, behavior
- **Memory-Enhanced Chat**: Agent responds with context from memories
- **Learning Progression**: Track how agent improves over time
- **Memory Management**: View, edit, delete individual memories

**How It Works**:
1. Agent analyzes your learning activities
2. Extracts patterns and insights
3. Stores as memories with importance scores
4. Consolidates memories over time
5. Uses memories to provide personalized responses
6. Learns from every interaction

**Use Cases**:
- Ask agent for learning recommendations (memory-aware)
- View what agent has learned about your preferences
- Configure agent personality to match your style
- Track agent intelligence growth over time

**API Endpoints**: 10 new endpoints for complete memory management

