# Polymath OS - UI/UX Design System

> **Note**: This document describes the original v1 design system. The app has been revamped to use a **Brutalist Architect Design System (v2)** with 3 themes (Void/Nova/Amber), custom components, and responsive layouts. See `docs/UI_REVAMP_PLAN.md`, `docs/WEB_DESKTOP_REVAMP_PLAN.md`, and `docs/DESIGN_ANALYSIS_REPORT.md` for the current design specification. The theme tokens are defined in `frontend/theme/tokens.ts` (mobile) and `web/src/app/globals.css` (web).

## Design Philosophy

### Core Principles
1. **Mobile-First**: Every interaction optimized for thumb reach and one-handed use
2. **Data-Centric**: Information hierarchy that prioritizes learning insights
3. **Progressive Disclosure**: Show essentials, reveal details on demand
4. **Gesture-Driven**: Natural swipes, taps, and scrolls
5. **Consistent & Predictable**: Patterns repeated across screens

## Color System

### Base Colors (Dark Theme)
```javascript
const colors = {
  // Backgrounds
  background: '#0f172a',      // Primary background
  surface: '#1e293b',         // Cards, headers
  elevated: '#334155',        // Modals, overlays
  
  // Text
  textPrimary: '#ffffff',     // Headings, important text
  textSecondary: '#e2e8f0',   // Body text
  textTertiary: '#94a3b8',    // Supporting text
  textMuted: '#64748b',       // Timestamps, meta info
  
  // Brand & Actions
  primary: '#6366f1',         // Primary actions, active states
  success: '#10b981',         // Success states, journals
  warning: '#f59e0b',         // Warnings, connections
  danger: '#ef4444',          // Delete, errors
  accent: '#ec4899',          // Import, special actions
  
  // Semantic
  border: '#334155',          // Card borders
  divider: '#1e293b',         // Section dividers
};
```

### Category Colors
```javascript
const categoryColors = {
  'AI': '#8b5cf6',           // Purple
  'News': '#3b82f6',         // Blue
  'Tools': '#10b981',        // Green
  'Market': '#f59e0b',       // Amber
  'Research': '#ec4899',     // Pink
  'Tutorial': '#06b6d4',     // Cyan
  'Other': '#6b7280',        // Gray
};
```

## Typography

### Font Scale
```javascript
const typography = {
  // Headlines
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: 'bold', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  
  // Body
  body: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
  
  // UI Elements
  button: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600' },
};
```

### Font Family
- System default: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- Ensures native feel on each platform

## Spacing System (8pt Grid)

```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};
```

## Component Library

### 1. Cards

#### Activity Card
```javascript
style = {
  backgroundColor: '#1e293b',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#334155',
  marginBottom: 12,
}
```
- **Usage**: Display activities, journals, connections
- **Features**: Header, body, footer sections
- **Interactive**: Tap to expand or navigate

#### Stat Card
```javascript
style = {
  flex: 1,
  backgroundColor: '#1e293b',
  borderRadius: 16,
  padding: 16,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#334155',
}
```
- **Usage**: Dashboard statistics
- **Features**: Icon, large number, label
- **Layout**: 3-column grid on mobile

### 2. Buttons

#### Primary Button
```javascript
style = {
  backgroundColor: '#6366f1',
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
}
```
- **Min Touch Target**: 44x44 points (iOS) / 48x48 (Android)
- **States**: Default, pressed, disabled
- **Feedback**: Subtle scale animation on press

#### Icon Button
```javascript
style = {
  padding: 8,
  minWidth: 44,
  minHeight: 44,
  justifyContent: 'center',
  alignItems: 'center',
}
```
- **Usage**: Headers, secondary actions
- **Size**: 24x24 icon in 44x44 touch target

### 3. Inputs

#### Text Input
```javascript
style = {
  backgroundColor: '#0f172a',
  borderRadius: 12,
  padding: 16,
  fontSize: 16,
  color: '#fff',
  borderWidth: 1,
  borderColor: '#334155',
}
```
- **States**: Default, focused, error, disabled
- **Focus**: Border changes to primary color

#### Text Area
```javascript
style = {
  height: 120-200,
  textAlignVertical: 'top',
  // ... inherits from text input
}
```
- **Usage**: Journal content, notes
- **Features**: Multiline, auto-grow

### 4. Badges & Tags

#### Category Badge
```javascript
style = {
  backgroundColor: dynamicColor,  // Based on category
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
}
```
- **Dynamic Colors**: Based on category
- **Text**: Always white, bold, uppercase

#### Tag Chip
```javascript
style = {
  backgroundColor: '#334155',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
}
```
- **Usage**: Journal tags
- **Prefix**: # symbol
- **Color**: Primary accent

### 5. Modals

#### Bottom Sheet Modal
```javascript
style = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  }
}
```
- **Animation**: Slide up from bottom
- **Dismissal**: Tap outside or close button
- **Usage**: Add activity, add journal

#### Center Modal
```javascript
style = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
  }
}
```
- **Usage**: Import confirmation, alerts
- **Features**: Icon, title, description, action

## Layout Patterns

### 1. Screen Structure
```
┌─────────────────────────┐
│ Header (Fixed)          │
├─────────────────────────┤
│                         │
│ Scrollable Content      │
│                         │
│                         │
└─────────────────────────┘
│ Tab Bar (Fixed)         │
└─────────────────────────┘
```

### 2. Card Layouts

#### List Card
```
┌─────────────────────────┐
│ Title              [Badge]│
│ Subtitle or meta          │
│ ─────────────────────    │
│ Footer      [Icon]       │
└─────────────────────────┘
```

#### Stat Card
```
┌──────────┐
│  [Icon]  │
│   123    │
│  Label   │
└──────────┘
```

## Navigation Architecture

### Tab Navigation (Primary)
```
Dashboard → Overview, stats, recent items
Activities → Add, list, upload
Journal → Create, view entries
Connections → Timeline, graph, suggestions
Export → Export formats, import
```

### Modal Navigation (Secondary)
- Add Activity: Bottom sheet
- Add Journal: Bottom sheet
- Import Data: Center modal
- Confirmation Dialogs: Alert

### Information Architecture
```
App Root
├── Dashboard (Home)
│   ├── Stats Overview
│   ├── Category Distribution
│   └── Recent Activities
├── Activities
│   ├── Activity List
│   ├── Add Manual (Modal)
│   └── Upload File
├── Journal
│   ├── Journal List
│   └── Create Entry (Modal)
├── Connections
│   ├── Timeline View
│   ├── Graph View
│   └── AI Suggestions
└── Export
    ├── Export Options
    └── Import/Restore
```

## Interaction Patterns

### 1. Touch Targets
- **Minimum**: 44x44 points (iOS) / 48x48 (Android)
- **Buttons**: 48px height minimum
- **Icons**: 24px with 8px padding minimum

### 2. Gestures
- **Tap**: Primary action, navigation
- **Long Press**: Context menu (future)
- **Swipe**: Delete item (future)
- **Pull to Refresh**: Reload data (future)

### 3. Feedback
- **Visual**: Color change, opacity
- **Loading**: Activity indicators
- **Success**: Alert with confirmation
- **Error**: Alert with clear message

## Screen-Specific UX

### Dashboard
**Purpose**: Quick overview and entry point

**UX Considerations**:
- Stats at top for immediate visibility
- Category distribution shows learning balance
- Recent items provide quick access
- Refresh button for manual sync

**Thumb Zone**:
- Critical actions (tabs) at bottom
- Stats in easy reach
- Scroll for detailed content

### Activities
**Purpose**: Input and manage learning activities

**UX Flow**:
1. View list of all activities (chronological)
2. Two input methods clearly visible (+ and upload)
3. Each activity shows category and timestamp
4. Clear visual hierarchy

**Input Methods**:
- **Manual**: Bottom sheet modal (doesn't lose context)
- **Upload**: File picker with format instructions
- **API**: Settings page (future)

### Journal
**Purpose**: Reflection and idea documentation

**UX Flow**:
1. List view shows title, preview, and tags
2. Add button prominent in header
3. Tags provide quick filtering (future)
4. Full content revealed on tap (future detail view)

**Writing Experience**:
- Large text area (200px height)
- Tag input with comma separation
- Save button always accessible
- Auto-save (future)

### Connections
**Purpose**: Discover relationships and insights

**Tab Organization**:
1. **Timeline**: Chronological journey (entry point)
2. **Graph**: Relationship network (exploratory)
3. **Suggestions**: AI guidance (actionable)

**UX Considerations**:
- Timeline shows all activities with generate button
- Graph shows existing connections only
- Suggestions require user action (prevents unwanted AI calls)
- Each view has distinct visual language

### Export
**Purpose**: Data ownership and portability

**UX Flow**:
1. Export options presented as cards
2. Each format explains its purpose
3. Import section clearly separated
4. Info box explains restoration capability

**Trust Building**:
- Clear format descriptions
- Success confirmations
- Warning before import
- Native share integration

## Component States

### Loading States
```javascript
// Full Screen
<ActivityIndicator size="large" color="#6366f1" />
<Text>Loading message...</Text>

// Inline
<ActivityIndicator color="#fff" /> // in button

// Skeleton (future)
Shimmer placeholders for cards
```

### Empty States
```javascript
<EmptyState>
  <Icon size={64} color="muted" />
  <Title>No {items} yet</Title>
  <Subtitle>Action suggestion</Subtitle>
</EmptyState>
```
- **Purpose**: Guide users to first action
- **Visual**: Large icon, clear messaging
- **Action**: Implicit CTA in subtitle

### Error States
```javascript
Alert.alert('Error', 'User-friendly message');
```
- **Native Alerts**: For errors and confirmations
- **Inline Errors**: Form validation (future)
- **Toast Messages**: Non-critical feedback (future)

## Responsive Behavior

### Mobile (Primary Target)
- Single column layouts
- Full-width cards
- Bottom navigation
- Modals from bottom

### Tablet (Adaptive)
- Two-column layouts where appropriate
- Larger touch targets
- Side navigation (future)
- Popover modals

### Breakpoints
```javascript
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};
```

## Accessibility

### Implemented
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Touch targets meet minimum size
- ✅ Logical navigation order
- ✅ Clear visual hierarchy

### To Implement
- ⏳ Screen reader labels
- ⏳ Reduced motion support
- ⏳ Dynamic text sizing
- ⏳ Voice control

## Animation & Motion

### Current Animations
- Modal slide-in (300ms ease)
- Tab transitions (instant)
- Loading spinners (continuous)

### Future Animations
- Card entry (stagger)
- Connection lines (draw)
- Success feedback (scale + fade)
- Pull-to-refresh (spring)

## Icons

### Icon Library
**Ionicons** from `@expo/vector-icons`

### Common Icons
```javascript
const icons = {
  // Navigation
  home: 'home',
  activities: 'list',
  journal: 'book',
  connections: 'git-network',
  export: 'download',
  
  // Actions
  add: 'add-circle',
  delete: 'trash',
  edit: 'pencil',
  share: 'share-social',
  upload: 'cloud-upload',
  
  // Status
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
  
  // Features
  timeline: 'time',
  graph: 'git-network',
  suggestions: 'sparkles',
  refresh: 'refresh',
};
```

### Icon Sizing
- **Nav Icons**: 24px
- **Action Icons**: 20-24px
- **Header Icons**: 28-32px
- **Empty State**: 64px
- **Decorative**: 16-20px

## Form Design

### Input Fields
- **Label above input**: Clear association
- **Required indicators**: * after label
- **Placeholder text**: Example or instruction
- **Helper text**: Below input (future)
- **Error messages**: Below input, red text

### Form Layout
```
┌─────────────────────────┐
│ Title *                 │
│ ┌─────────────────────┐ │
│ │ Text input          │ │
│ └─────────────────────┘ │
│                         │
│ Notes (Optional)        │
│ ┌─────────────────────┐ │
│ │ Multiline text      │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   Submit Button     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Data Visualization

### Timeline View
```
● ─────────────────────
│ Activity Card
│ ├─ Title
│ ├─ Category
│ └─ Date
│
● ─────────────────────
│ Activity Card
│
● ─────────────────────
```
- **Visual Flow**: Top to bottom (recent to old)
- **Dots**: Primary color (#6366f1)
- **Line**: Muted gray (#334155)
- **Cards**: Standard card style

### Graph View
```
┌─────────────────────────┐
│ ● Activity A            │
│   ↓ [connection type]   │
│ ● Activity B            │
│ Reasoning: ...          │
└─────────────────────────┘
```
- **Nodes**: Colored dots (from=primary, to=success)
- **Edges**: Arrow with label
- **Reasoning**: Below connection in card

### Suggestions View
```
┌─────────────────────────┐
│ [P5]              💡    │
│ Suggestion Title        │
│ Reasoning text...       │
└─────────────────────────┘
```
- **Priority Badge**: Top left
- **Icon**: Top right (bulb)
- **Content**: Title + reasoning

## User Flows

### Flow 1: Add Manual Activity
1. Tap "Activities" tab
2. Tap "+" button in header
3. Bottom sheet modal appears
4. Fill: Title (required), URL (optional), Notes (optional)
5. Tap "Add Activity"
6. Loading indicator in button
7. Success alert
8. Modal closes
9. New activity appears at top of list (with AI category)

**Time**: ~30 seconds
**Touches**: 4 (tab, +, input focus x2, submit)

### Flow 2: Create Journal Entry
1. Tap "Journal" tab
2. Tap "+" button
3. Bottom sheet modal appears
4. Fill: Title, Content, Tags (comma-separated)
5. Tap "Save Entry"
6. Success alert
7. Entry appears in list with formatted tags

**Time**: ~60 seconds (writing time)
**Touches**: 5 (tab, +, input focus x3, submit)

### Flow 3: Generate Connections
1. Tap "Connections" tab
2. "Timeline" view loads by default
3. Scroll through activities
4. Tap "Generate Connections" on an activity
5. Loading indicator
6. Success message
7. Switch to "Graph" tab
8. View generated connections

**Time**: ~20 seconds (+ AI processing)
**Touches**: 4 (tab, scroll, generate, switch tab)

### Flow 4: Export Data
1. Tap "Export" tab
2. Choose format (JSON/Markdown/CSV)
3. Tap export card
4. Loading indicator
5. Native share sheet appears
6. Select destination (AirDrop, Drive, etc.)
7. Success confirmation

**Time**: ~15 seconds
**Touches**: 3 (tab, format, destination)

### Flow 5: Restore from Backup
1. Tap "Export" tab
2. Tap "Import JSON Backup" card
3. Warning modal appears
4. Tap "Select JSON File"
5. File picker opens
6. Select file
7. Processing...
8. Success alert with import counts
9. Navigate to Dashboard to see restored data

**Time**: ~30 seconds
**Touches**: 5 (tab, import, confirm, select, navigate)

## Performance Optimizations

### Rendering
- ✅ FlatList for long lists (not needed yet)
- ✅ Pagination on backend (skip/limit)
- ⏳ Memoization for heavy components
- ⏳ Image lazy loading

### Data Loading
- ✅ Initial load on screen mount
- ✅ Parallel API calls where possible
- ⏳ Incremental loading
- ⏳ Cache with AsyncStorage

### Bundle Size
- ✅ Only essential libraries
- ⏳ Code splitting by route
- ⏳ Image optimization

## Error Prevention

### Form Validation
- Required field checks
- Format validation (URLs)
- Character limits (future)
- Real-time feedback (future)

### Confirmation Dialogs
- Before delete operations (future)
- Before import (existing)
- Before destructive actions

### Graceful Degradation
- AI fails → Default categorization
- Network fails → Show cached data (future)
- Parse fails → Clear error message

## Design Tokens

```javascript
export const designTokens = {
  colors: { /* see Color System */ },
  spacing: { /* see Spacing System */ },
  typography: { /* see Typography */ },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
};
```

## Consistency Guidelines

### Do's ✅
- Use design tokens for all styling
- Maintain 8pt spacing grid
- Keep touch targets above minimums
- Use native components
- Follow established patterns
- Test on multiple screen sizes

### Don'ts ❌
- Don't use arbitrary spacing values
- Don't create one-off component styles
- Don't use web-only libraries
- Don't ignore loading states
- Don't skip error handling
- Don't use fixed positioning for content

## Mobile-First Considerations

### Thumb Zones
```
┌─────────────────────────┐
│ Hard to Reach           │  ← Avoid critical actions
│                         │
│ Natural Zone            │  ← Primary content
│                         │
│ Easy to Reach           │  ← Main navigation
└─────────────────────────┘
```

### One-Handed Use
- Tab bar at bottom (easy thumb reach)
- Primary actions in headers (reachable)
- Scroll for detailed content
- Modal actions at bottom

### Context Preservation
- Bottom sheets preserve context
- Modals dim background (shows where you came from)
- Navigation maintains state
- Smooth transitions

## Future UX Enhancements

1. **Onboarding**: First-time user tutorial
2. **Search**: Quick find across all data
3. **Filters**: Advanced filtering by category, date, source
4. **Sort Options**: Multiple sort criteria
5. **Swipe Actions**: Quick delete/edit
6. **Pull to Refresh**: Manual data reload
7. **Offline Mode**: Work without connection
8. **Dark/Light Mode Toggle**: User preference
9. **Haptic Feedback**: Touch response
10. **Animations**: Delightful micro-interactions

## Agent Memory Screen Design

### Purpose
View and manage AI agent's long-term memory system that learns from user data over time.

### Three Sub-Views

#### 1. Memories Tab
- Memory list with type badges (short-term, long-term, insight, pattern)
- Importance visualization (progress bar 0-100%)
- Access count display
- Delete button per memory
- Stats overview: Total memories, breakdown by type
- Action buttons: Learn from Data, Consolidate, Chat

#### 2. Persona Tab  
- Agent profile display (name, role)
- Focus areas as tag chips
- Behavior traits as tag chips
- Custom instructions in text box
- Edit button opens modal
- Last updated timestamp

#### 3. Learning Tab
- Learning progression log (chronological)
- Each entry shows: Insight, source, timestamp
- Visualize agent intelligence growth
- Icon: Bulb for each learning event

### Memory Card Design
```
┌─────────────────────────────────┐
│ [TYPE BADGE]            [🗑️]   │
│ Memory content text...          │
│ ▓▓▓▓▓░░░░░░ 60% importance      │
│ Accessed: 5x • Jan 15, 2025     │
└─────────────────────────────────┘
```

### Action Buttons Layout
```
┌──────────┬──────────┬──────────┐
│  Learn   │Consolidate│   Chat   │
│  [⚡]    │   [📚]    │  [💬]   │
└──────────┴──────────┴──────────┘
```

### Color System for Memory Types
- Short-term: #3b82f6 (Blue) - Temporary, recent
- Long-term: #10b981 (Green) - Consolidated, permanent
- Insights: #f59e0b (Amber) - Extracted patterns
- Patterns: #ec4899 (Pink) - Recurring themes

### Importance Indicator
- 0-30%: Low (muted gray bar)
- 31-70%: Medium (blue bar)
- 71-100%: High (indigo bar with glow)

### Chat Interface
- Modal with chat input at bottom
- Agent response in card with icon
- Shows: memories_used count
- Personality matches persona configuration

