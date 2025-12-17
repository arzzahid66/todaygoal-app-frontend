import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // RLS on goal_milestones already ensures access via life_goals.user_id = auth.uid()
    const { data: milestones, error } = await supabase.from("goal_milestones").select("*").order("created_at", { ascending: true })
    if (error) throw error

    return NextResponse.json(milestones)
  } catch (error) {
    console.error("[v0] Get milestones error:", error)
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

    const { goal_id, title } = body

    // RLS insert policy checks the goal belongs to auth.uid().
    const { data: inserted, error } = await supabase
      .from("goal_milestones")
      .insert({ goal_id, title })
      .select("*")
      .single()

    if (error) {
      if (error.code === "23503") return NextResponse.json({ error: "Goal not found" }, { status: 404 })
      throw error
    }
    return NextResponse.json(inserted)
  } catch (error) {
    console.error("[v0] Create milestone error:", error)
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 })
  }
}
