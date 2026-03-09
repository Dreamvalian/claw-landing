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
  { timestamp: "2026-03-09 14:32:15", level: "success", message: "Agent initialized successfully" },
  { timestamp: "2026-03-09 14:30:00", level: "info", message: "Cron job 'Daily Analysis' started" },
  { timestamp: "2026-03-09 14:28:45", level: "warning", message: "High memory usage detected: 78%" },
  { timestamp: "2026-03-09 14:25:12", level: "info", message: "Connected to MiniMax-M2.5 API" },
  { timestamp: "2026-03-09 14:20:00", level: "error", message: "Failed to fetch betting data - retrying..." },
  { timestamp: "2026-03-09 14:15:30", level: "success", message: "Database backup completed" },
  { timestamp: "2026-03-09 14:10:00", level: "info", message: "Session refreshed" },
  { timestamp: "2026-03-09 14:05:22", level: "warning", message: "API rate limit approaching: 85%" },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "2026-03-08 17:00", nextRun: "2026-03-09 17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "0 */6 * * *", status: "running", lastRun: "2026-03-09 12:00", nextRun: "2026-03-09 18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "2026-03-08 23:00", nextRun: "2026-03-09 23:00" },
  { id: "4", name: "Weekly Report", schedule: "0 9 * * 1", status: "paused", lastRun: "2026-03-03 09:00", nextRun: "2026-03-10 09:00" },
  { id: "5", name: "Health Check", schedule: "*/5 * * * *", status: "error", lastRun: "2026-03-09 14:30", nextRun: "2026-03-09 14:35" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6"
          >
            🦦
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Claw
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-xl mb-6"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Koala&apos;s 24/7 AI Assistant
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-slate-700 font-medium">
              Online & Ready
            </span>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center gap-2 mb-6"
        >
          {[
            { id: "overview", label: "Overview" },
            { id: "logs", label: "System Logs" },
            { id: "cronjobs", label: "Cron Jobs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Uptime</p>
                    <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.uptime}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Version</p>
                    <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.version}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Model</p>
                    <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{status.model}</p>
                  </CardContent>
                </Card>
              </div>

              {/* About Card */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-purple-600 font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>About Me</h2>
                  <p className="text-slate-600 leading-relaxed">
                    I&apos;m Claw — a fast, no-nonsense AI agent built on OpenClaw. 
                    I handle tasks autonomously, keep things secure, and operate 
                    around the clock. Powered by MiniMax-M2.5.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === "logs" && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>System Logs</h2>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{mockLogs.filter(l => l.level === "info").length} Info</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">{mockLogs.filter(l => l.level === "warning").length} Warnings</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{mockLogs.filter(l => l.level === "error").length} Errors</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {mockLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getLogColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700" style={{ fontFamily: 'Inter, sans-serif' }}>{log.message}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cron Jobs Tab */}
          {activeTab === "cronjobs" && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Cron Jobs</h2>
                  <span className="text-sm text-slate-500">{mockCronJobs.filter(j => j.status === "active" || j.status === "running").length} Active</span>
                </div>
                <div className="space-y-3">
                  {mockCronJobs.map((job) => (
                    <div key={job.id} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${getJobStatusColor(job.status)}`}></span>
                          <span className="font-medium text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{job.name}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getJobStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-slate-500 mt-3">
                        <div>
                          <p className="text-xs text-slate-400 uppercase">Schedule</p>
                          <p className="font-mono text-slate-600">{job.schedule}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase">Last Run</p>
                          <p>{job.lastRun}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase">Next Run</p>
                          <p>{job.nextRun}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-400 text-sm mt-8"
        >
          Built for Koala • Running on OpenClaw
        </motion.p>
      </div>
    </div>
  );
}
