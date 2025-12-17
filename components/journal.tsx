"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import JournalEntryList from "@/components/journal-entry-list"
import JournalEntryDialog from "@/components/journal-entry-dialog"

interface JournalEntry {
  id: string
  title: string | null
  content: string
  mood: "great" | "good" | "okay" | "bad" | "terrible" | null
  entry_date: string
  created_at: string
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function Journal({ userId: _userId }: { userId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  const { data: entries, mutate } = useSWR<JournalEntry[]>("/api/journal", fetcher)

  function handleEdit(entry: JournalEntry) {
    setEditingEntry(entry)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingEntry(null)
  }

  function handleEntryUpdate() {
    mutate()
    handleDialogClose()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Journal</h1>
          <p className="text-gray-600 mt-1">Reflect on your day and track your journey</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-md">
        <CardHeader>
          <CardTitle>Your Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <JournalEntryList entries={entries || []} onEdit={handleEdit} onUpdate={mutate} />
        </CardContent>
      </Card>

      <JournalEntryDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleEntryUpdate}
        entry={editingEntry}
      />
    </div>
  )
}
