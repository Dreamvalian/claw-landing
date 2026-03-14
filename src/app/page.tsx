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
  Home,
  Bot,
  LayoutDashboard,
  Settings,
  Bell
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
  { timestamp: new Date().toISOString(), level: "info", message: "Koala Hub initialized. Waiting for OpenClaw connection..." },
];

const mockCronJobs: CronJob[] = [
  { id: "1", name: "Daily Football Analysis", schedule: "0 17 * * *", status: "active", lastRun: "17:00", nextRun: "17:00" },
  { id: "2", name: "Asian Handicap Scan", schedule: "*/6 * * *", status: "running", lastRun: "12:00", nextRun: "18:00" },
  { id: "3", name: "Results Collector", schedule: "0 23 * * *", status: "active", lastRun: "23:00", nextRun: "23:00" },
];

const getLogIcon = (level: string) => {
  switch (level) {
    case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "error": return <AlertCircle className="w-4 h-4 text-rose-500" />;
    case "warning": return <AlertCircle className="w-4 h-4 text-amber-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getLogBorder = (level: string) => {
  switch (level) {
    case "success": return "border-l-emerald-500 bg-emerald-50/50";
    case "error": return "border-l-rose-500 bg-rose-50/50";
    case "warning": return "border-l-amber-500 bg-amber-50/50";
    default: return "border-l-blue-500 bg-blue-50/50";
  }
};

const getJobBadge = (status: string) => {
  switch (status) {
    case "active": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 font-medium">Active</Badge>;
    case "running": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 font-medium animate-pulse">Running</Badge>;
    case "paused": return <Badge variant="secondary" className="font-medium">Paused</Badge>;
    case "error": return <Badge variant="destructive" className="font-medium">Error</Badge>;
    default: return <Badge variant="outline" className="font-medium">Unknown</Badge>;
  }
};

export default function KoalaHub() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(defaultLogs);
  const [logsLoading, setLogsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
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
    activeJobs: mockCronJobs.filter(j => j.status === "active" || j.status === "running").length,
    totalTasks: 1284,
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        if (isMobile) setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeView === view 
          ? "bg-teal-600 text-white shadow-lg shadow-teal-200" 
          : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
      <span className="font-medium">{label}</span>
      {activeView === view && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 280 : 0,
          x: sidebarOpen ? 0 : -280
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white border-r border-gray-200 flex flex-col overflow-hidden fixed lg:relative h-screen z-50"
      >
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
              <span className="text-2xl">🐨</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Koala</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">ASSISTANCE HUB</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="logs" icon={Terminal} label="System Logs" />
            <NavItem view="cronjobs" icon={Calendar} label="Cron Jobs" />
          </nav>

          <Separator className="my-6" />

          {/* Quick Stats */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                <p className="text-xs text-gray-500">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">System Online</p>
              <p className="text-xs text-gray-500">Claw v{stats.version}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeView === "dashboard" && "Dashboard"}
                    {activeView === "logs" && "System Logs"}
                    {activeView === "cronjobs" && "Cron Jobs"}
                  </h2>
                  <Badge variant="outline" className="font-normal text-gray-500 hidden sm:inline-flex">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </Button>
              <Avatar className="w-9 h-9 border-2 border-gray-100">
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-sm font-medium">
                  K
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-6xl mx-auto"
              >
                {/* Welcome Banner */}
                <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
                  <CardContent className="relative p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-teal-100">
                          <Bot className="w-4 h-4" />
                          <span className="text-sm font-medium">AI Assistant Active</span>
                        </div>
                        <h3 className="text-3xl font-bold">Welcome to Koala Hub</h3>
                        <p className="text-teal-100 max-w-lg">
                          Your intelligent assistance platform. Monitor system health, track tasks, and manage automated workflows.
                        </p>
                      </div>
                      <div className="hidden md:block text-6xl">🦦</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Uptime", value: stats.uptime, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Version", value: stats.version, icon: Settings, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "AI Model", value: stats.model, icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Server, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((stat, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow border-gray-200">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          </div>
                          <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* About Section */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bot className="w-5 h-5 text-teal-600" />
                      About Claw
                    </CardTitle>
                    <CardDescription>Your dedicated AI assistant within Koala Hub</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Claw</strong> is an autonomous AI agent built on OpenClaw, 
                      designed to handle complex tasks, maintain security protocols, and operate continuously 
                      without interruption. Powered by <span className="text-teal-600 font-medium">MiniMax-M2.5</span>.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-0">Autonomous</Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">Secure</Badge>
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0">24/7 Operation</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeView === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 max-w-6xl mx-auto"
              >
                {/* Log Stats */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm text-gray-500">Info: <span className="font-medium text-gray-900">{logs.filter(l => l.level === "info").length}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-sm text-gray-500">Warnings: <span className="font-medium text-gray-900">{logs.filter(l => l.level === "warning").length}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full" />
                      <span className="text-sm text-gray-500">Errors: <span className="font-medium text-gray-900">{logs.filter(l => l.level === "error").length}</span></span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {/* Logs List */}
                <Card className="border-gray-200">
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-2">
                      {logsLoading && (
                        <div className="text-center py-12 text-gray-500">Loading logs...</div>
                      )}
                      {logs.map((log, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-4 rounded-xl border border-l-4 ${getLogBorder(log.level)} bg-white hover:shadow-sm transition-shadow`}
                        >
                          <div className="mt-0.5">{getLogIcon(log.level)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{formatTime(log.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{log.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            )}

            {activeView === "cronjobs" && (
              <motion.div
                key="cronjobs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 max-w-6xl mx-auto"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{stats.activeJobs}</span> scheduled tasks running
                  </p>
                </div>

                <div className="grid gap-4">
                  {mockCronJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{job.name}</h3>
                              {getJobBadge(job.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{job.schedule}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Last: {job.lastRun}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Next: {job.nextRun}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
