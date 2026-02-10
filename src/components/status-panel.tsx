'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Cpu, MemoryStick, Wifi } from 'lucide-react'
import type { SystemStatus } from '@/types'

interface StatusPanelProps {
  status: SystemStatus
}

export function StatusPanel({ status }: StatusPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gateway</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${status.gateway === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-2xl font-bold capitalize">{status.gateway}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Loopback: 127.0.0.1:18789</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Channels</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Telegram</span>
              <div className={`h-2 w-2 rounded-full ${status.channels.telegram ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Webchat</span>
              <div className={`h-2 w-2 rounded-full ${status.channels.webchat ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory API</CardTitle>
          <MemoryStick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${status.memory === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-lg font-bold capitalize">{status.memory}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Graph: memory-api-one.vercel.app</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Heartbeat</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.lastHeartbeat}</div>
          <p className="text-xs text-muted-foreground mt-1">Next: 30m interval</p>
        </CardContent>
      </Card>
    </div>
  )
}
