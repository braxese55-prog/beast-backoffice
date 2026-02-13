import { NextResponse } from 'next/server'
import { getSessionHistory } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionKey = searchParams.get('sessionKey')

  if (!sessionKey) {
    return NextResponse.json({ error: 'sessionKey required' }, { status: 400 })
  }

  try {
    const result = await getSessionHistory(sessionKey)
    
    // Check if we got an error response (GatewayError)
    if (result && typeof result === 'object' && 'error' in result) {
      return NextResponse.json({
        error: result.error,
        details: result.details,
        gatewayUrl: result.gatewayUrl,
        timestamp: result.timestamp
      }, { status: 503 })
    }

    // At this point, result is Message[]
    interface OpenClawMessage {
      timestamp?: number
      content?: string
      role?: string
    }
    const history = result as OpenClawMessage[]

    // Transform OpenClaw messages to our Message format
    const messages = history.map((msg: OpenClawMessage) => ({
      id: msg.timestamp?.toString() || Date.now().toString(),
      content: msg.content || '',
      sender: msg.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(msg.timestamp || Date.now()).toISOString()
    }))

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
