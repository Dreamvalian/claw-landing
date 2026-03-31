"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Clock, Zap, CheckCircle, XCircle } from "lucide-react"

interface CronJob {
  id: string
  name: string
  schedule: string
  repeat: string
  next_run: string
  deliver: string
  last_run: string | null
  last_status: string | null
  enabled: boolean
}

function formatSchedule(schedule: string): string {
  // Human-readable cron descriptions
  const map: Record<string, string> = {
    "0 * * * *": "Every hour",
    "0 */2 * * *": "Every 2 hours",
    "0 */6 * * *": "Every 6 hours",
    "0 */12 * * *": "Every 12 hours",
    "0 2 * * *": "Daily at 9 AM WIB",
    "0 13 * * *": "Daily at 8 PM WIB",
    "0 23 * * *": "Daily at 11 PM WIB",
  }
  return map[schedule] ?? schedule
}

function formatNextRun(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    if (diff < 0) return "Overdue"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h > 24) return `in ${Math.floor(h / 24)}d ${h % 24}h`
    if (h > 0) return `in ${h}h ${m}m`
    return `in ${m}m`
  } catch {
    return iso
  }
}

function formatLastRun(iso: string | null): string {
  if (!iso) return "Never"
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return "Just now"
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch {
    return iso
  }
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">—</Badge>
  if (status === "ok" || status === "success")
    return <Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>
  if (status === "error" || status === "failed")
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>
  return <Badge variant="outline">{status}</Badge>
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cron-jobs")
      const data = await res.json()
      setJobs(data.jobs ?? [])
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 30000)
    return () => clearInterval(interval)
  }, [])

  const activeJobs = jobs.filter((j) => j.enabled)
  const pausedJobs = jobs.filter((j) => !j.enabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cron Jobs</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {activeJobs.length} active · {pausedJobs.length} paused · Updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" /> Active ({activeJobs.length})
          </h2>
          <div className="grid gap-3">
            {activeJobs.map((job) => (
              <Card key={job.id} className="border-neutral-800 bg-neutral-950/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-amber-400/60">{job.id}</span>
                        <StatusBadge status={job.last_status} />
                      </div>
                      <h3 className="font-semibold text-neutral-100">{job.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatSchedule(job.schedule)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-neutral-600">→</span>
                          {job.deliver}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-amber-400">
                        {formatNextRun(job.next_run)}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Last: {formatLastRun(job.last_run)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Paused Jobs */}
      {pausedJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Paused ({pausedJobs.length})
          </h2>
          <div className="grid gap-3">
            {pausedJobs.map((job) => (
              <Card key={job.id} className="border-neutral-800 bg-neutral-950/20 opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-xs text-neutral-500 mr-2">{job.id}</span>
                      <span className="font-semibold text-neutral-400">{job.name}</span>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
                        <span>{formatSchedule(job.schedule)}</span>
                        <span>→ {job.deliver}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-neutral-500">
                      {formatNextRun(job.next_run)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && jobs.length === 0 && (
        <div className="flex items-center justify-center py-12 text-neutral-500">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Loading...
        </div>
      )}
    </div>
  )
}
