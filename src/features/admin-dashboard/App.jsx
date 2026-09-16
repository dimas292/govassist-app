import { useCallback, useEffect, useState } from "react";
import AdminLogin from "./AdminLogin.jsx";
import AdminTickets from "./AdminTickets.jsx";
import Dashboard from "./Dashboard.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { ApiRequestError, getAdminDashboard, getAdminSession, logoutAdmin } from "../../services/api";

const categoryLabel = { MBG: "MBG", INFRASTRUCTURE: "Infrastruktur", GENERAL: "Umum" };
const statusLabel = { RECEIVED: "Baru", VERIFIED: "Baru", IN_PROGRESS: "Diproses", COMPLETED: "Selesai" };
const statusTone = { RECEIVED: "warning", VERIFIED: "warning", IN_PROGRESS: "primary", COMPLETED: "success" };

const emptyData = {
  stats: [
    { label: "Total Ticket", value: "0", detail: "Semua laporan", tone: "primary" },
    { label: "Baru", value: "0", detail: "Perlu verifikasi", tone: "warning" },
    { label: "Diproses", value: "0", detail: "Sedang ditangani", tone: "info" },
    { label: "Selesai", value: "0", detail: "Sudah ditutup", tone: "success" },
  ],
  categorySummary: [
    { label: "MBG", value: 0 },
    { label: "Infrastruktur", value: 0 },
    { label: "Umum", value: 0 },
  ],
  statusSummary: [
    { label: "Baru", value: 0 },
    { label: "Diproses", value: 0 },
    { label: "Selesai", value: 0 },
  ],
  trend: { labels: [], values: [] },
  tickets: [],
  activities: [],
};

const formatDate = (value) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));

const relativeTime = (value) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.round(hours / 24)} hari lalu`;
};

const mapDashboard = (snapshot) => {
  const fresh = snapshot.statusCounts.RECEIVED + snapshot.statusCounts.VERIFIED;
  return {
    stats: [
      { label: "Total Ticket", value: String(snapshot.total), detail: "Semua laporan", tone: "primary" },
      { label: "Baru", value: String(fresh), detail: "Perlu verifikasi", tone: "warning" },
      { label: "Diproses", value: String(snapshot.statusCounts.IN_PROGRESS), detail: "Sedang ditangani", tone: "info" },
      { label: "Selesai", value: String(snapshot.statusCounts.COMPLETED), detail: "Sudah ditutup", tone: "success" },
    ],
    categorySummary: [
      { label: "MBG", value: snapshot.categoryCounts.MBG },
      { label: "Infrastruktur", value: snapshot.categoryCounts.INFRASTRUCTURE },
      { label: "Umum", value: snapshot.categoryCounts.GENERAL },
    ],
    statusSummary: [
      { label: "Baru", value: fresh },
      { label: "Diproses", value: snapshot.statusCounts.IN_PROGRESS },
      { label: "Selesai", value: snapshot.statusCounts.COMPLETED },
    ],
    trend: {
      labels: snapshot.trend.map((item) => item.label),
      values: snapshot.trend.map((item) => item.value),
    },
    tickets: snapshot.latestTickets.map((ticket) => ({
      id: ticket.id,
      summary: ticket.title,
      category: categoryLabel[ticket.category],
      status: statusLabel[ticket.status],
      date: formatDate(ticket.createdAt),
    })),
    activities: snapshot.latestActivities.map((activity) => ({
      id: `${activity.ticketId}-${activity.createdAt}`,
      text: activity.description || `Ticket #${activity.ticketId} diperbarui`,
      time: relativeTime(activity.createdAt),
      tone: statusTone[activity.status],
    })),
  };
};

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("govassist-theme") || "light");
  const [dashboardData, setDashboardData] = useState(emptyData);
  const [currentView, setCurrentView] = useState(() => window.location.hash === "#tickets" ? "tickets" : "dashboard");
  const [staff, setStaff] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("govassist-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((sessionStaff) => { if (active) setStaff(sessionStaff); })
      .catch(() => { if (active) setStaff(null); })
      .finally(() => { if (active) setAuthChecking(false); });
    return () => { active = false; };
  }, []);

  const expireSession = useCallback(() => {
    setStaff(null);
    setCurrentView("dashboard");
    window.location.hash = "dashboard";
  }, []);

  const loadDashboard = useCallback(() =>
    getAdminDashboard()
      .then((snapshot) => setDashboardData(mapDashboard(snapshot)))
      .catch((error) => {
        if (error instanceof ApiRequestError && error.status === 401) expireSession();
        else console.error("Gagal memuat dashboard admin:", error);
      }), [expireSession]);

  useEffect(() => {
    if (!staff) return undefined;
    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 30000);
    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [loadDashboard, staff]);

  useEffect(() => {
    const handleHashChange = () => setCurrentView(window.location.hash === "#tickets" ? "tickets" : "dashboard");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (view) => {
    setCurrentView(view);
    window.location.hash = view;
    setSidebarVisible(false);
  };

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 63.99rem)").matches) {
      setSidebarVisible((visible) => !visible);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  }

  const handleLogout = async () => {
    try { await logoutAdmin(); } finally { expireSession(); }
  };

  if (authChecking) {
    return <div className="auth"><main className="auth__panel"><div className="spinner spinner--primary" aria-label="Memeriksa sesi admin" /></main></div>;
  }

  if (!staff) {
    return <AdminLogin onAuthenticated={(authenticatedStaff) => { setStaff(authenticatedStaff); setCurrentView("dashboard"); window.location.hash = "dashboard"; }} />;
  }

  return (
    <div
      className={`app-shell ${sidebarVisible ? "is-sidebar-visible" : ""} ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}
      data-stisla-app-shell
      data-stisla-app-shell-auto-collapse="true"
    >
      <Sidebar collapsed={sidebarCollapsed} currentView={currentView} onNavigate={navigate} ticketCount={dashboardData.stats[0].value} />
      <main className="app-shell__main">
        <Topbar
          sidebarExpanded={!sidebarCollapsed || sidebarVisible}
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          staff={staff}
          onLogout={handleLogout}
        />
        {currentView === "tickets" ? (
          <AdminTickets staff={staff} onChanged={loadDashboard} onAuthExpired={expireSession} />
        ) : (
          <Dashboard theme={theme} data={dashboardData} onViewTickets={() => navigate("tickets")} />
        )}
      </main>
    </div>
  );
}
