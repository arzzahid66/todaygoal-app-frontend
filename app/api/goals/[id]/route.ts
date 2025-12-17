import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await request.json()

    const { category, title, description, target_date, status } = body

    const { data: updated, error } = await supabase
      .from("life_goals")
      .update({
        category,
        title,
        description,
        target_date,
        status: status || "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle()

    if (error) throw error
    if (!updated) return NextResponse.json({ error: "Goal not found" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] Update goal error:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params

    const { data: deleted, error } = await supabase
      .from("life_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) throw error
    if (!deleted) return NextResponse.json({ error: "Goal not found" }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete goal error:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
