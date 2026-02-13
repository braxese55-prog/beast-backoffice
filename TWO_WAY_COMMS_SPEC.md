# Beast Back Office - Two-Way Communication System Specification

## Document Information
- **Title:** Two-Way Comms Architecture: Website ↔ OpenClaw via Tailscale Funnel
- **Version:** 1.0
- **Date:** February 12, 2026
- **Authors:** Based on Buhdi/Kriz architecture (buhdi.dev)
- **Status:** Implementation Complete

---

## Executive Summary

This specification defines the architecture for instant two-way communication between a web-based backoffice dashboard (hosted on Vercel) and a local OpenClaw AI agent. The system uses **Tailscale Funnel** for stable tunneling and **Supabase** for message persistence, eliminating the need for frequently-changing URLs (as with ngrok free tier).

**Key Improvement:** Response time drops from up to 30 minutes (heartbeat polling) to seconds (instant webhook wake).

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│ INTERNET                                                    │
│                                                             │
│  ┌──────────────┐      ┌──────────────────────────────┐     │
│  │  Website     │ POST │  Tailscale Funnel            │     │
│  │  (Vercel)    │─────▶│  your-machine.tailXXXX.ts.net│     │
│  │              │      └──────────────┬───────────────┘     │
│  │ api/comms    │                     │                     │
│  └──────┬───────┘                     │ Proxies to          │
│         │                             │ localhost:18789     │
│         │                             ▼                     │
│         │      ┌───────────────────────────────────────┐    │
│         │      │ OpenClaw Gateway (localhost:18789)    │    │
│         │      │ AI Agent processes message            │    │
│         │      └──────────────────┬────────────────────┘    │
│         │                         │                         │
│         │    ┌────────────────────┘                         │
│         │    │ AI posts reply                               │
│         ▼    ▼                                              │
│  ┌─────────────────┐                                        │
│  │ Supabase        │                                        │
│  │ messages table  │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction

| Step | From | To | Method | Purpose |
|------|------|-----|--------|---------|
| 1 | Website | Vercel Function | POST /api/comms | Send message |
| 2 | Vercel Function | Supabase | INSERT | Persist message |
| 3 | Vercel Function | OpenClaw | POST /hooks/wake | Instant wake |
| 4 | OpenClaw | Supabase | INSERT (via script) | Post reply |
| 5 | Website | Supabase | SELECT (poll) | Get replies |

---

## Technical Specifications

### 1. Tailscale Funnel Configuration

**Purpose:** Provide a stable, HTTPS public endpoint for the local OpenClaw gateway.

**Configuration:**
```bash
# Enable funnel on port 18789 (OpenClaw default)
tailscale funnel 18789

# Result: https://{machine-name}.{tailnet}.ts.net
# This URL never changes (unlike ngrok free tier)
```

**Advantages over ngrok:**
| Feature | ngrok Free | Tailscale Funnel |
|---------|-----------|------------------|
| URL Stability | Changes every restart | Permanent |
| URL Format | Random (abc123.ngrok.io) | Readable (machine.tailnet.ts.net) |
| Rate Limits | 40 requests/min | Unlimited |
| HTTPS | Yes | Yes |
| Cost | Free (limited) | Free |

### 2. OpenClaw Gateway Configuration

**File:** `~/.openclaw/openclaw.json`

**Required Settings:**
```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "auto",
    "auth": {
      "mode": "password",
      "password": "${OPENCLAW_WEBHOOK_PASSWORD}"
    },
    "tailscale": {
      "mode": "funnel",
      "resetOnExit": false
    }
  },
  "hooks": {
    "enabled": true,
    "path": "/hooks",
    "token": "${OPENCLAW_WEBHOOK_PASSWORD}"
  }
}
```

**Security Notes:**
- Password must be strong (32+ characters recommended)
- Same password used for gateway auth and webhook token
- Webhook endpoint only accepts POST to `/hooks/wake`

### 3. Supabase Database Schema

**Table:** `messages`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint` | No | `nextval(...)` | Primary key, auto-increment |
| `content` | `text` | No | - | Message text (max 10,000 chars) |
| `sender` | `text` | No | `'User'` | 'User' or 'Beast' |
| `session_key` | `text` | No | `'default'` | Conversation identifier |
| `created_at` | `timestamptz` | No | `now()` | Timestamp |

**Row Level Security (RLS):**
```sql
-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for website polling)
CREATE POLICY "Allow anyone to read messages"
  ON messages FOR SELECT USING (true);

-- Allow service role to insert (for Vercel function)
CREATE POLICY "Allow service role to insert"
  ON messages FOR INSERT WITH CHECK (true);
```

### 4. Vercel API Endpoint

**File:** `src/app/api/comms/route.ts`

**Methods:**
- `POST` - Send message (saves to Supabase + sends webhook)
- `GET` - Fetch messages (for polling)
- `OPTIONS` - CORS preflight

**POST Request Body:**
```json
{
  "message": "string (required, max 10,000 chars)",
  "sessionKey": "string (optional, default: 'default')"
}
```

**POST Response:**
```json
{
  "success": true,
  "supabaseId": 123,
  "webhookSent": true
}
```

**Environment Variables:**
```
OPENCLAW_WEBHOOK_URL=https://machine.tailnet.ts.net
OPENCLAW_WEBHOOK_PASSWORD=secure-password
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 5. Webhook Payload

**Endpoint:** `POST https://machine.tailnet.ts.net/hooks/wake`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer ${OPENCLAW_WEBHOOK_PASSWORD}
```

**Body:**
```json
{
  "text": "[backoffice] User message here",
  "mode": "now",
  "metadata": {
    "source": "backoffice",
    "sessionKey": "backoffice-123",
    "supabaseId": 456
  }
}
```

### 6. Reply Script

**File:** `scripts/reply.py`

**Purpose:** Allow AI agent to post replies back to Supabase

**Usage:**
```bash
python scripts/reply.py "Hello! How can I help you?" "Beast"
```

**Credentials:** Loaded from `~/.openclaw/.env`:
```env
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## Data Flow Detailed

### Sending a Message (Website → OpenClaw)

1. **User submits message** on website
2. **Frontend** calls `POST /api/comms` with message content
3. **Vercel Function**:
   - Validates input
   - Inserts message into Supabase `messages` table
   - Sends webhook to OpenClaw via Tailscale Funnel
   - Returns success + Supabase ID + webhook status
4. **OpenClaw** receives webhook, wakes AI agent
5. **Frontend** shows message in UI immediately

### Receiving a Reply (OpenClaw → Website)

1. **AI agent** processes message
2. **Agent** calls `scripts/reply.py "Reply text"`
3. **Script** inserts reply into Supabase
4. **Website** polls `GET /api/comms` every 3 seconds
5. **New reply** appears in UI

---

## Error Handling

| Error Scenario | Response | Recovery |
|----------------|----------|----------|
| Supabase insert fails | Log error, continue with webhook | Webhook still attempts to wake OpenClaw |
| Webhook fails | Log error, return webhookSent: false | Message saved to Supabase, AI may see it on next heartbeat poll |
| OpenClaw offline | Webhook fails with connection error | User sees error, can retry |
| Invalid auth | 401 Unauthorized | Check password matches in Vercel and OpenClaw |
| Supabase read fails | Return 500 | Check service role key |

---

## Security Considerations

1. **Password Protection**
   - Gateway password is the only authentication
   - Use strong, unique password (32+ characters)
   - Same password for gateway auth and webhook token

2. **HTTPS Only**
   - Tailscale Funnel provides end-to-end HTTPS
   - No plaintext communication

3. **Service Role Key**
   - Never expose in frontend code
   - Only used in serverless functions and local scripts
   - Store in Vercel env vars and `~/.openclaw/.env`

4. **RLS Policies**
   - Anyone can read messages (required for polling)
   - Only service role can insert (prevents unauthorized writes)

5. **Webhook Scope**
   - Limited to `/hooks/wake` endpoint
   - Cannot access files, run commands, or access other endpoints
   - Only wakes AI agent with text message

---

## Performance Specifications

| Metric | Target | Notes |
|--------|--------|-------|
| Message delivery to Supabase | < 500ms | Database write |
| Webhook delivery to OpenClaw | < 2 seconds | Network round-trip |
| Reply visibility on website | < 6 seconds | 3-second polling interval × 2 |
| Total round-trip time | < 10 seconds | End-to-end with AI processing |

**Comparison to Heartbeat Polling:**
- Heartbeat: 15-30 minutes (depending on interval)
- Webhook: 2-10 seconds
- **Improvement: 90-180x faster**

---

## Deployment Checklist

- [ ] Tailscale installed and running on host machine
- [ ] Tailscale Funnel enabled (`tailscale funnel 18789`)
- [ ] OpenClaw configured with auth password and hooks enabled
- [ ] Supabase project created with `messages` table
- [ ] RLS policies configured for read/insert
- [ ] Vercel environment variables set (4 variables)
- [ ] Reply script credentials configured (`~/.openclaw/.env`)
- [ ] Test message sent successfully
- [ ] Reply script tested (`python scripts/reply.py "Test"`)
- [ ] Full round-trip verified

---

## Troubleshooting Guide

### Problem: Tailscale command not found
**Solution:**
```bash
sudo apt-get update
sudo apt-get install -y tailscale
sudo tailscale up
```

### Problem: Webhook returns 401
**Check:**
- Password in Vercel env var matches OpenClaw config
- `Authorization: Bearer` header format correct
- No extra spaces in password

### Problem: Message saved but no webhook
**Check:**
- `OPENCLAW_WEBHOOK_URL` set in Vercel
- URL format correct (no trailing slash issues)
- Redeploy after adding env vars

### Problem: AI responds but website doesn't show
**Check:**
- Supabase RLS allows SELECT for anon role
- Website polling `/api/comms` endpoint
- No JavaScript errors in browser console

### Problem: Can't write to Supabase
**Check:**
- Using service_role key (not anon key)
- RLS policy allows service_role to insert
- Key has not expired or been revoked

### Problem: Funnel URL not working
**Check:**
- `tailscale funnel status` shows active
- OpenClaw gateway running on port 18789
- Machine visible in Tailscale admin console
- ACL policy allows funnel (may need admin approval)

---

## Future Enhancements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Real-time Subscriptions | Use Supabase realtime instead of polling | Medium |
| Message Threading | Support reply-to and threaded conversations | Low |
| File Attachments | Allow images/documents in messages | Low |
| Typing Indicators | Show when AI is processing | Medium |
| Message History | Pagination for long conversations | Medium |
| Multiple Sessions | Support multiple concurrent chat sessions | Low |

---

## References

- **Original Architecture:** Buhdi's Two-Way Comms Setup Guide (buhdi.dev)
- **Tailscale Docs:** https://tailscale.com/kb/1223/funnel
- **OpenClaw Docs:** https://docs.openclaw.ai
- **Supabase Docs:** https://supabase.com/docs

---

## Appendix A: Environment Variable Reference

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `OPENCLAW_WEBHOOK_URL` | `https://machine.tailc88ef9.ts.net` | Yes | Tailscale Funnel endpoint |
| `OPENCLAW_WEBHOOK_PASSWORD` | `GUEST_pw2501!` | Yes | Gateway and webhook auth |
| `SUPABASE_URL` | `https://xyz123.supabase.co` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Yes | Service role (not anon!) |
| `OPENCLAW_TIMEOUT` | `5000` | No | Request timeout in ms |

---

## Appendix B: API Reference

### POST /api/comms
Send a message to the AI agent.

**Request:**
```json
{
  "message": "Hello Beast!",
  "sessionKey": "optional-conversation-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "supabaseId": 123,
  "webhookSent": true
}
```

**Response (400):**
```json
{ "error": "Message required" }
```

**Response (500):**
```json
{ "error": "Failed to process message" }
```

### GET /api/comms?sessionKey={key}&limit={n}
Fetch messages from a conversation.

**Parameters:**
- `sessionKey` (optional): Conversation identifier, default: 'default'
- `limit` (optional): Max messages to return, default: 50

**Response (200):**
```json
[
  {
    "id": "123",
    "content": "Hello!",
    "sender": "user",
    "timestamp": "2026-02-12T22:00:00Z"
  }
]
```

---

*Document Version: 1.0*
*Last Updated: February 12, 2026*
