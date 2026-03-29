"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Terminal, Search, RefreshCw } from "lucide-react"

interface LogEntry {
  id: string
  command: string
  response: string
  timestamp: string
  server?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "today" | "week">("all")

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "50" })
      if (filter === "today") params.set("filter", "today")
      else if (filter === "week") params.set("filter", "week")

      const res = await fetch(`/api/logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const filteredLogs = logs.filter(
    (log) =>
      log.command.toLowerCase().includes(search.toLowerCase()) ||
      log.response.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Command Log</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Searchable history of all Hermes commands
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search commands or responses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "today", "week"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Time" : f === "today" ? "Today" : "This Week"}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-500">
            {filteredLogs.length} commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Terminal className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">
                {search ? "No matching commands" : "No commands yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
                >
                  <div className="mt-0.5 shrink-0 rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs dark:bg-neutral-800">
                    {log.command}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-neutral-600 dark:text-neutral-400">
                      {log.response}
                    </p>
                    {log.server && (
                      <p className="mt-1 text-xs text-neutral-400">{log.server}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-neutral-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
