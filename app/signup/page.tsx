import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import SignUpForm from "@/components/signup-form"

export default async function SignUpPage() {
  const user = await getSession()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <SignUpForm />
    </div>
  )
}
