"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Smile, Meh, Frown } from "lucide-react"

interface JournalEntry {
  id: string
  title: string | null
  content: string
  mood: "great" | "good" | "okay" | "bad" | "terrible" | null
  entry_date: string
}

interface JournalEntryDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  entry?: JournalEntry | null
}

const MOODS: Array<{
  value: "great" | "good" | "okay" | "bad" | "terrible"
  label: string
  icon: typeof Smile
  color: string
  bg: string
}> = [
  { value: "great", label: "Great", icon: Smile, color: "text-green-600", bg: "bg-green-50 hover:bg-green-100" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100" },
  { value: "bad", label: "Bad", icon: Frown, color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100" },
  {
    value: "terrible",
    label: "Terrible",
    icon: Frown,
    color: "text-red-600",
    bg: "bg-red-50 hover:bg-red-100",
  },
]

export default function JournalEntryDialog({ open, onClose, onSuccess, entry }: JournalEntryDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<"great" | "good" | "okay" | "bad" | "terrible" | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || "")
      setContent(entry.content)
      setMood(entry.mood)
    } else {
      setTitle("")
      setContent("")
      setMood(null)
    }
  }, [entry, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (entry) {
        // Update existing entry
        await fetch(`/api/journal/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || null,
            content,
            mood,
          }),
        })
      } else {
        // Create new entry
        await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || null,
            content,
            mood,
            entry_date: new Date().toISOString().split("T")[0],
          }),
        })
      }

      onSuccess()
    } catch (error) {
      console.error("[v0] Journal entry save error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!entry) return

    setLoading(true)
    try {
      await fetch(`/api/journal/${entry.id}`, {
        method: "DELETE",
      })
      onSuccess()
    } catch (error) {
      console.error("[v0] Journal entry delete error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>
            {entry ? "Update your journal entry" : "Capture your thoughts and feelings"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your thoughts</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>How are you feeling?</Label>
            <div className="flex gap-2">
              {MOODS.map((moodOption) => {
                const Icon = moodOption.icon
                const isSelected = mood === moodOption.value

                return (
                  <button
                    key={moodOption.value}
                    type="button"
                    className={`flex-1 p-3 rounded-lg transition-all ${moodOption.bg} ${
                      isSelected ? "ring-2 ring-offset-2 ring-gray-400" : ""
                    }`}
                    onClick={() => setMood(moodOption.value)}
                    disabled={loading}
                  >
                    <Icon className={`h-5 w-5 mx-auto ${moodOption.color}`} />
                    <span className={`text-xs mt-1 block ${moodOption.color}`}>{moodOption.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : entry ? "Update" : "Save Entry"}
            </Button>
            {entry && (
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
