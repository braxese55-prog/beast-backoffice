'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bot, User } from 'lucide-react'
import type { Agent } from '@/types'

interface AgentRosterProps {
  agents: Agent[]
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  busy: 'bg-blue-500',
  offline: 'bg-gray-500'
}

export function AgentRoster({ agents }: AgentRosterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent Roster ({agents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className={agent.name === 'Beast' ? 'bg-purple-500 text-white' : 'bg-gray-500'}>
                    {agent.name === 'Beast' ? '🐺' : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.model}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
                  <Badge variant="outline" className="capitalize">
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {agent.tasksCompleted} tasks completed
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active: {agent.lastActive}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
