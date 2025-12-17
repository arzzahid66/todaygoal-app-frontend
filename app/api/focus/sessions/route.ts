import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: sessions, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("[v0] Get focus sessions error:", error)
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

    const { task_id, duration_minutes, completed, started_at, completed_at } = body

    const { data: inserted, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: user.id,
        task_id,
        duration_minutes,
        completed,
        started_at,
        completed_at,
      })
      .select("*")
      .single()

    if (error) throw error
    return NextResponse.json(inserted)
  } catch (error) {
    console.error("[v0] Create focus session error:", error)
    return NextResponse.json({ error: "Failed to create focus session" }, { status: 500 })
  }
}
