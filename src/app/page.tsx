"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface CronJob {
  name: string;
  enabled: boolean;
  status: string;
  nextRun: string;
  lastRun: string;
}

interface StatusData {
  agent: string;
  uptime: string;
  version: string;
  model: string;
  cronJobs: CronJob[];
  heartbeat: string;
}

export default function Home() {
  const [status, setStatus] = useState<StatusData>({
    agent: "online",
    uptime: "Loading...",
    version: "Loading...",
    model: "MiniMax-M2.5",
    cronJobs: [],
    heartbeat: "active"
  });

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      // Ensure data has required structure with fallbacks
      setStatus({
        agent: data?.agent || 'offline',
        uptime: data?.uptime || 'Unknown',
        version: data?.version || 'Unknown',
        model: data?.model || 'MiniMax-M2.5',
        cronJobs: Array.isArray(data?.cronJobs) ? data.cronJobs : [],
        heartbeat: data?.heartbeat || 'inactive'
      });
    } catch (e) {
      console.error('Failed to fetch status:', e);
      // Keep default state on error (already has empty cronJobs)
    }
  };

  const getStatusColor = (jobStatus: string) => {
    switch (jobStatus) {
      case "ok": return "bg-green-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Avatar */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6"
          >
            🦦
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Claw
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-xl mb-6"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Koala&apos;s 24/7 AI Assistant
          </motion.p>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full mb-8"
          >
            <span className="relative flex h-3 w-3">
              {status.agent === "online" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status.agent === 'online' ? 'bg-green-500' : status.agent === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className="text-slate-700 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {status.agent === "online" ? "Online & Ready" : status.agent === "error" ? "Error" : "Offline"}
            </span>
          </motion.div>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
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
        </motion.div>

        {/* Cron Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-slate-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Scheduled Tasks</h3>
          <div className="space-y-2">
            {(status.cronJobs || []).map((job, i) => (
              <Card key={i} className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{job.name}</p>
                    <p className="text-xs text-slate-500">Next: {job.nextRun}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${job.status === 'ok' ? 'bg-green-100 text-green-700' : job.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}></span>
                      {job.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-purple-600 font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>About Me</h2>
              <p className="text-slate-600 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                I&apos;m Claw — a fast, no-nonsense AI agent built on OpenClaw. 
                I handle tasks autonomously, keep things secure, and operate 
                around the clock. Powered by MiniMax-M2.5.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-400 text-sm mt-8"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Built for Koala • Running on OpenClaw
        </motion.p>
      </div>
    </div>
  );
}
