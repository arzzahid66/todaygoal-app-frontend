"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"
import FocusSessionHistory from "@/components/focus-session-history"

interface Task {
  id: string
  title: string
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

const PRESET_DURATIONS = [
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "25 minutes (Pomodoro)", value: 25 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
]

export default function FocusTimer({ userId: _userId }: { userId: string }) {
  const [duration, setDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const { data: tasks } = useSWR<Task[]>(`/api/tasks?date=${today}`, fetcher)
  const { mutate: mutateHistory } = useSWR("/api/focus/sessions", fetcher)

  useEffect(() => {
    setTimeLeft(duration * 60)
  }, [duration])

  const handleComplete = useCallback(async () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Play completion sound (browser notification sound)
    if (typeof window !== "undefined") {
      // Keep ref so ESLint doesn't flag it as unused (and allows future reuse).
      audioRef.current = new Audio("/notification.mp3")
      const audio = new Audio("/notification.mp3")
      audio.play().catch(() => {
        // Fallback if audio doesn't play
        console.log("[v0] Focus session completed!")
      })
    }

    // Save session
    if (sessionStartTime) {
      await fetch("/api/focus/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTaskId,
          duration_minutes: duration,
          completed: true,
          started_at: sessionStartTime.toISOString(),
          completed_at: new Date().toISOString(),
        }),
      })

      mutateHistory()
    }

    // Show browser notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Focus Session Complete!", {
        body: `Great work! You completed a ${duration}-minute focus session.`,
        icon: "/favicon.ico",
      })
    }
  }, [duration, mutateHistory, selectedTaskId, sessionStartTime])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            void handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [handleComplete, isRunning, timeLeft])

  function handleStart() {
    if (!isRunning) {
      setSessionStartTime(new Date())

      // Request notification permission
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    setTimeLeft(duration * 60)
    setSessionStartTime(null)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Focus Timer</h1>
        <p className="text-gray-600 mt-1">Stay focused and track your deep work sessions</p>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Focus Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8">
            {/* Circular Progress */}
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="text-blue-600 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-900 tabular-nums">
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">{isRunning ? "Focus time" : "Ready to focus"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_DURATIONS.map((preset) => (
                      <SelectItem key={preset.value} value={String(preset.value)}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Task (optional)</label>
                <Select
                  value={selectedTaskId || "none"}
                  onValueChange={(v) => setSelectedTaskId(v === "none" ? null : v)}
                  disabled={isRunning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task</SelectItem>
                    {tasks?.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              {!isRunning ? (
                <Button onClick={handleStart} className="flex-1 gap-2" size="lg">
                  <Play className="h-5 w-5" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} variant="secondary" className="flex-1 gap-2" size="lg">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FocusSessionHistory />
    </div>
  )
}
