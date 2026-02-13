import { NextResponse } from 'next/server'
import { sendMessageWithMetadata } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Tag that identifies messages coming from the backoffice
const BACKOFFICE_TAG = 'beast-backoffice'

export async function POST(request: Request) {
  try {
    const { sessionKey, message, source = 'web' } = await request.json()

    if (!sessionKey || !message) {
      return NextResponse.json(
        { error: 'sessionKey and message are required' },
        { status: 400 }
      )
    }

    // Send message to OpenClaw gateway with backoffice tag
    // This tag tells Beast to send replies back to the backoffice webhook
    await sendMessageWithMetadata(sessionKey, message, {
      tags: [BACKOFFICE_TAG],
      source: source,
      backofficeSession: sessionKey,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully',
      tag: BACKOFFICE_TAG
    })

  } catch (error) {
    console.error('Error in send-message API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to send message', details: errorMessage },
      { status: 500 }
    )
  }
}
