# Polymath OS - User Guide

## What is Polymath OS?

Polymath OS is a comprehensive mobile learning tracker that helps you document, analyze, and connect your learning journey across multiple domains.

## Quick Start

### Accessing Your App
- **Web**: https://polymath-hub.preview.emergentagent.com
- **Mobile**: Scan QR code with Expo Go app

### Main Features

1. **Track Activities**: Manual entry + file upload (YouTube/Google history)
2. **AI Categorization**: Automatic tech content filtering (AI, News, Tools, Market)
3. **Journaling**: Document ideas and reflections
4. **Connections**: Timeline, Graph, and AI Suggestions views
5. **Export/Import**: JSON, Markdown, CSV with full restoration

## How to Use

### Add Activity
1. Tap Activities tab
2. Tap + button
3. Fill title, URL, notes
4. Submit - AI categorizes automatically

### Upload History
1. Tap Activities → Upload icon
2. Select YouTube/Google history JSON
3. AI processes all items
4. Duplicates automatically skipped

### Create Journal
1. Tap Journal tab
2. Tap + button
3. Write entry with tags
4. Save

### Discover Connections
1. Tap Connections → Timeline
2. Tap \"Generate Connections\" on activities
3. Switch to Graph tab to see relationships
4. Try Suggestions tab for AI recommendations

### Export Data
1. Tap Export tab
2. Choose format (JSON for backup)
3. Share to your preferred location

### Restore Data
1. Tap Export → Import
2. Select backup JSON file
3. All data restored!

## Key Features

✅ **No Duplicates**: SHA-256 hash deduplication
✅ **Chronological**: All views sorted by time
✅ **AI-Powered**: Content analysis using GPT-4o-mini
✅ **Full Backup**: Export → Delete → Reinstall → Import = Complete restoration
✅ **Cross-Platform**: iOS, Android, Web

## Documentation

- `/app/docs/01_PROJECT_PLAN.md` - Complete project plan
- `/app/docs/02_UI_UX_DESIGN_SYSTEM.md` - Design system
- `/app/docs/03_SYSTEM_DESIGN.md` - Technical architecture
- `/app/docs/04_FUTURE_DEVELOPMENT.md` - Roadmap
- `/app/docs/05_COMPLETE_TECHNICAL_DOCS.md` - API & code docs
- `/app/docs/06_IMPLEMENTATION_STATUS.md` - Current status

## Support

Check backend status: `sudo supervisorctl status`
View logs: `tail -f /var/log/supervisor/backend.err.log`

*Built for lifelong learners*
