import { NextResponse } from 'next/server'
import { getSessions, getSessionHistory, GatewayError } from '@/lib/openclaw'

// Force dynamic rendering - don't try to prerender this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

function isGatewayError(result: unknown): result is GatewayError {
  return typeof result === 'object' && result !== null && 'error' in result && 'details' in result
}

export async function GET() {
  try {
    const sessions = await getSessions()
    
    if (isGatewayError(sessions)) {
      return NextResponse.json({
        error: sessions.error,
        details: sessions.details,
        gatewayUrl: sessions.gatewayUrl,
        timestamp: sessions.timestamp,
        setupInstructions: 'To fix this on Vercel: 1) Install ngrok locally, 2) Run: ngrok http 18789, 3) Copy the HTTPS URL, 4) Set OPENCLAW_GATEWAY_URL environment variable in Vercel dashboard'
      }, { status: 503 })
    }
    
    return NextResponse.json(sessions)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Failed to fetch sessions',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      setupInstructions: 'To fix this on Vercel: 1) Install ngrok locally, 2) Run: ngrok http 18789, 3) Copy the HTTPS URL, 4) Set OPENCLAW_GATEWAY_URL environment variable in Vercel dashboard'
    }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, sessionKey } = await request.json()
    
    if (action === 'history' && sessionKey) {
      const history = await getSessionHistory(sessionKey)
      
      if (isGatewayError(history)) {
        return NextResponse.json({
          error: history.error,
          details: history.details,
          gatewayUrl: history.gatewayUrl,
          timestamp: history.timestamp
        }, { status: 503 })
      }
      
      return NextResponse.json(history)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Failed to fetch session history',
      details: errorMessage
    }, { status: 500 })
  }
}
