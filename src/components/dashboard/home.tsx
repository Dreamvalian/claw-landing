"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Clock,
  Cpu,
  Zap,
  Terminal,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  MessageSquare,
  User,
  Wifi,
  WifiOff,
} from "lucide-react"

interface HermesData {
  uptime: string
  uptime_seconds: number
  hermes_uptime: string
  model: string
  provider: string
  toolsets: string[]
  skills: { name: string; source: string }[]
  cron_jobs: CronJob[]
  heartbeat: Record<string, unknown> | null
}

interface CronJob {
  id: string
  name: string
  schedule: string
  next_run: string
  last_run: string
  last_status: string
  enabled: boolean
}

interface ActiveSession {
  session_key: string
  session_id: string
  display_name: string
  platform: string
  chat_type: string
  user_name: string
  chat_id: string
  created_at: string
  updated_at: string
  age_minutes: number
  is_cron: boolean
  is_current: boolean
  input_tokens: number
  output_tokens: number
  total_tokens: number
}

interface SystemLog {
  id: string
  level?: string
  source?: string
  message?: string
  timestamp: string
  _index: number
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ok" || status === "success" || status === "completed")
    return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 gap-1"><CheckCircle2 className="h-3 w-3" /> {status}</Badge>
  if (status === "error" || status === "failed")
    return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 gap-1"><XCircle className="h-3 w-3" /> {status}</Badge>
  return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10 gap-1"><AlertCircle className="h-3 w-3" /> {status}</Badge>
}

function PlatformIcon({ platform, chatType }: { platform: string; chatType: string }) {
  if (platform === "discord") {
    if (chatType === "dm") return <Badge variant="secondary" className="text-xs">DM</Badge>
    if (chatType === "thread") return <Badge variant="secondary" className="text-xs">Thread</Badge>
    return <Badge variant="secondary" className="text-xs">Discord</Badge>
  }
  return <Badge variant="secondary" className="text-xs">{platform}</Badge>
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DashboardHome() {
  const [data, setData] = useState<HermesData | null>(null)
  const [sessions, setSessions] = useState<{ active: ActiveSession[]; cron: ActiveSession[] } | null>(null)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [logFilter, setLogFilter] = useState<"all" | "today" | "hour">("all")
  const [logSearch, setLogSearch] = useState("")
  const [connected, setConnected] = useState({ hermes: false, sessions: false, logs: false })
  const [mcpServers, setMcpServers] = useState<{ name: string; status: string; transport: string }[]>([])

  // SSE event sources
  const hermesES = useRef<EventSource | null>(null)
  const sessionsES = useRef<EventSource | null>(null)
  const logsPoll = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup all EventSources
  const cleanup = useCallback(() => {
    hermesES.current?.close()
    sessionsES.current?.close()
    logsPoll.current && clearInterval(logsPoll.current)
    hermesES.current = null
    sessionsES.current = null
    logsPoll.current = null
  }, [])

  // Connect SSE for hermes data
  useEffect(() => {
    if (hermesES.current) hermesES.current.close()

    const es = new EventSource("/api/stream/hermes")
    hermesES.current = es

    es.onopen = () => setConnected((c) => ({ ...c, hermes: true }))

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type === "hermes") {
          setData({
            uptime: payload.uptime,
            uptime_seconds: payload.uptime_seconds,
            hermes_uptime: payload.hermes_uptime,
            model: payload.model,
            provider: payload.provider,
            toolsets: payload.toolsets,
            skills: payload.skills,
            cron_jobs: payload.cron_jobs,
            heartbeat: payload.heartbeat,
          })
          setLoading(false)
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      setConnected((c) => ({ ...c, hermes: false }))
      setLoading(false)
    }

    return () => es.close()
  }, [])

  // Connect SSE for sessions
  useEffect(() => {
    if (sessionsES.current) sessionsES.current.close()

    const es = new EventSource("/api/stream/sessions")
    sessionsES.current = es

    es.onopen = () => setConnected((c) => ({ ...c, sessions: true }))

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type === "sessions") {
          setSessions({ active: payload.active, cron: payload.cron })
          setSessionLoading(false)
        }
      } catch {
        // ignore
      }
    }

    es.onerror = () => {
      setConnected((c) => ({ ...c, sessions: false }))
      setSessionLoading(false)
    }

    return () => es.close()
  }, [])

  // Poll logs every 5s
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/stream/logs")
        if (!res.ok) throw new Error("fetch failed")
        const payload = await res.json()
        if (payload.type === "logs") {
          setLogs(payload.logs ?? [])
          setConnected((c) => ({ ...c, logs: true }))
        }
      } catch {
        setConnected((c) => ({ ...c, logs: false }))
      }
    }

    fetchLogs()
    logsPoll.current = setInterval(fetchLogs, 5000)
    return () => {
      if (logsPoll.current) clearInterval(logsPoll.current)
    }
  }, [])

  // Fetch MCP servers
  useEffect(() => {
    async function fetchMcp() {
      try {
        const res = await fetch("/api/mcp")
        if (res.ok) {
          const d = await res.json()
          setMcpServers(d.servers ?? [])
        }
      } catch { /* ignore */ }
    }
    fetchMcp()
    const interval = setInterval(fetchMcp, 30000)
    return () => clearInterval(interval)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  // Manual refresh
  const handleRefresh = useCallback(() => {
    // Force reconnect by closing and reopening
    if (hermesES.current) {
      hermesES.current.close()
      setConnected((c) => ({ ...c, hermes: false }))
      setTimeout(() => {
        const es = new EventSource("/api/stream/hermes")
        hermesES.current = es
        es.onmessage = hermesES.current.onmessage
        es.onerror = hermesES.current.onerror
      }, 100)
    }
  }, [])

  const filteredLogs = logs.filter((l) => {
    const q = logSearch.toLowerCase()
    if (!q) return true
    return (
      (l.command ?? "").toLowerCase().includes(q) ||
      (l.response ?? "").toLowerCase().includes(q) ||
      (l.message ?? "").toLowerCase().includes(q)
    )
  })

  const activeCrons = data?.cron_jobs.filter((j) => j.enabled) ?? []
  const totalCrons = activeCrons.length
  const okCrons = activeCrons.filter((j) => j.last_status === "ok").length
  const totalConnected = connected.hermes && connected.sessions && connected.logs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hermes Status</h1>
          <p className="mt-1 text-sm text-neutral-500 flex items-center gap-2">
            Real-time — updates instantly
            <span className={`flex items-center gap-1 text-xs font-medium ${totalConnected ? "text-green-500" : "text-orange-500"}`}>
              {totalConnected ? (
                <><Wifi className="h-3 w-3" /> Live</>
              ) : (
                <><WifiOff className="h-3 w-3" /> Reconnecting...</>
              )}
            </span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className={`h-4 w-4`} />
          Refresh
        </Button>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Hermes Uptime</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "—" : (data?.hermes_uptime ?? "—")}</p>
            <p className="text-xs text-neutral-400">Dashboard process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">System Uptime</CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "—" : (data?.uptime ?? "—")}</p>
            <p className="text-xs text-neutral-400">Server up since last boot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Model</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold truncate">{loading ? "—" : (data?.model ?? "—")}</p>
            <p className="text-xs text-neutral-400">{loading ? "" : (data?.provider ?? "—")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Crons</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? "—" : `${okCrons}/${totalCrons}`}
            </p>
            <p className="text-xs text-neutral-400">
              {loading ? "" : `${totalCrons} scheduled`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Active Sessions
              <span className={`ml-1 flex items-center gap-1 ${connected.sessions ? "text-green-500" : "text-orange-400"}`}>
                {connected.sessions ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sessionLoading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : !sessions || sessions.active.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4 text-center">No active sessions</p>
          ) : (
            <div className="space-y-2">
              {/* Current sessions — highlighted */}
              {sessions.active.filter((s) => s.is_current).length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-2">
                    ● Current — Active Now
                  </p>
                  {sessions.active.filter((s) => s.is_current).map((s) => (
                    <div key={s.session_key} className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50/50 px-3 py-2.5 dark:border-green-800 dark:bg-green-900/10">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                          <p className="text-sm font-semibold truncate">{s.display_name}</p>
                          <PlatformIcon platform={s.platform} chatType={s.chat_type} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <User className="h-3 w-3" /> {s.user_name}
                          </span>
                          <span className="text-xs text-green-500 font-mono">{timeAgo(s.updated_at)}</span>
                          <span className="text-xs text-neutral-400 font-mono">{s.total_tokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-neutral-400 font-mono">{s.session_id.split("_").slice(0, 2).join("_")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inactive sessions — dimmed */}
              {sessions.active.filter((s) => !s.is_current).length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
                    ○ Inactive — Past Sessions
                  </p>
                  {sessions.active.filter((s) => !s.is_current).map((s) => (
                    <div key={s.session_key} className="flex items-center gap-3 rounded-md border border-neutral-100 px-3 py-2 dark:border-neutral-800 opacity-60 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{s.display_name}</p>
                          <PlatformIcon platform={s.platform} chatType={s.chat_type} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <User className="h-3 w-3" /> {s.user_name}
                          </span>
                          <span className="text-xs text-neutral-500">{timeAgo(s.updated_at)}</span>
                          <span className="text-xs text-neutral-400 font-mono">{s.total_tokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-neutral-400 font-mono">{s.session_id.split("_").slice(0, 2).join("_")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cron Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Scheduled Cron Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : activeCrons.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4 text-center">No active cron jobs</p>
          ) : (
            <div className="space-y-2">
              {activeCrons.slice(0, 20).map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-md border border-neutral-100 px-3 py-2 dark:border-neutral-800">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{job.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">{job.schedule}</p>
                  </div>
                  <div className="ml-2 flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={job.last_status} />
                    <p className="text-xs text-neutral-500">
                      {job.next_run ? `Next: ${new Date(job.next_run).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })}` : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Skills</CardTitle>
            <span className="text-xs text-neutral-400">
              {loading ? "—" : `${(data?.skills ?? []).length} installed`}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : (data?.skills ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">No skills found</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {(data?.skills ?? []).map((s) => (
                <Badge key={`skill-${s.name}`} variant="secondary" className="text-xs">
                  {s.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plugins */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Plugins</CardTitle>
            <span className="text-xs text-neutral-400">
              {loading ? "—" : `${(data?.plugins ?? []).length} installed`}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : (data?.plugins ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">No plugins installed</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {(data?.plugins ?? []).map((p) => (
                <Badge key={`plugin-${p.name}`} variant="outline" className="text-xs">
                  {p.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MCP Servers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">MCP Servers</CardTitle>
            <span className="text-xs text-neutral-400">
              {mcpServers.length} configured
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {mcpServers.length === 0 ? (
            <p className="text-sm text-neutral-500">No MCP servers configured</p>
          ) : (
            <div className="space-y-2">
              {mcpServers.map((srv) => (
                <div key={srv.name} className="flex items-center justify-between rounded-md border border-neutral-100 dark:border-neutral-800 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{srv.name}</p>
                    <p className="text-xs text-neutral-400">{srv.transport}</p>
                  </div>
                  <Badge className={`shrink-0 text-xs ${srv.status === "running" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {srv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Heartbeat */}
      {data?.heartbeat && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Heartbeat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-neutral-500">Redis</span>
                <span className="ml-auto text-sm font-medium">
                  {((data.heartbeat as Record<string, unknown>)?.redis as Record<string, unknown>)?.connected ? "Connected" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-neutral-500">Memory</span>
                <span className="ml-auto text-sm font-medium">
                  {((data.heartbeat as Record<string, unknown>)?.memory as Record<string, number>)?.used ?? "—"} MB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-neutral-500">Status</span>
                <span className="ml-auto text-sm font-medium">
                  {(data.heartbeat as Record<string, unknown>)?.status ?? "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              System Logs
              <span className={`ml-1 flex items-center gap-1 ${connected.logs ? "text-green-500" : "text-orange-400"}`}>
                {connected.logs ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              </span>
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-8 h-8 text-xs w-40 rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 dark:border-neutral-800 dark:bg-neutral-950"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "today", "hour"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={logFilter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLogFilter(f)}
                    className="h-8 text-xs px-2"
                  >
                    {f === "all" ? "All" : f === "today" ? "Today" : "1h"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Terminal className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">No logs found</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id ?? log._index}
                  className="flex items-start gap-3 rounded-md border border-neutral-100 px-3 py-2 dark:border-neutral-800"
                >
                  <div className="mt-0.5 shrink-0 rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs dark:bg-neutral-800">
                    {log.command ?? "—"}
                  </div>
                  <p className="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
                    {log.response ?? log.message ?? ""}
                  </p>
                  <p className="shrink-0 text-xs text-neutral-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) : "—"}
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
