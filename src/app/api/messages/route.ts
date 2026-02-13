import { NextResponse } from 'next/server'
import { getSessionHistory, GatewayError } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionKey = searchParams.get('sessionKey')

  if (!sessionKey) {
    return NextResponse.json({ error: 'sessionKey required' }, { status: 400 })
  }

  try {
    console.log(`Fetching history for session: ${sessionKey}`)
    const result = await getSessionHistory(sessionKey)
    
    console.log('Result type:', typeof result)
    console.log('Result is array:', Array.isArray(result))
    
    // Check if we got an error response (GatewayError)
    if (!Array.isArray(result)) {
      // It's a GatewayError
      const errorResult = result as GatewayError
      console.log('Gateway error:', errorResult)
      return NextResponse.json({
        error: errorResult.error,
        details: errorResult.details,
        gatewayUrl: errorResult.gatewayUrl,
        timestamp: errorResult.timestamp
      }, { status: 503 })
    }

    console.log(`Got ${result.length} messages from gateway`)

    // Transform OpenClaw messages to our Message format
    interface OpenClawMessage {
      timestamp?: number
      content?: string
      role?: string
    }
    const messages = result.map((msg: OpenClawMessage) => ({
      id: msg.timestamp?.toString() || Date.now().toString(),
      content: msg.content || '',
      sender: msg.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(msg.timestamp || Date.now()).toISOString()
    }))

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: String(error) },
      { status: 500 }
    )
  }
}