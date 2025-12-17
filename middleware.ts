import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // If env vars aren't configured (common in fresh Vercel projects), don't break the whole site.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Refresh session if expired - required for Server Components.
  let user: unknown = null
  try {
    // Vercel runs a separate TS check for middleware; the Supabase auth type may not expose these methods
    // even though they exist at runtime. Use a narrow escape hatch here.
    const auth = supabase.auth as unknown as {
      getSession: () => Promise<{ data?: { session?: { user?: unknown } } }>
    }
    const { data } = await auth.getSession()
    user = data?.session?.user ?? null
  } catch {
    user = null
  }

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
  const isPublicPage = pathname === "/"

  if (!user && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


