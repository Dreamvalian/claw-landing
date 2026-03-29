import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server } from "lucide-react"

export default async function ServersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Servers</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage servers where Hermes is active
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Server className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
        <p className="mt-4 text-sm text-neutral-500">No servers connected</p>
        <p className="mt-1 text-xs text-neutral-400">
          Invite Hermes to your Discord server to see it here
        </p>
        <a
          href="https://discord.com/oauth2/authorize"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90"
        >
          Invite Hermes
        </a>
      </div>
    </div>
  )
}
