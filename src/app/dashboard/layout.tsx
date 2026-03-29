import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/discord-auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export const metadata: Metadata = {
  title: "Dashboard — Hermes",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/api/auth/discord")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-950">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
