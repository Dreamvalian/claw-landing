"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Sheet } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Terminal, Settings, LogOut } from "lucide-react"
import { signOut } from "@/lib/actions"
import { cn } from "@/lib/utils"
import type { DiscordUser } from "@/lib/discord-auth"

interface HeaderProps {
  user: DiscordUser
}

const navItems = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/logs", label: "System Logs", icon: Terminal },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function DashboardHeader({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.id) >> 22 % 6}.png`

  const initials = user.username.slice(0, 2).toUpperCase()

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950 md:px-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={user.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-neutral-500">Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="flex h-full w-64 flex-col">
          <div className="flex h-14 items-center border-b border-neutral-200 px-4 dark:border-neutral-800">
            <Link href="/" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>
              Hermes
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </Sheet>
    </>
  )
}
