"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Habit {
  id: string
  name: string
  description: string | null
  color: string
  frequency: "daily" | "weekly" | "custom"
  target_count: number
}

interface HabitDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  habit?: Habit | null
}

const PRESET_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

export default function HabitDialog({ open, onClose, onSuccess, habit }: HabitDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || "")
      setColor(habit.color)
    } else {
      setName("")
      setDescription("")
      setColor(PRESET_COLORS[0])
    }
  }, [habit, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (habit) {
        // Update existing habit
        await fetch(`/api/habits/${habit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description || null,
            color,
          }),
        })
      } else {
        // Create new habit
        await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description || null,
            color,
            frequency: "daily",
            target_count: 1,
          }),
        })
      }

      onSuccess()
    } catch (error) {
      console.error("[v0] Habit save error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!habit) return

    setLoading(true)
    try {
      await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      })
      onSuccess()
    } catch (error) {
      console.error("[v0] Habit delete error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "New Habit"}</DialogTitle>
          <DialogDescription>{habit ? "Update your habit details" : "Create a new habit to track"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Why is this habit important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === presetColor ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : habit ? "Update" : "Create"}
            </Button>
            {habit && (
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
