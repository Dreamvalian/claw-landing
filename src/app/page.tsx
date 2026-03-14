"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Server,
  Calendar,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  Bell,
  Zap,
  TrendingUp,
  Shield,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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

type View = "dashboard" | "logs" | "cronjobs";

const defaultLogs: LogEntry[] = [
  { timestamp: new Date().toISOString(), level: "info", message: "SYSTEM INITIALIZED. WAITING FOR OPENCLAW CONNECTION..." },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "DAILY FOOTBALL ANALYSIS", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "ASIAN HANDICAP SCAN", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "RESULTS COLLECTOR", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

const getLogIcon = (level: string) => {
  switch (level) {
    case "success": return <CheckCircle2 className="w-5 h-5 text-lime-400" />;
    case "error": return <AlertCircle className="w-5 h-5 text-rose-500" />;
    case "warning": return <AlertCircle className="w-5 h-5 text-amber-400" />;
    default: return <Info className="w-5 h-5 text-cyan-400" />;
  }
};

const getLogStyles = (level: string) => {
  switch (level) {
    case "success": return "border-l-lime-400 bg-lime-400/5";
    case "error": return "border-l-rose-500 bg-rose-500/5";
    case "warning": return "border-l-amber-400 bg-amber-400/5";
    default: return "border-l-cyan-400 bg-cyan-400/5";
  }
};

const getJobBadge = (status: string) => {
  switch (status) {
    case "active": return <Badge className="bg-lime-400 text-black hover:bg-lime-400 font-bold tracking-wider text-[10px]">ACTIVE</Badge>;
    case "running": return <Badge className="bg-cyan-400 text-black hover:bg-cyan-400 font-bold tracking-wider text-[10px] animate-pulse">RUNNING</Badge>;
    case "paused": return <Badge variant="outline" className="border-zinc-600 text-zinc-400 font-bold tracking-wider text-[10px]">PAUSED</Badge>;
    case "error": return <Badge className="bg-rose-500 text-white hover:bg-rose-500 font-bold tracking-wider text-[10px]">ERROR</Badge>;
    default: return <Badge variant="outline" className="border-zinc-600 text-zinc-400 font-bold tracking-wider text-[10px]">UNKNOWN</Badge>;
  }
};

export default function KoalaHub() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [logsLoading, setLogsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cronJobs, setCronJobs] = useState<CronJob[]>(mockCronJobs);
  const [cronLoading, setCronLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
      } catch {
        setLogs(defaultLogs);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
    // Fetch cron jobs
    const fetchCronJobs = async () => {
      try {
        setCronLoading(true);
        const res = await fetch("/api/cron");
        if (!res.ok) throw new Error("Failed to fetch cron");
        const data = await res.json();
        const jobs = (data.jobs || []).map((job: any, index: number) => ({
          id: String(index + 1),
          name: job.name,
          schedule: job.schedule,
          status: job.status === "running" ? "running" : "active",
          lastRun: job.lastRun || "Never",
          nextRun: job.nextRun || "N/A",
        }));
        setCronJobs(jobs.length > 0 ? jobs : mockCronJobs);
      } catch {
        setCronJobs(mockCronJobs);
      } finally {
        setCronLoading(false);
      }
    };
    fetchCronJobs();
    const cronInterval = setInterval(fetchCronJobs, 60000);
    const interval = setInterval(fetchLogs, 30000);
    return () => {
      clearInterval(interval);
      clearInterval(cronInterval);
    };
  }, []);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  const stats = {
    uptime: "24/7",
    version: "2026.3.8",
    model: "MiniMax-M2.5",
    status: "online",
    activeJobs: cronJobs.filter(j => j.status === "active" || j.status === "running").length,
    totalTasks: 1284,
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        if (isMobile) setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group border-l-2 ${
        activeView === view 
          ? "border-lime-400 bg-lime-400/10 text-white" 
          : "border-transparent text-zinc-500 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? "text-lime-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
      <span className="font-bold tracking-wider text-sm">{label}</span>
      {activeView === view && <ChevronRight className="w-4 h-4 ml-auto text-lime-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono flex selection:bg-lime-400 selection:text-black">
      {/* Noise Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 300 : 0,
          x: sidebarOpen ? 0 : -300
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-hidden fixed lg:relative h-screen z-50"
      >
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-lime-400 flex items-center justify-center">
                <span className="text-xl">🐨</span>
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-tighter text-white">KOALA</h1>
                <p className="text-[10px] font-bold tracking-[0.3em] text-lime-400">ASSISTANCE HUB</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 -mx-6">
            <NavItem view="dashboard" icon={LayoutDashboard} label="DASHBOARD" />
            <NavItem view="logs" icon={Terminal} label="SYSTEM LOGS" />
            <NavItem view="cronjobs" icon={Calendar} label="CRON JOBS" />
          </nav>

          <Separator className="my-8 bg-zinc-800" />

          {/* Quick Stats */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-500">QUICK STATS</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <p className="text-3xl font-black text-lime-400">{stats.activeJobs}</p>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 mt-1">ACTIVE JOBS</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <p className="text-3xl font-black text-cyan-400">{stats.totalTasks}</p>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 mt-1">TASKS DONE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4 px-4 py-4 bg-zinc-900 border border-zinc-800">
            <div className="relative">
              <div className="w-3 h-3 bg-lime-400 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-lime-400 rounded-full animate-ping" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-wider text-white">SYSTEM ONLINE</p>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500">CLAW v{stats.version}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-black">
        {/* Header */}
        <header className="border-b border-zinc-800 px-8 py-6 sticky top-0 z-30 bg-black/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-zinc-900"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
              
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
                    {activeView === "dashboard" && "Dashboard"}
                    {activeView === "logs" && "System Logs"}
                    {activeView === "cronjobs" && "Cron Jobs"}
                  </h2>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 border border-zinc-800 px-3 py-1 hidden sm:inline-block">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-900">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full" />
              </Button>
              <Avatar className="w-10 h-10 border-2 border-zinc-800 bg-zinc-900">
                <AvatarFallback className="bg-zinc-900 text-lime-400 font-black text-sm">
                  K
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 max-w-6xl mx-auto"
              >
                {/* Hero Banner */}
                <div className="relative overflow-hidden border border-zinc-800 bg-zinc-950">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                  <div className="relative p-10 md:p-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                          <span className="text-xs font-bold tracking-[0.3em] text-lime-400">AI ASSISTANT ACTIVE</span>
                        </div>
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                          Koala<br />
                          <span className="text-lime-400">Hub</span>
                        </h3>
                        <p className="text-zinc-400 max-w-lg text-lg font-medium">
                          Your intelligent assistance platform. Monitor system health, track tasks, and manage automated workflows.
                        </p>
                      </div>
                      <div className="hidden md:block text-8xl">🦦</div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "UPTIME", value: stats.uptime, icon: Activity, color: "text-lime-400", border: "border-lime-400/20" },
                    { label: "VERSION", value: stats.version, icon: Settings, color: "text-cyan-400", border: "border-cyan-400/20" },
                    { label: "AI MODEL", value: stats.model, icon: Cpu, color: "text-violet-400", border: "border-violet-400/20" },
                    { label: "ACTIVE JOBS", value: stats.activeJobs.toString(), icon: TrendingUp, color: "text-amber-400", border: "border-amber-400/20" },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-zinc-950 border ${stat.border} p-6 hover:bg-zinc-900/50 transition-colors group`}>
                      <div className="flex items-start justify-between mb-4">
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 mb-2">{stat.label}</p>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* About Section */}
                <div className="border border-zinc-800 bg-zinc-950 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-lime-400" />
                    <h3 className="text-xl font-black tracking-tighter text-white uppercase">About Claw</h3>
                  </div>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    <span className="text-white font-bold">Claw</span> is an autonomous AI agent built on OpenClaw, 
                    designed to handle complex tasks, maintain security protocols, and operate continuously 
                    without interruption. Powered by <span className="text-lime-400 font-bold">MiniMax-M2.5</span>.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 hover:bg-lime-400/10 font-bold tracking-wider text-[10px] px-4 py-2">AUTONOMOUS</Badge>
                    <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 hover:bg-cyan-400/10 font-bold tracking-wider text-[10px] px-4 py-2">SECURE</Badge>
                    <Badge className="bg-violet-400/10 text-violet-400 border-violet-400/20 hover:bg-violet-400/10 font-bold tracking-wider text-[10px] px-4 py-2">24/7 OPERATION</Badge>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-6xl mx-auto"
              >
                {/* Log Stats */}
                <div className="flex flex-wrap items-center justify-between gap-4 border border-zinc-800 bg-zinc-950 p-6">
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                      <span className="text-sm font-bold tracking-wider text-zinc-400">INFO: <span className="text-white">{logs.filter(l => l.level === "info").length}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-amber-400 rounded-full" />
                      <span className="text-sm font-bold tracking-wider text-zinc-400">WARNINGS: <span className="text-white">{logs.filter(l => l.level === "warning").length}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-rose-500 rounded-full" />
                      <span className="text-sm font-bold tracking-wider text-zinc-400">ERRORS: <span className="text-white">{logs.filter(l => l.level === "error").length}</span></span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => window.location.reload()} className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-bold tracking-wider text-xs">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    REFRESH
                  </Button>
                </div>

                {/* Logs List */}
                <div className="border border-zinc-800 bg-zinc-950">
                  <ScrollArea className="h-[600px]">
                    <div className="p-6 space-y-3">
                      {logsLoading && (
                        <div className="text-center py-12 text-zinc-500 font-bold tracking-wider">LOADING LOGS...</div>
                      )}
                      {logs.map((log, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-4 p-5 border-l-2 ${getLogStyles(log.level)} bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors`}
                        >
                          <div className="mt-0.5">{getLogIcon(log.level)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 border border-zinc-800">{formatTime(log.timestamp)}</span>
                            </div>
                            <p className="text-sm text-zinc-300 font-medium uppercase tracking-wide">{log.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}

            {activeView === "cronjobs" && (
              <motion.div
                key="cronjobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-6xl mx-auto"
              >
                <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 p-6">
                  <p className="text-sm font-bold tracking-wider text-zinc-400">
                    <span className="text-white text-2xl mr-2">{stats.activeJobs}</span> 
                    SCHEDULED TASKS RUNNING
                  </p>
                </div>

                <div className="grid gap-4">
                  {cronJobs.map((job) => (
                    <div key={job.id} className="border border-zinc-800 bg-zinc-950 p-6 hover:border-zinc-700 transition-colors group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <h3 className="text-lg font-black tracking-tighter text-white uppercase">{job.name}</h3>
                            {getJobBadge(job.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-6 text-sm">
                            <span className="font-mono text-lime-400 bg-lime-400/10 px-3 py-1.5 border border-lime-400/20 text-xs font-bold">{job.schedule}</span>
                            <span className="flex items-center gap-2 text-zinc-400 font-medium">
                              <Clock className="w-4 h-4" />
                              LAST: <span className="text-white">{job.lastRun}</span>
                            </span>
                            <span className="flex items-center gap-2 text-zinc-400 font-medium">
                              <Calendar className="w-4 h-4" />
                              NEXT: <span className="text-white">{job.nextRun}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white font-bold tracking-wider text-xs">
                            EDIT
                          </Button>
                          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white font-bold tracking-wider text-xs">
                            LOGS
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
