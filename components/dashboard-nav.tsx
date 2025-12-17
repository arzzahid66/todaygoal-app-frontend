"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/auth"
import { Calendar, CheckSquare, BookOpen, Timer, Target, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export default function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Today", icon: Calendar },
    { href: "/dashboard/habits", label: "Habits", icon: CheckSquare },
    { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
    { href: "/dashboard/focus", label: "Focus", icon: Timer },
    { href: "/dashboard/goals", label: "Goals", icon: Target },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              Serenity
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive ? "secondary" : "ghost"} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.full_name}</span>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t">
              <div className="px-4 py-2 text-sm text-gray-600">{user.full_name}</div>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
