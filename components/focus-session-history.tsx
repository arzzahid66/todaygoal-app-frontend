"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle2 } from "lucide-react"

interface FocusSession {
  id: string
  task_id: string | null
  duration_minutes: number
  completed: boolean
  started_at: string
  completed_at: string | null
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function FocusSessionHistory() {
  const { data: sessions } = useSWR<FocusSession[]>("/api/focus/sessions", fetcher)

  const completedSessions = sessions?.filter((s) => s.completed) || []
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  const todaysSessions = completedSessions.filter((s) => {
    const sessionDate = new Date(s.started_at).toDateString()
    const today = new Date().toDateString()
    return sessionDate === today
  })

  return (
    <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{todaysSessions.length} sessions</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{completedSessions.length}</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100">
            <div className="flex items-center gap-2 text-pink-700 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <div className="text-2xl font-bold text-pink-900">{totalMinutes} min</div>
          </div>
        </div>

        {completedSessions.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Sessions</h4>
            {completedSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.duration_minutes} minutes</p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.started_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No completed sessions yet</p>
        )}
      </CardContent>
    </Card>
  )
}
