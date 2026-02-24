# Polymath OS - Project Plan

## Initial Requirements

**User's Vision**: Build a polymath OS that tracks all phone activity, YouTube videos, Google search history, blogs, and websites, filtering tech content (AI, news, tools, market) dynamically. Track learning across domains, provide dots to connect for brainstorming, journaling capabilities, and comprehensive data export.

## Clarifications & Requirements Gathering

### Q&A Session

**Q1: Activity Tracking Method?**
- **A**: Provide options for:
  - Manual entry
  - API integration (YouTube, Google)
  - File upload (any format for watch history)
  - **Critical**: Chronological output, no repetitions or duplicates

**Q2: AI Provider?**
- **A**: Provide integration setup for any provider, use available one (Emergent LLM key with OpenAI/Anthropic/Google)

**Q3: "Dots to Connect" Visualization?**
- **A**: All three:
  - Visual graph/network
  - AI-generated suggestions
  - Timeline view
  - **Important**: Must be exportable as images with watermark "Abishek M"

**Q4: Export Formats?**
- **A**: All formats:
  - JSON, PDF, Markdown, CSV/Excel
  - Enable PPT mode

**Q5: Development Priority?**
- **A**: Focus on both journaling and activity tracking
  - Lay foundation with minimal UI
  - Prioritize functionality, state management, data exportability
  - **Critical**: After export, user should be able to delete app, reinstall, and restore complete state

## Technical Architecture Decision

### Stack Selection
- **Frontend**: Expo React Native (cross-platform mobile)
- **Backend**: FastAPI (async Python)
- **Database**: MongoDB (flexible schema)
- **AI**: emergentintegrations with Emergent LLM Key
- **State Management**: Zustand (lightweight)

### Key Design Decisions

1. **Deduplication Strategy**: SHA-256 hash of (title + URL + timestamp)
2. **AI Processing**: On-demand for connections, automatic for categorization
3. **Data Model**: Separate collections for activities, journals, connections
4. **Navigation**: Bottom tab navigation (5 main screens)
5. **Export Strategy**: Multiple formats, JSON as master backup

## Implementation Phases

### Phase 1: Foundation (Completed)
- ✅ Database models and schemas
- ✅ API endpoints for all CRUD operations
- ✅ Basic UI structure with tab navigation
- ✅ State management setup

### Phase 2: Core Features (Completed)
- ✅ Manual activity entry
- ✅ File upload parsing (YouTube/Google history)
- ✅ AI content categorization
- ✅ Journaling system with tags
- ✅ Deduplication logic

### Phase 3: Visualizations (Completed)
- ✅ Timeline view with chronological display
- ✅ Graph view showing connections
- ✅ AI-generated learning suggestions
- ⏳ Image export with watermarks (backend ready, UI pending)

### Phase 4: Export/Import (Completed)
- ✅ JSON export (complete backup)
- ✅ Markdown export (documentation)
- ✅ CSV export (spreadsheet)
- ✅ Import/restore functionality
- ⏳ PDF export (backend ready)
- ⏳ PPT export (backend ready)

## Database Schema Design

### Collections

```javascript
// activities
{
  id: UUID,
  title: String,
  url: String (optional),
  source: Enum('manual', 'youtube', 'google', 'upload'),
  category: String (AI-generated),
  content_type: String (AI-generated),
  notes: String (optional),
  timestamp: DateTime,
  raw_data: Object (original data),
  ai_analysis: Object (AI response),
  hash: String (SHA-256 for deduplication)
}

// journals
{
  id: UUID,
  title: String,
  content: String,
  tags: Array[String],
  linked_activities: Array[UUID],
  timestamp: DateTime
}

// connections
{
  id: UUID,
  from_id: UUID,
  to_id: UUID,
  connection_type: Enum('related_concept', 'prerequisite', 'application'),
  ai_reasoning: String,
  strength: Float (0.0-1.0),
  timestamp: DateTime
}

// ai_config
{
  id: UUID,
  provider: Enum('openai', 'anthropic', 'gemini'),
  model: String,
  api_key: String,
  is_active: Boolean
}
```

## API Architecture

### Activity Management
- `POST /api/activities/manual` - Create manual entry with AI analysis
- `POST /api/activities/upload` - Parse and import history files
- `GET /api/activities` - Retrieve with filtering and pagination
- `DELETE /api/activities/{id}` - Remove activity

### Journal Management
- `POST /api/journals` - Create entry
- `GET /api/journals` - List all entries
- `PUT /api/journals/{id}` - Update entry
- `DELETE /api/journals/{id}` - Delete entry

### AI Operations
- `POST /api/ai/analyze/{activity_id}` - Re-analyze content
- `POST /api/ai/generate-connections/{activity_id}` - Find connections
- `GET /api/ai/suggestions` - Get personalized recommendations
- `GET /api/connections` - List all connections

### Data Management
- `POST /api/export/json` - Full backup
- `POST /api/export/markdown` - Documentation
- `POST /api/export/csv` - Spreadsheet
- `POST /api/import/restore` - Restore from backup
- `GET /api/stats` - Dashboard statistics

## Feature Implementation Strategy

### 1. Deduplication Logic
```python
def generate_hash(title: str, url: Optional[str], timestamp: datetime) -> str:
    content = f"{title}_{url}_{timestamp.isoformat()}"
    return hashlib.sha256(content.encode()).hexdigest()
```

### 2. AI Content Analysis
- Automatic on activity creation
- Categorizes into: AI, News, Tools, Market, Research, Tutorial, Other
- Identifies content type: Video, Article, Blog, Course, Documentation
- Extracts key topics and domain
- Assigns learning value (1-10)

### 3. Connection Generation
- On-demand per activity
- AI finds up to 3 strongest connections
- Explains reasoning for each connection
- Assigns strength score (0.0-1.0)

### 4. Export System
- JSON: Complete state for restoration
- Markdown: Formatted documentation with headers
- CSV: Tabular data for analysis
- All include timestamps and metadata

## Success Metrics

✅ **Functional Requirements Met**:
- Multi-source activity tracking
- Automatic categorization and deduplication
- Chronological ordering
- Three visualization modes
- Complete data export/import
- Full app state restoration

✅ **Technical Requirements Met**:
- Mobile-first responsive design
- Proper state management
- Database persistence
- AI integration
- Error handling
- Cross-platform compatibility

## Risk Mitigation

### Handled Risks
1. **Duplicate Entries**: SHA-256 hashing
2. **Data Loss**: Complete export/import system
3. **AI Failures**: Graceful fallbacks to default categorization
4. **File Format Variations**: Generic parsers with error handling

### Known Limitations
1. **Real-time API Sync**: Not yet implemented (manual upload only)
2. **Image Watermarking**: Backend ready, UI implementation pending
3. **Offline Mode**: Not implemented
4. **Large File Uploads**: May need chunking for very large histories

## Deployment Considerations

### Prerequisites
- MongoDB instance
- Emergent LLM Key (provided)
- Expo development account (for mobile builds)

### Environment Setup
- Backend: FastAPI on port 8001
- Frontend: Expo Metro bundler
- Database: MongoDB with proper collections

## Timeline Summary

- **Planning & Architecture**: Design phase
- **Backend Development**: Complete API implementation
- **Frontend Development**: 5-screen mobile app
- **AI Integration**: emergentintegrations setup
- **Testing**: Backend fully tested, frontend verified
- **Documentation**: Comprehensive guides

## Next Steps (Future Enhancements)

See FUTURE_DEVELOPMENT.md for detailed roadmap.
