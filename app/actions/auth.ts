"use server"

import { redirect } from "next/navigation"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { success: true }
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return { error: "An error occurred during sign in" }
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const supabase = await createSupabaseServerClient()

    const admin = createSupabaseAdminClient()

    // Create Supabase Auth user + profile row (public.users) with matching id (auth.uid()).
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (createError || !created.user) return { error: createError?.message || "Failed to create user" }

    const userId = created.user.id

    const { error: profileError } = await admin.from("users").insert({
      id: userId,
      email,
      full_name: fullName,
      role: "user",
    })
    if (profileError) return { error: profileError.message }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return { error: signInError.message }

    return { success: true }
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return { error: "An error occurred during sign up" }
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function createInvite(email: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Create invite row (RLS expects admin user based on public.users.role)
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { error: insertError } = await supabase.from("invites").insert({
      email,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
    })
    if (insertError) return { error: insertError.message }

    // Send email via Supabase Edge Function (which uses Resend).
    // You created this function already; set SUPABASE_INVITE_FUNCTION_NAME to its name.
    const functionName = process.env.SUPABASE_INVITE_FUNCTION_NAME
    if (functionName) {
      const h = await headers()
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        h.get("origin") ||
        `${h.get("x-forwarded-proto") || "http"}://${h.get("x-forwarded-host") || h.get("host")}`

      const signupUrl = new URL("/signup", origin)
      signupUrl.searchParams.set("token", token)

      await supabase.functions.invoke(functionName, {
        body: { email, signup_url: signupUrl.toString() },
      })
    }

    return { success: true, token }
  } catch (error) {
    console.error("[v0] Create invite error:", error)
    return { error: "Failed to create invite" }
  }
}

