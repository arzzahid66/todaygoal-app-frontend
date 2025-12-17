import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "user"
}

export async function getSession(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id,email,full_name,role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) return null
    return profile as User
  } catch (error) {
    console.error("[v0] Session error:", error)
    return null
  }
}

export async function destroySession(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
}

export async function requireAuth(): Promise<User> {
  const user = await getSession()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
  return user
}
