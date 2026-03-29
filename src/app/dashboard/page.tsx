import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Server, Terminal, Clock } from "lucide-react"

async function getMetrics() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/metrics`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getRecentLogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/logs?limit=5`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.logs ?? []
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const [metrics, logs] = await Promise.all([getMetrics(), getRecentLogs()])

  const stats = [
    {
      label: "Active Servers",
      value: metrics?.servers ?? "—",
      icon: Server,
      description: "Servers Hermes is in",
    },
    {
      label: "Commands Today",
      value: metrics?.commandsToday ?? "—",
      icon: Terminal,
      description: "Commands processed today",
    },
    {
      label: "Uptime",
      value: metrics?.uptime ?? "—",
      icon: Activity,
      description: "Bot uptime",
    },
    {
      label: "Last Active",
      value: metrics?.lastActive ?? "—",
      icon: Clock,
      description: "Most recent command",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Command Center</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Overview of your Hermes assistant
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-neutral-400">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Terminal className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">No commands yet</p>
              <p className="mt-1 text-xs text-neutral-400">
                Start using Hermes in Discord to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log: { id: string; command: string; response: string; timestamp: string }, i: number) => (
                <div
                  key={log.id ?? i}
                  className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
                >
                  <div className="mt-0.5 rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs dark:bg-neutral-800">
                    {log.command}
                  </div>
                  <p className="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
                    {log.response}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Version</span>
                <Badge variant="secondary">1.0.0</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Environment</span>
                <Badge variant="secondary">Production</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Redis</span>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="https://discord.com/oauth2/authorize"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
            >
              <Server className="h-4 w-4" />
              Invite Hermes to a server
            </a>
            <a
              href="https://github.com/dreamvalian"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
            >
              <Terminal className="h-4 w-4" />
              View source on GitHub
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
