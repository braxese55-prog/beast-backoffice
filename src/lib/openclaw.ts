// OpenClaw API client
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'

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

export async function getSessions(): Promise<Session[]> {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/sessions`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to fetch sessions')
    return res.json()
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

export async function getSessionHistory(sessionKey: string): Promise<Message[]> {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/sessions/${sessionKey}/history`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to fetch history')
    return res.json()
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  }
}

export async function sendMessage(sessionKey: string, message: string): Promise<void> {
  try {
    await fetch(`${GATEWAY_URL}/api/sessions/${sessionKey}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export async function getGatewayStatus(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/status`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to fetch status')
    return res.json()
  } catch (error) {
    console.error('Error fetching status:', error)
    return null
  }
}
