import { NextResponse } from 'next/server'
import { getGatewayStatus } from '@/lib/openclaw'

export async function GET() {
  const status = await getGatewayStatus()
  
  return NextResponse.json({
    gateway: status ? 'online' : 'offline',
    channels: {
      telegram: true,
      webchat: true
    },
    memory: 'connected',
    lastHeartbeat: new Date().toISOString(),
    ...status
  })
}
