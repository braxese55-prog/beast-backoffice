# Beast Back Office

A web-based command center for human-AI interaction with Beast.

## Quick Start (Local Development)

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment to Vercel (Critical Setup Required)

### The Problem
When deployed to Vercel, the app cannot reach your local OpenClaw gateway at `127.0.0.1:18789`. You must expose your local gateway using a tunnel.

### Solution: ngrok Tunnel

1. **Install ngrok**
   ```bash
   # macOS
   brew install ngrok
   
   # Linux
   snap install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your OpenClaw gateway locally**
   ```bash
   openclaw gateway start
   # or however you normally start it
   ```

3. **Start ngrok tunnel**
   ```bash
   ngrok http 18789
   ```

4. **Copy the HTTPS URL**
   You'll see something like:
   ```
   Forwarding  https://abc123-def456.ngrok.io -> http://localhost:18789
   ```
   Copy `https://abc123-def456.ngrok.io`

5. **Set Environment Variable in Vercel**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `OPENCLAW_GATEWAY_URL` = `https://abc123-def456.ngrok.io`
   - Redeploy your app

6. **Keep ngrok running**
   The tunnel must stay open for the backoffice to work. If you restart ngrok, you'll get a new URL and need to update the environment variable.

### Alternative: Static ngrok Domain (Paid)
If you have ngrok Pro, you can reserve a static domain so the URL doesn't change:
```bash
ngrok http 18789 --domain=your-static-domain.ngrok.io
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCLAW_GATEWAY_URL` | URL of your OpenClaw gateway | `http://127.0.0.1:18789` |
| `OPENCLAW_TIMEOUT` | Request timeout in milliseconds | `5000` |
| `VERCEL_DEPLOY_HOOK` | Optional deploy hook URL | - |

See `.env.example` for a template.

## Troubleshooting

### "Gateway Unreachable" Error
- Make sure your OpenClaw gateway is running locally
- Make sure ngrok is running and the URL is correct
- Check that `OPENCLAW_GATEWAY_URL` is set in Vercel dashboard
- Try redeploying after setting the environment variable

### "ECONNREFUSED 127.0.0.1:18789"
This means the app is trying to connect to localhost from Vercel's servers. You MUST use ngrok and set `OPENCLAW_GATEWAY_URL`.

### ngrok Connection Issues
- Free ngrok accounts get random URLs each time (update env var)
- ngrok free tier has connection limits
- Make sure your firewall allows ngrok connections

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vercel App    │────▶│   ngrok      │────▶│  Your Computer  │
│  (Next.js)      │     │   Tunnel     │     │ (OpenClaw:18789)│
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Features

- Real-time session monitoring
- Message history
- Gateway status dashboard
- Multi-channel support (Telegram, Webchat)

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- OpenClaw Gateway API

## License

Private - For Beast use only
