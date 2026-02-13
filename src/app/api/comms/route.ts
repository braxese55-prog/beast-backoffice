import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Initialize Supabase client with service role for server-side operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    const body = await req.json();
    const { message, sessionKey } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message required' },
        { status: 400, headers }
      );
    }

    // 1. Save message to Supabase
    let supabaseId = null;
    try {
      const { data } = await supabaseAdmin
        .from('messages')
        .insert({
          content: message.substring(0, 10000),
          sender: 'User',
          session_key: sessionKey || 'default',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) supabaseId = data.id;
    } catch (e) {
      console.log('Supabase save failed (non-fatal):', e);
    }

    // 2. Send instant webhook to OpenClaw via Tailscale Funnel
    let webhookSent = false;
    const webhookUrl = process.env.OPENCLAW_WEBHOOK_URL;
    const webhookPassword = process.env.OPENCLAW_WEBHOOK_PASSWORD;

    if (webhookUrl && webhookPassword) {
      try {
        const wakeEndpoint = `${webhookUrl.replace(/\/$/, '')}/hooks/wake`;
        console.log(`Sending webhook to: ${wakeEndpoint}`);
        
        const webhookResponse = await fetch(wakeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${webhookPassword}`,
          },
          body: JSON.stringify({
            text: `[backoffice] ${message.substring(0, 2000)}`,
            mode: 'now',
            metadata: {
              source: 'backoffice',
              sessionKey: sessionKey || 'default',
              supabaseId,
            },
          }),
        });

        webhookSent = webhookResponse.ok;
        console.log(`Webhook response: ${webhookResponse.status}`);
      } catch (e) {
        console.log('Webhook error (non-fatal):', e);
      }
    }

    return NextResponse.json(
      { success: true, supabaseId, webhookSent },
      { headers }
    );
  } catch (error) {
    console.error('Comms error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500, headers }
    );
  }
}

// GET endpoint to fetch messages from Supabase
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionKey = searchParams.get('sessionKey') || 'default';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_key', sessionKey)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform to Message format
    const messages = (data || []).map((msg: any) => ({
      id: msg.id?.toString() || Date.now().toString(),
      content: msg.content || '',
      sender: msg.sender === 'User' ? 'user' : 'ai',
      timestamp: msg.created_at || new Date().toISOString(),
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
