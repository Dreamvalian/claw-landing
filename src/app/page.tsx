"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, FileText, Clock, Terminal, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  source?: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error" | "running";
  lastRun: string;
  nextRun: string;
}

const defaultLogs: LogEntry[] = [
  { timestamp: new Date().toISOString(), level: "info", message: "Waiting for logs from OpenClaw..." },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

const getLogIcon = (level: string) => {
  switch (level) {
    case "info": return <Info className="w-4 h-4 text-blue-500" />;
    case "warning": return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case "error": return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
    default: return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const getLogBadge = (level: string) => {
  switch (level) {
    case "info": return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Info</Badge>;
    case "warning": return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Warning</Badge>;
    case "error": return <Badge variant="destructive">Error</Badge>;
    case "success": return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Success</Badge>;
    default: return <Badge variant="outline">Unknown</Badge>;
  }
};

const getJobStatusBadge = (status: string) => {
  switch (status) {
    case "active": return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>;
    case "running": return <Badge className="bg-blue-500">Running</Badge>;
    case "paused": return <Badge variant="outline">Paused</Badge>;
    case "error": return <Badge variant="destructive">Error</Badge>;
    default: return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        const res = await fetch("/api/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        const parsedLogs = (data.logs || []).map((log: LogEntry | string) => 
          typeof log === "string" ? JSON.parse(log) : log
        );
        setLogs(parsedLogs.length > 0 ? parsedLogs : defaultLogs);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setLogsError("Failed to load logs");
        setLogs(defaultLogs);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const status = {
    agent: "online",
    uptime: "24/7",
    version: "2026.3.8",
    model: "MiniMax-M2.5",
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", { 
        hour12: false, 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
      });
    } catch {
      return timestamp;
    }
  };

  const fadeIn = reduceMotion 
    ? {} 
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          {...fadeIn}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
            <span className="text-4xl">🦦</span>
          </div>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Claw
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Koala&apos;s 24/7 AI Assistant
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 ${reduceMotion ? '' : 'animate-ping'}`} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Online & Ready
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          {...fadeIn}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.uptime}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Version</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.version}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Model</CardTitle>
              <Terminal className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.model}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
              <TabsTrigger value="cronjobs">Cron Jobs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>About Claw</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    I&apos;m <strong>Claw</strong> — a fast, no-nonsense AI agent built on OpenClaw. 
                    I handle tasks autonomously, keep things secure, and operate 
                    around the clock. Powered by <span className="text-purple-600 font-medium">MiniMax-M2.5</span>.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    System Logs
                  </CardTitle>
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-500">
                      Info: {logs.filter(l => l.level === "info").length}
                    </span>
                    <span className="text-slate-500">
                      Warnings: {logs.filter(l => l.level === "warning").length}
                    </span>
                    <span className="text-slate-500">
                      Errors: {logs.filter(l => l.level === "error").length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {logsLoading && (
                    <div className="text-center py-8 text-slate-500">
                      Loading logs...
                    </div>
                  )}
                  
                  {logsError && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
                      {logsError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {logs.map((log, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {getLogIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getLogBadge(log.level)}
                            <span className="text-xs text-gray-400 font-mono">
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cron Jobs Tab */}
            <TabsContent value="cronjobs">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Cron Jobs
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {mockCronJobs.filter(j => j.status === "active" || j.status === "running").length} Active
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockCronJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {job.name}
                          </h3>
                          {getJobStatusBadge(job.status)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {job.schedule}
                          </span>
                          <span>Next: {job.nextRun}</span>
                          <span>Last: {job.lastRun}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          className="text-center text-sm text-gray-400 pt-4"
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          Built for Koala • Running on OpenClaw
        </motion.footer>
      </div>
    </main>
  );
}
