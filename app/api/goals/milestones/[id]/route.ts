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

    const { completed, completed_at } = body

    // RLS update policy ensures the milestone belongs to the current user's goal.
    const { data: updated, error } = await supabase
      .from("goal_milestones")
      .update({ completed, completed_at })
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) throw error
    if (!updated) return NextResponse.json({ error: "Milestone not found" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] Update milestone error:", error)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
