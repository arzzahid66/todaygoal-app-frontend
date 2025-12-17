"use client"

import { Button } from "@/components/ui/button"
import { Edit, Smile, Meh, Frown } from "lucide-react"

interface JournalEntry {
  id: string
  title: string | null
  content: string
  mood: "great" | "good" | "okay" | "bad" | "terrible" | null
  entry_date: string
  created_at: string
}

interface JournalEntryListProps {
  entries: JournalEntry[]
  onEdit: (entry: JournalEntry) => void
  onUpdate: () => void
}

const MOOD_CONFIG = {
  great: { icon: Smile, color: "text-green-600", bg: "bg-green-50", label: "Great" },
  good: { icon: Smile, color: "text-blue-600", bg: "bg-blue-50", label: "Good" },
  okay: { icon: Meh, color: "text-amber-600", bg: "bg-amber-50", label: "Okay" },
  bad: { icon: Frown, color: "text-orange-600", bg: "bg-orange-50", label: "Bad" },
  terrible: { icon: Frown, color: "text-red-600", bg: "bg-red-50", label: "Terrible" },
}

export default function JournalEntryList({ entries, onEdit }: JournalEntryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No journal entries yet. Start writing to track your thoughts and feelings!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const moodConfig = entry.mood ? MOOD_CONFIG[entry.mood] : null
        const MoodIcon = moodConfig?.icon

        return (
          <div
            key={entry.id}
            className="p-4 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {moodConfig && MoodIcon && (
                    <div className={`p-2 rounded-full ${moodConfig.bg}`}>
                      <MoodIcon className={`h-4 w-4 ${moodConfig.color}`} />
                    </div>
                  )}
                  <div>
                    {entry.title && <h3 className="font-semibold text-gray-900">{entry.title}</h3>}
                    <p className="text-sm text-gray-500">
                      {new Date(entry.entry_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onEdit(entry)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{entry.content}</p>
          </div>
        )
      })}
    </div>
  )
}
