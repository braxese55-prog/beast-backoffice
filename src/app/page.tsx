'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusPanel } from '@/components/status-panel'
import { TokenTracker } from '@/components/token-tracker'
import { AgentRoster } from '@/components/agent-roster'
import { CommsCenter } from '@/components/comms-center'
import { TaskBoard } from '@/components/task-board'
import type { SystemStatus, TokenUsage, Agent, Message, Task } from '@/types'

// Mock data - replace with real API calls
const mockStatus: SystemStatus = {
  gateway: 'online',
  channels: { telegram: true, webchat: true },
  memory: 'connected',
  lastHeartbeat: '2 min ago'
}

const mockTokenUsage: TokenUsage[] = [
  { date: '2026-02-10', tokens: 45000, cost: 0.45, model: 'kimi-k2.5' },
  { date: '2026-02-09', tokens: 32000, cost: 0.32, model: 'kimi-k2.5' },
  { date: '2026-02-08', tokens: 28000, cost: 0.28, model: 'kimi-k2.5' },
  { date: '2026-02-07', tokens: 51000, cost: 0.51, model: 'kimi-k2.5' },
  { date: '2026-02-06', tokens: 19000, cost: 0.19, model: 'kimi-k2.5' },
]

const mockAgents: Agent[] = [
  {
    id: 'main',
    name: 'Beast',
    status: 'active',
    model: 'kimi-k2.5',
    lastActive: 'Just now',
    tasksCompleted: 47
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey Beast, can you help me with a project?',
    sender: 'user',
    timestamp: '2026-02-10T03:00:00Z'
  },
  {
    id: '2',
    content: 'Absolutely. What are we building?',
    sender: 'ai',
    timestamp: '2026-02-10T03:00:05Z'
  }
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Build Back Office Dashboard',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-02-10'
  },
  {
    id: '2',
    title: 'Deploy to Vercel',
    status: 'todo',
    priority: 'high',
    createdAt: '2026-02-10'
  },
  {
    id: '3',
    title: 'Security audit weekly check',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-02-09',
    completedAt: '2026-02-09'
  }
]

export default function Dashboard() {
  const handleSendMessage = (content: string) => {
    console.log('Send message:', content)
    // TODO: Implement actual message sending
  }

  const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
    console.log('Feedback:', messageId, feedback)
    // TODO: Implement feedback storage
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🐺</span>
              Beast Back Office
            </h1>
            <div className="text-sm text-muted-foreground">
              Connected to OpenClaw Gateway
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="comms">Comms</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatusPanel status={mockStatus} />
            <TokenTracker usage={mockTokenUsage} />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <AgentRoster agents={mockAgents} />
          </TabsContent>

          <TabsContent value="comms" className="space-y-6">
            <CommsCenter 
              messages={mockMessages}
              onSendMessage={handleSendMessage}
              onFeedback={handleFeedback}
            />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskBoard tasks={mockTasks} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
