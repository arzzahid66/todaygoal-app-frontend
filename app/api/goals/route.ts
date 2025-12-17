import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: goals, error } = await supabase
      .from("life_goals")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(goals)
  } catch (error) {
    console.error("[v0] Get goals error:", error)
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

    const { category, title, description, target_date, status } = body

    const { data: inserted, error } = await supabase
      .from("life_goals")
      .insert({
        user_id: user.id,
        category,
        title,
        description,
        target_date,
        status,
      })
      .select("*")
      .single()

    if (error) throw error
    return NextResponse.json(inserted)
  } catch (error) {
    console.error("[v0] Create goal error:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
