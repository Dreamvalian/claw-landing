"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error" | "running";
  lastRun: string;
  nextRun: string;
}

const mockLogs: LogEntry[] = [
  { timestamp: "14:32:15", level: "success", message: "Agent initialized" },
  { timestamp: "14:30:00", level: "info", message: "Cron job started" },
  { timestamp: "14:28:45", level: "warning", message: "High memory: 78%" },
  { timestamp: "14:25:12", level: "info", message: "Connected to API" },
  { timestamp: "14:20:00", level: "error", message: "Fetch failed - retrying" },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

const getLogColor = (level: string) => {
  switch (level) {
    case "info": return "text-blue-600 bg-blue-50";
    case "warning": return "text-amber-600 bg-amber-50";
    case "error": return "text-red-600 bg-red-50";
    case "success": return "text-green-600 bg-green-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const getJobStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-500";
    case "running": return "bg-blue-500 animate-pulse";
    case "paused": return "bg-gray-400";
    case "error": return "bg-red-500";
    default: return "bg-gray-400";
  }
};

const getJobStatusBadge = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-700";
    case "running": return "bg-blue-100 text-blue-700";
    case "paused": return "bg-gray-100 text-gray-700";
    case "error": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "cronjobs">("overview");

  const status = {
    agent: "online",
    uptime: "24/7",
    version: "2026.3.8",
    model: "MiniMax-M2.5",
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-3 overflow-hidden" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="w-full max-w-2xl flex flex-col">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-2"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl mb-1"
          >
            🦦
          </motion.div>

          <h1 className="text-3xl font-bold mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Claw
          </h1>

          <p className="text-slate-500 text-sm mb-2">
            Koala&apos;s 24/7 AI Assistant
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-slate-700 text-xs font-medium">Online & Ready</span>
          </div>
        </motion.div>

        {/* Tab Navigation - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-center gap-2 mb-2"
        >
          {[
            { id: "overview", label: "Overview" },
            { id: "logs", label: "Logs" },
            { id: "cronjobs", label: "Cron Jobs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content - Fixed Height */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex-1"
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-2">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-2 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Uptime</p>
                    <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.uptime}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-2 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Version</p>
                    <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.version}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-2 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Model</p>
                    <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.model}</p>
                  </CardContent>
                </Card>
              </div>

              {/* About Card */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-3">
                  <h2 className="text-purple-600 font-semibold mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>About Me</h2>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    I&apos;m Claw — a fast, no-nonsense AI agent built on OpenClaw. 
                    I handle tasks autonomously and operate around the clock.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === "logs" && (
            <Card className="bg-white border-slate-200 shadow-sm h-full">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-slate-800 font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>System Logs</h2>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">I:{mockLogs.filter(l => l.level === "info").length}</span>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded">W:{mockLogs.filter(l => l.level === "warning").length}</span>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded">E:{mockLogs.filter(l => l.level === "error").length}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {mockLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-slate-50">
                      <span className={`px-1 py-0.5 text-[9px] font-medium rounded ${getLogColor(log.level)}`}>
                        {log.level[0].toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      <span className="text-xs text-slate-700 truncate">{log.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cron Jobs Tab */}
          {activeTab === "cronjobs" && (
            <Card className="bg-white border-slate-200 shadow-sm h-full">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-slate-800 font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Cron Jobs</h2>
                  <span className="text-xs text-slate-500">{mockCronJobs.filter(j => j.status === "active" || j.status === "running").length} Active</span>
                </div>
                <div className="space-y-1.5">
                  {mockCronJobs.map((job) => (
                    <div key={job.id} className="p-2 rounded border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${getJobStatusColor(job.status)}`}></span>
                          <span className="font-medium text-slate-800 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{job.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[9px] rounded ${getJobStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                        <span className="font-mono">{job.schedule}</span>
                        <span>Next: {job.nextRun}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Footer - Compact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-400 text-[10px] mt-2"
        >
          Built for Koala • Running on OpenClaw
        </motion.p>
      </div>
    </div>
  );
}
