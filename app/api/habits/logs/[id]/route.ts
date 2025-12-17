import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params

    const { data: deleted, error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) throw error
    if (!deleted) return NextResponse.json({ error: "Habit log not found" }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete habit log error:", error)
    return NextResponse.json({ error: "Failed to delete habit log" }, { status: 500 })
  }
}
