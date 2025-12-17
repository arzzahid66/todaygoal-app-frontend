import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date")

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false })

    if (date) query = query.eq("scheduled_date", date)

    const { data: tasks, error } = await query
    if (error) throw error

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[v0] Get tasks error:", error)
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

    const { title, description, priority, energy_level, scheduled_date } = body

    const { data: inserted, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title,
        description,
        priority,
        energy_level,
        scheduled_date,
      })
      .select("*")
      .single()

    if (error) throw error
    return NextResponse.json(inserted)
  } catch (error) {
    console.error("[v0] Create task error:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
