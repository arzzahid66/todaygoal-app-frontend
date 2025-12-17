"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, Zap, Edit } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | null
  energy_level: "low" | "medium" | "high" | null
}

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onUpdate: () => void
}

export default function TaskList({ tasks, onEdit, onUpdate }: TaskListProps) {
  async function toggleStatus(task: Task) {
    const statusFlow = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    } as const

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusFlow[task.status] }),
    })

    onUpdate()
  }

  const energyColors = {
    low: "text-blue-600",
    medium: "text-amber-600",
    high: "text-red-600",
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-3 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-start gap-3">
            <button onClick={() => toggleStatus(task)} className="mt-0.5">
              {task.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : task.status === "in-progress" ? (
                <Clock className="h-5 w-5 text-amber-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h4
                className={`font-medium text-sm ${
                  task.status === "done" ? "line-through text-gray-500" : "text-gray-900"
                }`}
              >
                {task.title}
              </h4>
              {task.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                {task.energy_level && (
                  <div className="flex items-center gap-1">
                    <Zap className={`h-3 w-3 ${energyColors[task.energy_level]}`} />
                    <span className="text-xs text-gray-600 capitalize">{task.energy_level}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
