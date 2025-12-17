"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import HabitList from "@/components/habit-list"
import HabitDialog from "@/components/habit-dialog"

interface Habit {
  id: string
  name: string
  description: string | null
  color: string
  frequency: "daily" | "weekly" | "custom"
  target_count: number
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function HabitTracker({ userId: _userId }: { userId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const { data: habits, mutate } = useSWR<Habit[]>("/api/habits", fetcher)

  function handleEdit(habit: Habit) {
    setEditingHabit(habit)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingHabit(null)
  }

  function handleHabitUpdate() {
    mutate()
    handleDialogClose()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Habits</h1>
          <p className="text-gray-600 mt-1">Build consistency with daily habits</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
        <CardHeader>
          <CardTitle>Your Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitList habits={habits || []} onEdit={handleEdit} onUpdate={mutate} />
        </CardContent>
      </Card>

      <HabitDialog open={dialogOpen} onClose={handleDialogClose} onSuccess={handleHabitUpdate} habit={editingHabit} />
    </div>
  )
}
