'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Circle, ListTodo } from 'lucide-react'
import type { Task } from '@/types'

interface TaskBoardProps {
  tasks: Task[]
}

const statusIcons = {
  'todo': Circle,
  'in-progress': Clock,
  'completed': CheckCircle
}

const statusColors = {
  'todo': 'bg-gray-500',
  'in-progress': 'bg-blue-500',
  'completed': 'bg-green-500'
}

const priorityColors = {
  'low': 'bg-gray-200 text-gray-700',
  'medium': 'bg-yellow-200 text-yellow-700',
  'high': 'bg-red-200 text-red-700'
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const todo = tasks.filter(t => t.status === 'todo')
  const inProgress = tasks.filter(t => t.status === 'in-progress')
  const completed = tasks.filter(t => t.status === 'completed')

  const TaskColumn = ({ title, tasks, icon: Icon }: { title: string; tasks: Task[]; icon: any }) => (
    <div className="flex-1 min-w-[250px]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4" />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <p className="font-medium text-sm">{task.title}</p>
                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                <span>Created: {task.createdAt}</span>
                {task.completedAt && (
                  <span>• Done: {task.completedAt}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5" />
          Task Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <TaskColumn title="To Do" tasks={todo} icon={Circle} />
          <TaskColumn title="In Progress" tasks={inProgress} icon={Clock} />
          <TaskColumn title="Completed" tasks={completed} icon={CheckCircle} />
        </div>
      </CardContent>
    </Card>
  )
}
