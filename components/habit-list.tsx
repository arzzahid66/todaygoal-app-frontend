"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Edit } from "lucide-react"

interface Habit {
  id: string
  name: string
  description: string | null
  color: string
  frequency: "daily" | "weekly" | "custom"
  target_count: number
}

interface HabitLog {
  id: string
  habit_id: string
  completed_date: string
  count: number
}

interface HabitListProps {
  habits: Habit[]
  onEdit: (habit: Habit) => void
  onUpdate: () => void
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function HabitList({ habits, onEdit, onUpdate }: HabitListProps) {
  const today = new Date().toISOString().split("T")[0]
  const dates = useMemo(() => {
    const last7Days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      last7Days.push(date.toISOString().split("T")[0])
    }
    return last7Days
  }, [])

  const { data: logs } = useSWR<HabitLog[]>("/api/habits/logs", fetcher)

  async function toggleHabit(habitId: string, date: string) {
    const existingLog = logs?.find((log) => log.habit_id === habitId && log.completed_date === date)

    if (existingLog) {
      await fetch(`/api/habits/logs/${existingLog.id}`, {
        method: "DELETE",
      })
    } else {
      await fetch("/api/habits/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: habitId,
          completed_date: date,
          count: 1,
        }),
      })
    }

    onUpdate()
  }

  function isCompleted(habitId: string, date: string): boolean {
    return logs?.some((log) => log.habit_id === habitId && log.completed_date === date) || false
  }

  function getStreak(habitId: string): number {
    if (!logs) return 0

    const habitLogs = logs
      .filter((log) => log.habit_id === habitId)
      .sort((a, b) => b.completed_date.localeCompare(a.completed_date))

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (habitLogs.some((log) => log.completed_date === dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  if (habits.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">No habits yet. Create your first habit to get started!</p>
    )
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const streak = getStreak(habit.id)

        return (
          <div
            key={habit.id}
            className="p-4 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
                  <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                </div>
                {habit.description && <p className="text-sm text-gray-600 mt-1">{habit.description}</p>}
                {streak > 0 && <p className="text-sm text-gray-500 mt-2">🔥 {streak} day streak</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => onEdit(habit)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {dates.map((date) => {
                const completed = isCompleted(habit.id, date)
                const isToday = date === today
                const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" })

                return (
                  <button
                    key={date}
                    onClick={() => toggleHabit(habit.id, date)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className={`text-xs ${isToday ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                      {dayName}
                    </span>
                    {completed ? (
                      <CheckCircle2 className="h-6 w-6" style={{ color: habit.color }} />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
