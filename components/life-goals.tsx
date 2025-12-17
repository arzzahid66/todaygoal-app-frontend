"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LifeGoalsList from "@/components/life-goals-list"
import LifeGoalDialog from "@/components/life-goal-dialog"

interface LifeGoal {
  id: string
  category: "health" | "career" | "relationships" | "personal" | "financial" | "other"
  title: string
  description: string | null
  target_date: string | null
  status: "active" | "completed" | "abandoned"
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function LifeGoals({ userId: _userId }: { userId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const { data: goals, mutate } = useSWR<LifeGoal[]>("/api/goals", fetcher)

  const activeGoals = goals?.filter((g) => g.status === "active") || []
  const filteredGoals =
    selectedCategory === "all" ? activeGoals : activeGoals.filter((g) => g.category === selectedCategory)

  function handleEdit(goal: LifeGoal) {
    setEditingGoal(goal)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingGoal(null)
  }

  function handleGoalUpdate() {
    mutate()
    handleDialogClose()
  }

  const categories = [
    { value: "all", label: "All Goals", count: activeGoals.length },
    { value: "health", label: "Health", count: activeGoals.filter((g) => g.category === "health").length },
    { value: "career", label: "Career", count: activeGoals.filter((g) => g.category === "career").length },
    {
      value: "relationships",
      label: "Relationships",
      count: activeGoals.filter((g) => g.category === "relationships").length,
    },
    { value: "personal", label: "Personal", count: activeGoals.filter((g) => g.category === "personal").length },
    { value: "financial", label: "Financial", count: activeGoals.filter((g) => g.category === "financial").length },
    { value: "other", label: "Other", count: activeGoals.filter((g) => g.category === "other").length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Life Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your long-term aspirations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs lg:text-sm">
                  {cat.label}
                  {cat.count > 0 && <span className="ml-1 text-xs">({cat.count})</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="mt-6">
                <LifeGoalsList goals={filteredGoals} onEdit={handleEdit} onUpdate={mutate} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <LifeGoalDialog open={dialogOpen} onClose={handleDialogClose} onSuccess={handleGoalUpdate} goal={editingGoal} />
    </div>
  )
}
