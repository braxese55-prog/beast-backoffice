'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Message } from '@/lib/supabase'

export function useRealtimeMessages(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    fetchMessages()
  }, [sessionId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Send message function
  const sendMessage = useCallback(async (content: string, role: 'user' | 'assistant' = 'user') => {
    const { error } = await supabase.from('messages').insert({
      session_id: sessionId,
      role,
      content,
    })

    if (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [sessionId])

  return { messages, loading, sendMessage }
}

// Hook for system-wide events (status updates, etc)
export function useRealtimeSystem() {
  const [lastEvent, setLastEvent] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('system_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
        },
        (payload) => {
          setLastEvent(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { lastEvent }
}
