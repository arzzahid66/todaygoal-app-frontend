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

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) update.title = body.title
    if (body.description !== undefined) update.description = body.description
    if (body.priority !== undefined) update.priority = body.priority
    if (body.energy_level !== undefined) update.energy_level = body.energy_level
    if (body.status !== undefined) {
      update.status = body.status
      update.completed_at = body.status === "done" ? new Date().toISOString() : null
    }

    const { data: updated, error } = await supabase
      .from("tasks")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle()

    if (error) throw error
    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] Update task error:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
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
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) throw error
    if (!deleted) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete task error:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
