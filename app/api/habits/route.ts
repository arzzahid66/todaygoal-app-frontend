import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: habits, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(habits)
  } catch (error) {
    console.error("[v0] Get habits error:", error)
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

    const { name, description, color, frequency, target_count } = body

    const { data: inserted, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name,
        description,
        color,
        frequency,
        target_count,
      })
      .select("*")
      .single()

    if (error) throw error
    return NextResponse.json(inserted)
  } catch (error) {
    console.error("[v0] Create habit error:", error)
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 })
  }
}
