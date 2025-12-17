"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Edit, Calendar, CheckCircle2, Circle, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LifeGoal {
  id: string
  category: "health" | "career" | "relationships" | "personal" | "financial" | "other"
  title: string
  description: string | null
  target_date: string | null
  status: "active" | "completed" | "abandoned"
}

interface Milestone {
  id: string
  goal_id: string
  title: string
  completed: boolean
  completed_at: string | null
}

interface LifeGoalsListProps {
  goals: LifeGoal[]
  onEdit: (goal: LifeGoal) => void
  onUpdate: () => void
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

const CATEGORY_COLORS = {
  health: "from-green-500 to-emerald-600",
  career: "from-blue-500 to-indigo-600",
  relationships: "from-pink-500 to-rose-600",
  personal: "from-purple-500 to-violet-600",
  financial: "from-amber-500 to-orange-600",
  other: "from-gray-500 to-slate-600",
}

export default function LifeGoalsList({ goals, onEdit, onUpdate: _onUpdate }: LifeGoalsListProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState("")
  const [addingMilestoneFor, setAddingMilestoneFor] = useState<string | null>(null)

  const { data: allMilestones, mutate: mutateMilestones } = useSWR<Milestone[]>("/api/goals/milestones", fetcher)

  async function toggleMilestone(milestoneId: string, completed: boolean) {
    await fetch(`/api/goals/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      }),
    })

    mutateMilestones()
  }

  async function addMilestone(goalId: string) {
    if (!newMilestone.trim()) return

    await fetch("/api/goals/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal_id: goalId,
        title: newMilestone,
      }),
    })

    setNewMilestone("")
    setAddingMilestoneFor(null)
    mutateMilestones()
  }

  function getMilestones(goalId: string): Milestone[] {
    return allMilestones?.filter((m) => m.goal_id === goalId) || []
  }

  function getProgress(goalId: string): number {
    const milestones = getMilestones(goalId)
    if (milestones.length === 0) return 0
    const completed = milestones.filter((m) => m.completed).length
    return (completed / milestones.length) * 100
  }

  if (goals.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No goals in this category yet. Create your first goal to get started!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const milestones = getMilestones(goal.id)
        const progress = getProgress(goal.id)
        const isExpanded = expandedGoalId === goal.id
        const daysUntilTarget = goal.target_date
          ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null

        return (
          <div
            key={goal.id}
            className="p-4 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${CATEGORY_COLORS[goal.category]}`}
                  >
                    {goal.category}
                  </div>
                  {goal.target_date && daysUntilTarget !== null && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {daysUntilTarget > 0
                        ? `${daysUntilTarget} days left`
                        : daysUntilTarget === 0
                          ? "Due today"
                          : `${Math.abs(daysUntilTarget)} days overdue`}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                {goal.description && <p className="text-sm text-gray-600 mt-1">{goal.description}</p>}

                {milestones.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
              className="text-sm"
            >
              {isExpanded ? "Hide" : "Show"} Milestones ({milestones.length})
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-2 pl-4 border-l-2 border-gray-200">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-2">
                    <button onClick={() => toggleMilestone(milestone.id, milestone.completed)}>
                      {milestone.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <span className={`text-sm ${milestone.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {milestone.title}
                    </span>
                  </div>
                ))}

                {addingMilestoneFor === goal.id ? (
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="New milestone..."
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addMilestone(goal.id)
                        }
                      }}
                      autoFocus
                    />
                    <Button onClick={() => addMilestone(goal.id)} size="sm">
                      Add
                    </Button>
                    <Button onClick={() => setAddingMilestoneFor(null)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setAddingMilestoneFor(goal.id)}
                    variant="ghost"
                    size="sm"
                    className="gap-2 mt-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
