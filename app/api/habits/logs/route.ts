import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // RLS on habit_logs uses user_id = auth.uid(), so we can query directly.
    const { data: logs, error } = await supabase.from("habit_logs").select("*").order("completed_date", { ascending: false })
    if (error) throw error

    return NextResponse.json(logs)
  } catch (error) {
    console.error("[v0] Get habit logs error:", error)
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

    const { habit_id, completed_date, count } = body

    const { data: upserted, error } = await supabase
      .from("habit_logs")
      .upsert(
        {
          habit_id,
          user_id: user.id,
          completed_date,
          count,
        },
        { onConflict: "habit_id,completed_date" }
      )
      .select("*")
      .single()

    if (error) {
      if (error.code === "23503") return NextResponse.json({ error: "Habit not found" }, { status: 404 })
      throw error
    }

    return NextResponse.json(upserted)
  } catch (error) {
    console.error("[v0] Create habit log error:", error)
    return NextResponse.json({ error: "Failed to create habit log" }, { status: 500 })
  }
}
