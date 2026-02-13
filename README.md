# Beast Back Office

A web-based command center for human-AI interaction with Beast.
Uses **Tailscale Funnel** for stable connection + **Supabase** for message persistence.

Based on the architecture from [Buhdi's Two-Way Comms Guide](https://buhdi.dev).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ INTERNET                                                    │
│                                                             │
│  ┌──────────────┐      ┌──────────────────────────────┐     │
│  │  Vercel      │ POST │  Tailscale Funnel            │     │
│  │  (Website)   │─────▶│  your-machine.tailXXXX.ts.net│     │
│  │              │      └──────────────┬───────────────┘     │
│  │ api/comms    │                     │                     │
│  └──────┬───────┘                     │ Proxies to          │
│         │                             │ localhost:18789     │
│         │                             ▼                     │
│         │      ┌───────────────────────────────────────┐    │
│         │      │ OpenClaw Gateway (localhost:18789)    │    │
│         │      │ AI Agent reads/writes via webhooks    │    │
│         │      └──────────────────┬────────────────────┘    │
│         │                         │                         │
│         │    ┌────────────────────┘                         │
│         │    │ Replies posted here                          │
│         ▼    ▼                                              │
│  ┌─────────────────┐                                        │
│  │ Supabase        │                                        │
│  │ messages table  │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User sends message on website
2. Vercel function (`api/comms`) saves message to Supabase
3. Vercel function ALSO sends webhook to OpenClaw via Tailscale Funnel
4. OpenClaw receives webhook instantly, wakes the AI agent
5. AI agent processes and replies via `scripts/reply.py` to Supabase
6. Website polls Supabase and displays the reply

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Tailscale Funnel (On Your Local Machine)

**Chromebook/Linux:**
```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale (opens browser to authenticate)
sudo tailscale up

# Enable Funnel (creates stable public URL)
sudo tailscale funnel 18789

# Get your Funnel URL
tailscale funnel status
```

You'll get a URL like: `https://your-machine.tailXXXXX.ts.net`

**This URL never changes** — unlike ngrok free tier!

### 3. Configure OpenClaw

Edit `~/.openclaw/openclaw.json`:

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "auto",
    "auth": {
      "mode": "password",
      "password": "YOUR_STRONG_PASSWORD"
    },
    "tailscale": {
      "mode": "funnel",
      "resetOnExit": false
    }
  },
  "hooks": {
    "enabled": true,
    "path": "/hooks",
    "token": "YOUR_STRONG_PASSWORD"
  }
}
```

Restart OpenClaw:
```bash
openclaw gateway restart
```

### 4. Set Up Supabase

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

Quick version:
1. Create project at [supabase.com](https://supabase.com)
2. Create `messages` table with columns: `id`, `content`, `sender`, `session_key`, `created_at`
3. Enable RLS policies for reading/inserting
4. Get your **service_role key** (not anon key!)

### 5. Configure Environment Variables

In Vercel dashboard or `.env.local`:

```env
# OpenClaw connection via Tailscale Funnel
OPENCLAW_WEBHOOK_URL=https://your-machine.tailXXXXX.ts.net
OPENCLAW_WEBHOOK_PASSWORD=YOUR_STRONG_PASSWORD

# Supabase connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Use the **service_role key**, not the anon key.

### 6. Deploy

```bash
npm run build
vercel --prod
```

Or push to GitHub and let Vercel auto-deploy.

---

## Reply Script

To let Beast respond back to the website, use the reply script:

```bash
# Set credentials first
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your-service-key

# Send a reply
python scripts/reply.py "Hello! This is Beast responding."

# Or with custom sender name
python scripts/reply.py "Hello!" "Beast 🐺"
```

Or store credentials in `~/.openclaw/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing

1. **Open your website** in a browser
2. **Send a test message** (e.g., "Hello Beast!")
3. **Check Vercel logs** — should show webhook sent successfully
4. **Check OpenClaw** — should receive the webhook instantly
5. **Reply via script:**
   ```bash
   python scripts/reply.py "Hello! How can I help you?"
   ```
6. **Website shows reply** within 3 seconds (polling interval)

---

## Troubleshooting

### "Gateway Unreachable" or 500 errors
- Check `tailscale funnel status` — is Funnel running?
- Verify `OPENCLAW_WEBHOOK_URL` matches your Tailscale URL
- Check that `hooks.enabled: true` in OpenClaw config

### Messages not saving to Supabase
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` env vars
- Check that you're using **service_role key** (not anon key)
- Check RLS policies allow service_role to insert

### Webhook returns 401
- Password in Vercel env vars must match OpenClaw config
- Check `Authorization: Bearer YOUR_PASSWORD` header is being sent

### Works locally but not from Vercel
- Tailscale Funnel may need a moment to propagate
- Try again in 60 seconds
- Check firewall isn't blocking outbound HTTPS from Vercel

### Can't connect to Tailscale
- Run `sudo tailscale up` to re-authenticate
- Check [Tailscale admin console](https://login.tailscale.com/admin/machines)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENCLAW_WEBHOOK_URL` | Tailscale Funnel URL (e.g., `https://machine.tailXXXX.ts.net`) | ✅ Yes |
| `OPENCLAW_WEBHOOK_PASSWORD` | Password for OpenClay webhook auth | ✅ Yes |
| `SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (NOT anon key!) | ✅ Yes |
| `OPENCLAW_TIMEOUT` | Request timeout in ms | No (default: 5000) |

---

## Advantages Over ngrok

| Feature | ngrok Free | Tailscale Funnel |
|---------|-----------|------------------|
| URL changes | Every restart | Never |
| URL format | Random string | Your machine name |
| Connection limit | 40/minute | Unlimited |
| HTTPS | ✅ Yes | ✅ Yes |
| Cost | Free (limited) | Free |
| Setup complexity | Simple | Medium |

---

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Tailscale Funnel** (stable tunnel)
- **Supabase** (database)
- **OpenClaw Gateway API**

---

## License

Private - For Beast use only
