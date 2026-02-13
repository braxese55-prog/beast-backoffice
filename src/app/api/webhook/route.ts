import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Store messages in memory (in production, use a database)
interface StoredMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  metadata?: Record<string, unknown>
}
const messageStore = new Map<string, StoredMessage[]>()

// Webhook secret for verification
const WEBHOOK_SECRET = process.env.BACKOFFICE_WEBHOOK_SECRET || 'default-secret-change-in-production'

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('x-webhook-secret')
    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, sessionKey, metadata, sender } = body

    // Check if this is a reply to a backoffice message
    if (metadata?.tags?.includes('beast-backoffice') || sender === 'assistant') {
      // Store the reply
      const sessionMessages = messageStore.get(sessionKey) || []
      sessionMessages.push({
        id: Date.now().toString(),
        content: message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        metadata
      })
      messageStore.set(sessionKey, sessionMessages)

      console.log(`Received reply for session ${sessionKey}:`, message)

      return NextResponse.json({
        success: true,
        received: true
      })
    }

    return NextResponse.json({
      success: true,
      received: false,
      reason: 'Not a backoffice message'
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve messages for a session
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionKey = searchParams.get('sessionKey')

  if (!sessionKey) {
    return NextResponse.json(
      { error: 'sessionKey is required' },
      { status: 400 }
    )
  }

  const messages = messageStore.get(sessionKey) || []

  return NextResponse.json({
    messages,
    count: messages.length
  })
}
