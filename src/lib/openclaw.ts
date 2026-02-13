// OpenClaw API client
// For local development: http://127.0.0.1:18789
// For Vercel deployment: Use a tunnel (ngrok) and set OPENCLAW_GATEWAY_URL env var
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'

// Timeout for gateway requests (in milliseconds)
const GATEWAY_TIMEOUT = parseInt(process.env.OPENCLAW_TIMEOUT || '5000')

export interface Session {
  sessionKey: string
  agentId: string
  lastActivity: string
  messageCount: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface GatewayError {
  error: string
  details: string
  gatewayUrl: string
  timestamp: string
}

// Helper to make fetch requests with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function getSessions(): Promise<Session[] | GatewayError> {
  try {
    const res = await fetchWithTimeout(`${GATEWAY_URL}/api/sessions`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching sessions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to OpenClaw gateway'
    // Return error object instead of throwing
    return {
      error: 'Gateway Unreachable',
      details: errorMessage,
      gatewayUrl: GATEWAY_URL,
      timestamp: new Date().toISOString()
    }
  }
}

export async function getSessionHistory(sessionKey: string): Promise<Message[] | GatewayError> {
  const url = `${GATEWAY_URL}/api/sessions/${sessionKey}/history`
  console.log(`Fetching session history from: ${url}`)
  
  try {
    const res = await fetchWithTimeout(url, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log(`Response status: ${res.status}`)
    console.log(`Response content-type: ${res.headers.get('content-type')}`)
    
    if (!res.ok) {
      const text = await res.text()
      console.error(`HTTP error ${res.status}: ${text.substring(0, 200)}`)
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text()
      console.error(`Expected JSON but got: ${contentType}. Body: ${text.substring(0, 200)}`)
      throw new Error(`Gateway returned ${contentType || 'unknown content type'} instead of JSON`)
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching history:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to OpenClaw gateway'
    return {
      error: 'Gateway Unreachable',
      details: errorMessage,
      gatewayUrl: GATEWAY_URL,
      timestamp: new Date().toISOString()
    }
  }
}

export async function sendMessage(sessionKey: string, message: string): Promise<void> {
  try {
    await fetchWithTimeout(`${GATEWAY_URL}/api/sessions/${sessionKey}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export async function sendMessageWithMetadata(
  sessionKey: string,
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    await fetchWithTimeout(`${GATEWAY_URL}/api/sessions/${sessionKey}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        metadata  // Include metadata/tags for routing
      })
    })
  } catch (error) {
    console.error('Error sending message with metadata:', error)
    throw error
  }
}

export async function getGatewayStatus(): Promise<Record<string, unknown> | GatewayError> {
  try {
    const res = await fetchWithTimeout(`${GATEWAY_URL}/api/status`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to OpenClaw gateway. If deploying to Vercel, you need to expose your local gateway via a tunnel (ngrok) and set OPENCLAW_GATEWAY_URL.'
    return {
      error: 'Gateway Unreachable',
      details: errorMessage,
      gatewayUrl: GATEWAY_URL,
      timestamp: new Date().toISOString()
    }
  }
}
