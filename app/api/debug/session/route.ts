import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    return NextResponse.json({ ok: false, step: "auth.getUser", error: userError.message }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ ok: false, step: "auth.getUser", user: null }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase.from("users").select("id,email,full_name,role").eq("id", user.id).maybeSingle()

  return NextResponse.json({
    ok: true,
    authUser: { id: user.id, email: user.email },
    profile,
    profileError: profileError?.message || null,
  })
}


