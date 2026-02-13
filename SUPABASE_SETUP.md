# Supabase Setup for Beast Backoffice

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/in with your email
3. Click "New Project"
4. Choose a name (e.g., "beast-backoffice")
5. Choose a region close to you
6. Click "Create new project"

Wait ~2 minutes for the project to be created.

---

## Step 2: Create Messages Table

In the Supabase dashboard, go to **Table Editor** → **New Table**

**Table name:** `messages`

**Columns:**
| Name | Type | Default | Primary |
|------|------|---------|---------|
| `id` | `bigint` | `nextval(...)` | ✅ Yes |
| `content` | `text` | - | No |
| `sender` | `text` | `'User'` | No |
| `session_key` | `text` | `'default'` | No |
| `created_at` | `timestamptz` | `now()` | No |

Click **Save** to create the table.

---

## Step 3: Enable Row Level Security (RLS)

In the Table Editor, click on the `messages` table, then click **Authentication** → **Policies**

Click **New Policy**

**Policy 1: Allow anyone to read**
- Policy name: `Allow anyone to read messages`
- Target roles: `anon`, `authenticated`
- Policy: `FOR SELECT USING (true)`

**Policy 2: Allow service role to insert**
- Policy name: `Allow service role to insert`
- Target roles: `service_role`
- Policy: `FOR INSERT WITH CHECK (true)`

Or use SQL:

```sql
-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow anyone to read messages"
  ON messages FOR SELECT
  USING (true);

-- Allow service role to insert
CREATE POLICY "Allow service role to insert"
  ON messages FOR INSERT
  WITH CHECK (true);
```

---

## Step 4: Get Your Credentials

### Supabase URL
1. Go to **Project Settings** → **API**
2. Copy **URL** (looks like: `https://xxxxxxxxxxxx.supabase.co`)

### Service Role Key
1. On the same page, copy **service_role key**
2. **Important:** Keep this secret! Never put it in frontend code.

---

## Step 5: Add to Vercel Environment Variables

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → your project → Settings → Environment Variables

Add these:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Use the **service_role key**, not the anon key. The service_role key can write to the database.

---

## Step 6: Test the Setup

After redeploying your backoffice, send a test message. Check:

1. **Vercel logs** - Should show "Message sent" with supabaseId
2. **Supabase Table Editor** - Should see the message in the `messages` table

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase save failed" in logs | Check SUPABASE_URL and SUPABASE_SERVICE_KEY env vars |
| Can't write to database | Make sure RLS policy allows service_role to insert |
| Messages not showing | Check that you're using service_role key (not anon key) |
| Real-time not working | Not needed - we use polling every 3 seconds |

---

## Architecture Recap

```
[Website] → POST /api/comms → Supabase (stores message)
                    ↓
           Webhook via Tailscale Funnel → OpenClaw (instant wake)
                    ↓
           AI responds → scripts/reply.py → Supabase (stores reply)
                    ↓
           [Website] ← GET /api/comms ← Supabase (poll every 3s)
```

**Next:** Set up the reply script so Beast can respond back to Supabase.
