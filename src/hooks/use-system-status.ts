'use client'

import { useState, useEffect } from 'react'

interface SystemStatus {
  gateway: 'online' | 'offline'
  channels: {
    telegram: boolean
    webchat: boolean
  }
  memory: string
  lastHeartbeat: string
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status')
        const data = await res.json()
        setStatus(data)
      } catch (error) {
        console.error('Error fetching status:', error)
        setStatus({
          gateway: 'offline',
          channels: { telegram: false, webchat: false },
          memory: 'disconnected',
          lastHeartbeat: 'never'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return { status, loading }
}
