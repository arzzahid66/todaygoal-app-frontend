"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LifeGoal {
  id: string
  category: "health" | "career" | "relationships" | "personal" | "financial" | "other"
  title: string
  description: string | null
  target_date: string | null
  status: "active" | "completed" | "abandoned"
}

interface LifeGoalDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  goal?: LifeGoal | null
}

const CATEGORIES = [
  { value: "health", label: "Health" },
  { value: "career", label: "Career" },
  { value: "relationships", label: "Relationships" },
  { value: "personal", label: "Personal" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
]

export default function LifeGoalDialog({ open, onClose, onSuccess, goal }: LifeGoalDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"health" | "career" | "relationships" | "personal" | "financial" | "other">(
    "personal",
  )
  const [targetDate, setTargetDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setDescription(goal.description || "")
      setCategory(goal.category)
      setTargetDate(goal.target_date || "")
    } else {
      setTitle("")
      setDescription("")
      setCategory("personal")
      setTargetDate("")
    }
  }, [goal, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (goal) {
        // Update existing goal
        await fetch(`/api/goals/${goal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description || null,
            category,
            target_date: targetDate || null,
          }),
        })
      } else {
        // Create new goal
        await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description || null,
            category,
            target_date: targetDate || null,
            status: "active",
          }),
        })
      }

      onSuccess()
    } catch (error) {
      console.error("[v0] Goal save error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!goal) return

    setLoading(true)
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: "DELETE",
      })
      onSuccess()
    } catch (error) {
      console.error("[v0] Goal delete error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "New Life Goal"}</DialogTitle>
          <DialogDescription>{goal ? "Update your goal details" : "Set a new long-term goal"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Run a marathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Why is this goal important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(v) =>
                  setCategory(v as "health" | "career" | "relationships" | "personal" | "financial" | "other")
                }
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : goal ? "Update" : "Create Goal"}
            </Button>
            {goal && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
