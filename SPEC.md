# Beast Back Office - Product Specification

## Overview
A web-based command center for human-AI interaction. The human accesses Beast through a web interface with real-time communication, system monitoring, and file sharing capabilities.

## Core Philosophy
- **Two-way communication**: Human talks to Beast, Beast talks back
- **Always-on visibility**: System stats, costs, agent status at a glance
- **Rich interactions**: Text, voice, files, images — whatever the human needs
- **Remote capable**: Access Beast from anywhere (like Kriz in Utah talking to Buhdi in Denver)

---

## Feature Specifications

### 1. Dashboard Overview
**Purpose**: At-a-glance system health and activity

**Components**:
- **Token Usage Card**: Current session cost, daily/weekly spend, budget remaining
- **Agent Roster**: List of active agents, their status, last activity
- **System Status**: Gateway health, channel connectivity (Telegram, etc.)
- **Recent Activity**: Last 5-10 interactions across all channels
- **Quick Stats**: Messages sent, files processed, uptime

**Data Sources**:
- OpenClaw gateway status API
- Session history
- Token usage tracking (if available)

---

### 2. Chat Interface
**Purpose**: Primary communication channel between human and Beast

**Features**:
- **Real-time messaging**: WebSocket or polling for instant updates
- **Message threading**: Context-aware conversation history
- **Multi-channel view**: See messages from all channels (Telegram, webchat, etc.)
- **Typing indicators**: Show when Beast is processing
- **Message actions**: Copy, delete, bookmark important messages

**Input Methods**:
- Text input with send button
- Voice input (microphone access)
- File attachment drag-and-drop
- Image paste/upload

---

### 3. System Monitoring
**Purpose**: Track costs, performance, and health

**Token Costs**:
- Real-time cost display for current session
- Historical cost charts (daily/weekly/monthly)
- Model breakdown (which models cost what)
- Budget alerts (configurable thresholds)

**Agent Roster**:
- List all spawned agents
- Their current status (active, idle, completed)
- Quick actions (view logs, terminate)
- Agent purpose/task summary

**Gateway Health**:
- OpenClaw gateway status
- Channel connectivity indicators
- Recent errors/warnings
- Version info

---

### 4. File & Media Management
**Purpose**: Share files, images, and documents with Beast

**Features**:
- **Upload**: Drag-and-drop or click to select
- **Supported types**: Images (jpg, png, gif), documents (pdf, txt, md), code files
- **Preview**: Thumbnails for images, icons for documents
- **History**: Recently shared files
- **Download**: Get files Beast has generated

---

### 5. Voice Communication
**Purpose**: Hands-free interaction with Beast

**Features**:
- **Voice input**: Record and send voice messages (convert to text via STT)
- **Voice output**: Beast responses read aloud via TTS
- **Voice settings**: Select voice, speed, pitch
- **Push-to-talk**: Optional hold-to-record mode
- **Auto-play**: Optionally auto-read all responses

---

### 6. Session Management
**Purpose**: Control and monitor active sessions

**Features**:
- **Active sessions**: See what's running
- **Session history**: Browse past conversations
- **Session controls**: Pause, resume, terminate
- **Context view**: See what Beast knows about current task

---

## Technical Architecture

### Frontend Stack (Already Initialized)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State**: React hooks + Context (or Zustand if needed)

### Backend Integration
- **OpenClaw Gateway**: REST API for session control, messaging
- **WebSocket**: Real-time updates from gateway
- **Memory API**: Persistent storage for preferences, history
- **GitHub API**: Repo access, file operations

### Data Flow
```
Human → Back Office UI → OpenClaw Gateway → Beast
                         ↓
                   Memory API (persistence)
```

---

## API Endpoints Needed

### OpenClaw Gateway
- `GET /status` - System status
- `GET /sessions` - List sessions
- `POST /sessions/:id/message` - Send message
- `GET /sessions/:id/history` - Get history
- `POST /spawn` - Spawn new agent

### Memory API
- `GET /api/memory/context` - Search context
- `POST /api/memory/entities` - Store facts
- `GET /api/memory/entities` - List entities

### Vercel (Optional)
- Deploy status
- Build logs
- Domain management

---

## UI/UX Requirements

### Layout
- **Sidebar**: Navigation (Dashboard, Chat, Agents, Files, Settings)
- **Main content**: Dynamic based on route
- **Status bar**: Connection status, current session info

### Responsive
- Desktop-first (primary use case)
- Tablet support
- Mobile: basic chat functionality

### Theme
- Dark mode default (easier on eyes for long sessions)
- Light mode toggle
- Accent color: match Beast branding

---

## Security Considerations
- **Authentication**: Vercel password protection or custom auth
- **Token storage**: Tokens in `.env`, never exposed to client
- **HTTPS only**: All API calls over SSL
- **CORS**: Properly configured for domain

---

## Deployment
- **Platform**: Vercel (already have token)
- **Domain**: Custom or vercel.app subdomain
- **Environment variables**:
  - `OPENCLAW_GATEWAY_URL`
  - `MEMORY_API_KEY`
  - `GITHUB_TOKEN` (for file operations)

---

## Phase 1 MVP (Minimum Viable Product)
1. Basic chat interface with Beast
2. Session history display
3. Simple token cost tracking (manual or via API)
4. File upload/download
5. Dark mode UI

## Phase 2 Enhancements
1. Voice input/output
2. Real-time dashboard with charts
3. Agent roster with controls
4. Multi-channel message view
5. Mobile responsiveness

## Phase 3 Polish
1. Advanced analytics
2. Custom themes
3. Keyboard shortcuts
4. Notification system
5. Integration with more services

---

## Open Questions
1. Does OpenClaw expose a WebSocket for real-time updates, or do we poll?
2. Is there a built-in token cost API, or do we track manually?
3. Should the back office run as a separate agent or connect to existing sessions?
4. Voice: browser Web Speech API or external service?
5. Authentication: simple password or full auth system?

---

## References
- Buhdi's back office (working example to study)
- OpenClaw documentation: /usr/lib/node_modules/openclaw/docs
- Memory API: https://memory-api-one.vercel.app

---

*Spec created by Beast based on requirements from Kriz (father) via c4ntTouchthis2025*
