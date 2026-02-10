export interface Agent {
  id: string
  name: string
  status: 'active' | 'idle' | 'busy' | 'offline'
  model: string
  lastActive: string
  tasksCompleted: number
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedAt?: string
}

export interface SystemStatus {
  gateway: 'online' | 'offline'
  channels: {
    telegram: boolean
    webchat: boolean
  }
  memory: 'connected' | 'disconnected'
  lastHeartbeat: string
}

export interface TokenUsage {
  date: string
  tokens: number
  cost: number
  model: string
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  feedback?: 'up' | 'down'
}
