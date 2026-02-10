import { NextResponse } from 'next/server'
import { getSessions, getSessionHistory } from '@/lib/openclaw'

export async function GET() {
  const sessions = await getSessions()
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  const { action, sessionKey } = await request.json()
  
  if (action === 'history' && sessionKey) {
    const history = await getSessionHistory(sessionKey)
    return NextResponse.json(history)
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
