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
    const history = await getSessionHistory(sessionKey)
    
    // Check if we got an error response
    if ('error' in history) {
      return NextResponse.json({
        error: history.error,
        details: history.details,
        gatewayUrl: history.gatewayUrl,
        timestamp: history.timestamp
      }, { status: 503 })
    }

    // Transform OpenClaw messages to our Message format
    const messages = history.map((msg: any) => ({
      id: msg.timestamp?.toString() || Date.now().toString(),
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(msg.timestamp).toISOString()
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
