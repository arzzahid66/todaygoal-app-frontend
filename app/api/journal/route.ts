import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(entries)
  } catch (error) {
    console.error("[v0] Get journal entries error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()

    const { title, content, mood, entry_date } = body

    const { data: inserted, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        title,
        content,
        mood,
        entry_date,
      })
      .select("*")
      .single()

    if (error) throw error
    return NextResponse.json(inserted)
  } catch (error) {
    console.error("[v0] Create journal entry error:", error)
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}
