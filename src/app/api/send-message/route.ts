import { NextResponse } from 'next/server'
import { sendMessage } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { sessionKey, message } = await request.json()

    if (!sessionKey || !message) {
      return NextResponse.json(
        { error: 'sessionKey and message are required' },
        { status: 400 }
      )
    }

    // Send message to OpenClaw gateway
    await sendMessage(sessionKey, message)

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully'
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
