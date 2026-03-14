"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Clock, Settings, CheckCircle, AlertCircle, Bot, Zap, 
  Server, HardDrive, Menu, X, GitBranch, RefreshCw, Terminal,
  Shield, Database, Wifi, Cpu
} from "lucide-react";

type View = "dashboard" | "logs" | "cron" | "system";
type LogLevel = "info" | "success" | "warning" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
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

const COLORS = {
  koala: "#8B6914",
  koalaLight: "#D4A843",
  cream: "#F5E6D3",
  green: "#4CAF50",
  orange: "#FF9800",
  red: "#FF5252",
};

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [cronLoading, setCronLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({ 
    gateway: "unknown", 
    hyperspace: "unknown", 
    disk: "unknown",
    uptime: "calculating..."
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cronRes, logsRes] = await Promise.all([
          fetch("/api/cron"),
          fetch("/api/logs")
        ]);
        
        const cronData = await cronRes.json();
        const logsData = await logsRes.json();
        
        if (cronData.system) setSystemStatus(cronData.system);
        if (logsData.logs) setLogs(logsData.logs.slice(0, 50));
        if (cronData.jobs) {
          setCronJobs(cronData.jobs.map((j: any, i: number) => ({
            id: String(i + 1),
            name: j.name,
            schedule: j.schedule,
            status: j.status === "running" ? "running" : "active",
            lastRun: j.lastRun || "Never",
            nextRun: j.nextRun || "N/A",
          })));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setCronLoading(false);
        setLogsLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } catch {
      return ts;
    }
  };

  const navItems = [
    { view: "dashboard" as View, icon: Terminal, label: "Dashboard" },
    { view: "system" as View, icon: Cpu, label: "System" },
    { view: "cron" as View, icon: Clock, label: "Jobs" },
    { view: "logs" as View, icon: Database, label: "Logs" },
  ];

  const stats = [
    { 
      label: "Gateway", 
      value: systemStatus.gateway === "running" ? "Online" : "Offline", 
      icon: Server, 
      color: systemStatus.gateway === "running" ? COLORS.green : COLORS.red,
      sub: systemStatus.gateway
    },
    { 
      label: "Hyperspace", 
      value: systemStatus.hyperspace === "RUNNING" ? "Active" : "Idle", 
      icon: Zap, 
      color: systemStatus.hyperspace === "RUNNING" ? COLORS.green : COLORS.orange,
      sub: systemStatus.hyperspace
    },
    { 
      label: "Disk", 
      value: systemStatus.disk || "N/A", 
      icon: HardDrive, 
      color: COLORS.koalaLight,
      sub: "storage"
    },
    { 
      label: "Jobs", 
      value: String(cronJobs.length), 
      icon: Clock, 
      color: COLORS.orange,
      sub: "active"
    },
  ];

  return (
    <div className="koala-bg" />
    
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col"
        style={{ background: "rgba(15, 15, 35, 0.95)" }}
      >
        {/* Logo */}
        <div className="p-8 border-b border-white/5">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-2"
            >
              🦦
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: COLORS.koala }}>
              KOALA
            </h1>
            <p className="text-sm text-white/50">Assistance Hub</p>
          </motion.div>
        </div>
        
        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.view}
              whileHover={{ x: 8, backgroundColor: "rgba(139, 105, 20, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveView(item.view); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                activeView === item.view ? "font-bold" : "text-white/60"
              }`}
              style={{ 
                background: activeView === item.view ? "rgba(139, 105, 20, 0.3)" : "transparent",
                border: activeView === item.view ? `1px solid ${COLORS.koala}` : "1px solid transparent"
              }}
            >
              <item.icon size={20} style={{ color: activeView === item.view ? COLORS.koala : "inherit" }} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-xs text-white/30">v2026.3.12</p>
            <p className="text-xs text-white/20">Always Online 🦦</p>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        {/* Header */}
        <header 
          className="sticky top-0 z-40 backdrop-blur-xl border-b"
          style={{ background: "rgba(15, 15, 35, 0.8)", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between px-8 py-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS.green, boxShadow: `0 0 15px ${COLORS.green}` }}
              />
              <span className="text-sm text-white/60">All Systems Operational</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Dashboard */}
            {activeView === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Hero */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-10 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" 
                    style={{ background: `radial-gradient(circle, ${COLORS.koala} 0%, transparent 70%)` }} 
                  />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: COLORS.koala }}>
                        🤖 AI ASSISTANT
                      </p>
                      <h1 className="text-4xl font-black mb-3">
                        Welcome back, Koala
                      </h1>
                      <p className="text-white/60 max-w-lg">
                        Your AI assistant is running smoothly. All systems operational and ready to help.
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-8xl"
                    >
                      🦦
                    </motion.div>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon size={20} style={{ color: stat.color }} />
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            background: stat.color,
                            boxShadow: `0 0 10px ${stat.color}`
                          }}
                        />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-white/50">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: RefreshCw, label: "Refresh", color: COLORS.koala },
                    { icon: GitBranch, label: "Logs", color: COLORS.green },
                    { icon: Settings, label: "Config", color: COLORS.orange },
                  ].map((action, i) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-card p-4 flex items-center justify-center gap-3 font-medium"
                      style={{ borderColor: `${action.color}30` }}
                    >
                      <action.icon size={18} style={{ color: action.color }} />
                      <span>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* System */}
            {activeView === "system" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">System Status</h2>
                
                <div className="grid gap-4">
                  {[
                    { name: "OpenClaw Gateway", status: systemStatus.gateway, icon: Bot },
                    { name: "Hyperspace Node", status: systemStatus.hyperspace, icon: Zap },
                    { name: "Storage", status: systemStatus.disk, icon: HardDrive },
                    { name: "Network", status: "Online", icon: Wifi },
                    { name: "Security", status: "Active", icon: Shield },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={20} style={{ color: COLORS.koala }} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-white/50">{item.status}</p>
                        </div>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          background: item.status === "running" || item.status === "Online" || item.status === "Active" 
                            ? `${COLORS.green}20` 
                            : `${COLORS.orange}20`,
                          color: item.status === "running" || item.status === "Online" || item.status === "Active"
                            ? COLORS.green 
                            : COLORS.orange
                        }}
                      >
                        {item.status === "running" || item.status === "Online" || item.status === "Active" ? "Online" : "Offline"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Cron Jobs */}
            {activeView === "cron" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Cron Jobs</h2>
                  <span className="text-sm text-white/50">{cronJobs.length} active</span>
                </div>
                
                <div className="grid gap-3">
                  {cronLoading ? (
                    <p className="text-center py-8 text-white/50">Loading...</p>
                  ) : (
                    cronJobs.map((job, i) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ 
                              background: job.status === "running" ? COLORS.green : job.status === "error" ? COLORS.red : COLORS.orange,
                              boxShadow: `0 0 8px ${job.status === "running" ? COLORS.green : job.status === "error" ? COLORS.red : COLORS.orange}`
                            }}
                          />
                          <div>
                            <p className="font-medium">{job.name}</p>
                            <p className="text-xs text-white/50 font-mono">{job.schedule}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{job.nextRun}</p>
                          <p className="text-xs text-white/30">next run</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Logs */}
            {activeView === "logs" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">System Logs</h2>
                
                <div className="space-y-2">
                  {logsLoading ? (
                    <p className="text-center py-8 text-white/50">Loading...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-center py-8 text-white/30">No logs yet</p>
                  ) : (
                    logs.map((log, i) => {
                      const colors = {
                        info: { bg: "rgba(0, 217, 255, 0.1)", color: "#00D9FF" },
                        success: { bg: "rgba(76, 175, 80, 0.1)", color: "#4CAF50" },
                        warning: { bg: "rgba(255, 152, 0, 0.1)", color: "#FF9800" },
                        error: { bg: "rgba(255, 82, 82, 0.1)", color: "#FF5252" },
                      };
                      const c = colors[log.level] || colors.info;
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="glass-card p-3 flex items-center gap-4"
                          style={{ background: c.bg }}
                        >
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: c.color }}
                          />
                          <span className="text-sm font-mono" style={{ color: c.color }}>
                            {formatTime(log.timestamp)}
                          </span>
                          <span className="flex-1 text-sm">{log.message}</span>
                          <span className="text-xs text-white/30">{log.source}</span>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
