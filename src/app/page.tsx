'use client'

import { useState, useEffect } from 'react'
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

// Generate or retrieve session key for this conversation
const getSessionKey = () => {
  if (typeof window !== 'undefined') {
    let key = localStorage.getItem('backoffice-session-key')
    if (!key) {
      key = `backoffice-${Date.now()}-${Math.random().toString(36).substring(7)}`
      localStorage.setItem('backoffice-session-key', key)
    }
    return key
  }
  return 'backoffice-default'
}

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
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [isSending, setIsSending] = useState(false)
  const sessionKey = getSessionKey()

  const handleSendMessage = async (content: string) => {
    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsSending(true)

    try {
      // Send to OpenClaw gateway
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey,
          message: content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // The response will come asynchronously through polling or WebSocket
      // For now, add a placeholder response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Message sent to Beast. Waiting for response...',
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])
      }, 500)

    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Error: Could not send message. Please check your connection.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
    console.log('Feedback:', messageId, feedback)
    // TODO: Implement feedback storage
  }

  // Poll for new messages periodically
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/messages?sessionKey=${sessionKey}`)
        if (response.ok) {
          const newMessages = await response.json()
          // Merge new messages with existing, avoiding duplicates
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const uniqueNew = newMessages.filter((m: Message) => !existingIds.has(m.id))
            return [...prev, ...uniqueNew]
          })
        }
      } catch (error) {
        // Silently fail on poll errors
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [sessionKey])

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
              messages={messages}
              onSendMessage={handleSendMessage}
              onFeedback={handleFeedback}
              isSending={isSending}
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
