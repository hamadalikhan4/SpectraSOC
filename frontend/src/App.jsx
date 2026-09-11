import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";

import API from "./api/api";

import Login from "./auth/Login";

import Dashboard from "./pages/Dashboard";
import SIEM from "./pages/SIEM";
import GlobalThreatCenter from "./pages/GlobalThreatCenter";
import ThreatIntel from "./pages/ThreatIntel";
import Incidents from "./pages/Incidents";
import SOAR from "./pages/SOAR";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";
import Architecture from "./pages/Architecture";
import Profile from "./pages/Profile";

const ROLE_ACCESS = {
  Admin: [
    "dashboard",
    "siem",
    "threat-center",
    "threat",
    "incidents",
    "soar",
    "assistant",
    "reports",
    "architecture",
    "profile",
  ],

  Employee: [
    "dashboard",
    "siem",
    "threat-center",
    "threat",
    "incidents",
    "soar",
    "assistant",
    "reports",
    "profile",
  ],

  Viewer: ["dashboard", "threat-center", "reports", "profile"],
};

function normalizeRole(role) {
  if (!role) return "Viewer";

  const value = String(role).toLowerCase();

  if (value === "admin") return "Admin";
  if (value === "employee" || value === "analyst") return "Employee";
  if (value === "viewer") return "Viewer";

  return "Viewer";
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);

  const authenticated = localStorage.getItem("token");
  const currentRole = normalizeRole(user?.role);

  const canAccess = (pageName) => {
    return ROLE_ACCESS[currentRole]?.includes(pageName);
  };

  const changePage = (nextPage) => {
    if (canAccess(nextPage)) {
      setPage(nextPage);
    } else {
      setPage("dashboard");
    }
  };

  const loadUser = async () => {
    try {
      const res = await API.get("/api/v1/auth/me");

      const normalizedUser = {
        ...res.data,
        role: normalizeRole(res.data?.role),
      };

      setUser(normalizedUser);
    } catch (err) {
      console.error(err);

      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("email");

      setUser(null);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadUser();
    }
  }, [authenticated]);

  useEffect(() => {
    if (user && !canAccess(page)) {
      setPage("dashboard");
    }
  }, [user, page]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("email");

    setUser(null);
  };

  const renderPage = () => {
    if (!canAccess(page)) {
      return (
        <div className="card">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this module.</p>
        </div>
      );
    }

    switch (page) {
      case "dashboard":
        return <Dashboard setPage={changePage} role={currentRole} />;

      case "siem":
        return <SIEM role={currentRole} setPage={changePage} />;

      case "threat-center":
        return <GlobalThreatCenter role={currentRole} />;

      case "threat":
        return <ThreatIntel role={currentRole} />;

      case "incidents":
        return <Incidents role={currentRole} />;

      case "soar":
        return <SOAR role={currentRole} />;

      case "assistant":
        return <AIAssistant role={currentRole} />;

      case "reports":
        return <Reports role={currentRole} />;

      case "architecture":
        return <Architecture role={currentRole} />;

      case "profile":
        return <Profile role={currentRole} />;

      default:
        return <Dashboard setPage={changePage} role={currentRole} />;
    }
  };

  if (!authenticated) {
    return <Login onLogin={loadUser} />;
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>SpectraSOC</h2>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={changePage} role={currentRole} />

      <main>
        <TopNavbar user={{ ...user, role: currentRole }} logout={logout} />

        {renderPage()}
      </main>
    </div>
  );
}