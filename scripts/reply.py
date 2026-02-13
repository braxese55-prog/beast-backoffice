#!/usr/bin/env python3
# scripts/reply.py - Post AI replies to Supabase
# Usage: python scripts/reply.py "Your response here"

import sys
import os
import requests

# Get Supabase credentials from environment or .env file
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

# Load from .env file if not in environment
if not SUPABASE_KEY or not SUPABASE_URL:
    env_file = os.path.join(os.path.expanduser('~'), '.openclaw', '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    if key == 'SUPABASE_URL' and not SUPABASE_URL:
                        SUPABASE_URL = value
                    elif key == 'SUPABASE_SERVICE_KEY' and not SUPABASE_KEY:
                        SUPABASE_KEY = value

def post_reply(message, sender='Beast'):
    """Post a reply message to Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
        print("Add them to ~/.openclaw/.env or environment variables")
        return False
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    data = {
        'content': message[:10000],  # Limit to 10k chars
        'sender': sender,
        'session_key': 'default',
        'created_at': 'now()'
    }
    
    try:
        r = requests.post(
            f'{SUPABASE_URL}/rest/v1/messages',
            headers=headers,
            json=data,
            timeout=10
        )
        
        if r.status_code == 201:
            print(f'✓ Reply posted: {r.status_code}')
            return True
        else:
            print(f'✗ Failed to post reply: {r.status_code}')
            print(f'  Response: {r.text[:200]}')
            return False
            
    except Exception as e:
        print(f'✗ Error posting reply: {e}')
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python scripts/reply.py 'Your message here'")
        print("       python scripts/reply.py 'Your message' 'CustomSenderName'")
        sys.exit(1)
    
    message = sys.argv[1]
    sender = sys.argv[2] if len(sys.argv) > 2 else 'Beast'
    
    success = post_reply(message, sender)
    sys.exit(0 if success else 1)
