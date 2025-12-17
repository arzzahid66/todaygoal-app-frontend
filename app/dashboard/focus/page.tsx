import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import DashboardNav from "@/components/dashboard-nav"
import FocusTimer from "@/components/focus-timer"

export default async function FocusPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardNav user={user} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FocusTimer userId={user.id} />
      </main>
    </div>
  )
}
