"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import TaskList from "@/components/task-list"
import TaskDialog from "@/components/task-dialog"

interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | null
  energy_level: "low" | "medium" | "high" | null
  scheduled_date: string | null
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function DailyPlanning({ userId: _userId }: { userId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const today = new Date().toISOString().split("T")[0]

  const { data: tasks, mutate } = useSWR<Task[]>(`/api/tasks?date=${today}`, fetcher)

  const todoTasks = tasks?.filter((t) => t.status === "todo") || []
  const inProgressTasks = tasks?.filter((t) => t.status === "in-progress") || []
  const doneTasks = tasks?.filter((t) => t.status === "done") || []

  function handleEdit(task: Task) {
    setEditingTask(task)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingTask(null)
  }

  function handleTaskUpdate() {
    mutate()
    handleDialogClose()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Today</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              To Do
              <span className="text-sm text-gray-500 font-normal ml-auto">{todoTasks.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={todoTasks} onEdit={handleEdit} onUpdate={mutate} />
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              In Progress
              <span className="text-sm text-gray-500 font-normal ml-auto">{inProgressTasks.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={inProgressTasks} onEdit={handleEdit} onUpdate={mutate} />
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Done
              <span className="text-sm text-gray-500 font-normal ml-auto">{doneTasks.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={doneTasks} onEdit={handleEdit} onUpdate={mutate} />
          </CardContent>
        </Card>
      </div>

      <TaskDialog open={dialogOpen} onClose={handleDialogClose} onSuccess={handleTaskUpdate} task={editingTask} />
    </div>
  )
}
