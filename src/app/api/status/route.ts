import { NextResponse } from 'next/server'
import { getGatewayStatus, GatewayError } from '@/lib/openclaw'

// Force dynamic rendering - don't try to prerender this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const status = await getGatewayStatus()
    
    // Check if we got an error response
    if ('error' in status) {
      const errorStatus = status as GatewayError
      return NextResponse.json({
        gateway: 'offline',
        error: errorStatus.error,
        details: errorStatus.details,
        gatewayUrl: errorStatus.gatewayUrl,
        timestamp: errorStatus.timestamp,
        setupInstructions: 'To fix this on Vercel: 1) Install ngrok locally, 2) Run: ngrok http 18789, 3) Copy the HTTPS URL, 4) Set OPENCLAW_GATEWAY_URL environment variable in Vercel dashboard'
      }, { status: 503 })
    }
    
    return NextResponse.json({
      gateway: 'online',
      channels: {
        telegram: true,
        webchat: true
      },
      memory: 'connected',
      lastHeartbeat: new Date().toISOString(),
      ...status
    })
  } catch (error) {
    // Handle any unexpected errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      gateway: 'offline',
      error: 'Failed to fetch gateway status',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      setupInstructions: 'To fix this on Vercel: 1) Install ngrok locally, 2) Run: ngrok http 18789, 3) Copy the HTTPS URL, 4) Set OPENCLAW_GATEWAY_URL environment variable in Vercel dashboard'
    }, { status: 503 })
  }
}
