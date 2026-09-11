import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserCog,
  XCircle,
} from "lucide-react";

import API from "../api/api";

const ROLE_MODULES = {
  Admin: [
    "Dashboard",
    "SIEM",
    "Threat Center",
    "Threat Intelligence",
    "Incidents",
    "SOAR Automation",
    "AI Assistant",
    "Reports",
    "Architecture",
    "Profile",
  ],
  Employee: [
    "Dashboard",
    "SIEM",
    "Threat Center",
    "Threat Intelligence",
    "Incidents",
    "SOAR Automation",
    "AI Assistant",
    "Reports",
    "Profile",
  ],
  Viewer: ["Dashboard", "Threat Center", "Reports", "Profile"],
};

function normalizeRole(role) {
  if (!role) return "Viewer";

  const value = String(role).toLowerCase();

  if (value === "admin") return "Admin";
  if (value === "employee" || value === "analyst") return "Employee";
  if (value === "viewer") return "Viewer";

  return "Viewer";
}

function formatDate(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function ProfileMetric({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`profile-v2-metric ${tone}`}>
      <Icon size={19} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function Profile({ role }) {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentRole = normalizeRole(user?.role || role);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await API.get("/api/v1/auth/me");
      setUser(res.data);
    } catch (error) {
      console.log("Profile fallback loaded", error);

      setUser({
        name: localStorage.getItem("name") || "SpectraSOC User",
        username: localStorage.getItem("username") || "user",
        email: localStorage.getItem("email") || "user@spectrasoc.local",
        role: role || "Viewer",
        status: "Active",
        created_at: null,
      });
    }
  };

  const allowedModules = useMemo(() => {
    return ROLE_MODULES[currentRole] || ROLE_MODULES.Viewer;
  }, [currentRole]);

  const profileExport = {
    name: user?.name || "SpectraSOC User",
    username: user?.username || "user",
    email: user?.email || "user@spectrasoc.local",
    role: currentRole,
    status: user?.status || "Active",
    allowed_modules: allowedModules,
    exported_at: new Date().toISOString(),
  };

  const copyProfile = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profileExport, null, 2));
      setCopied(true);

      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const downloadProfile = () => {
    const blob = new Blob([JSON.stringify(profileExport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");

    element.href = url;
    element.download = `spectrasoc-profile-${currentRole.toLowerCase()}.json`;
    element.click();

    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="profile-v2-page">
        <div className="spectra-glass-card profile-v2-loading">
          <Activity size={22} />
          <h2>Loading SpectraSOC profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-v2-page">
      <section className="profile-v2-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <UserCog size={15} />
            User Access Profile
          </span>

          <h1>User Profile</h1>

          <p>
            SpectraSOC account overview, role-based access visibility, session
            status, security posture, and assigned platform permissions.
          </p>
        </div>

        <div className="profile-v2-role-card">
          <ShieldCheck size={24} />
          <span>Current Role</span>
          <b>{currentRole}</b>
          <small>RBAC enforced</small>
        </div>
      </section>

      <section className="profile-v2-metric-grid">
        <ProfileMetric
          icon={User}
          label="Account"
          value={user?.name || "SpectraSOC User"}
          tone="blue"
        />

        <ProfileMetric
          icon={Lock}
          label="Access Level"
          value={currentRole}
          tone="green"
        />

        <ProfileMetric
          icon={Eye}
          label="Visible Modules"
          value={allowedModules.length}
          tone="purple"
        />

        <ProfileMetric
          icon={CheckCircle2}
          label="Status"
          value={user?.status || "Active"}
          tone="yellow"
        />
      </section>

      <section className="profile-v2-main-grid">
        <div className="spectra-glass-card profile-v2-panel">
          <div className="profile-v2-panel-head">
            <div>
              <h2>Account Information</h2>
              <p>Primary identity details for the logged-in user.</p>
            </div>

            <span>{currentRole}</span>
          </div>

          <div className="profile-v2-identity">
            <div className="profile-v2-avatar">
              {(user?.name || "S").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3>{user?.name || "SpectraSOC User"}</h3>
              <p>{user?.email || "user@spectrasoc.local"}</p>
            </div>
          </div>

          <div className="profile-v2-info-list">
            <div>
              <User size={16} />
              <span>Username</span>
              <b>{user?.username || "user"}</b>
            </div>

            <div>
              <Mail size={16} />
              <span>Email</span>
              <b>{user?.email || "user@spectrasoc.local"}</b>
            </div>

            <div>
              <ShieldCheck size={16} />
              <span>Role</span>
              <b>{currentRole}</b>
            </div>

            <div>
              <CheckCircle2 size={16} />
              <span>Status</span>
              <b>{user?.status || "Active"}</b>
            </div>

            <div>
              <Clock size={16} />
              <span>Created</span>
              <b>{formatDate(user?.created_at)}</b>
            </div>
          </div>
        </div>

        <div className="spectra-glass-card profile-v2-panel">
          <div className="profile-v2-panel-head">
            <div>
              <h2>Security Posture</h2>
              <p>Access security and RBAC enforcement summary.</p>
            </div>
          </div>

          <div className="profile-v2-security-list">
            <div>
              <KeyRound size={17} />
              <section>
                <b>Authenticated Session</b>
                <span>JWT token active for current user session.</span>
              </section>
              <CheckCircle2 size={16} />
            </div>

            <div>
              <Lock size={17} />
              <section>
                <b>Role-Based Access</b>
                <span>{currentRole} permissions are applied in sidebar and routing.</span>
              </section>
              <CheckCircle2 size={16} />
            </div>

            <div>
              <ShieldCheck size={17} />
              <section>
                <b>Least Privilege Model</b>
                <span>Viewer and Employee roles receive limited module access.</span>
              </section>
              <CheckCircle2 size={16} />
            </div>

            <div>
              <Activity size={17} />
              <section>
                <b>Platform Monitoring</b>
                <span>SpectraSOC modules are visible based on access level.</span>
              </section>
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="profile-v2-actions">
            <button onClick={copyProfile}>
              <Copy size={15} />
              {copied ? "Copied" : "Copy Profile"}
            </button>

            <button onClick={downloadProfile}>
              <Download size={15} />
              Export JSON
            </button>
          </div>
        </div>
      </section>

      <section className="profile-v2-bottom-grid">
        <div className="spectra-glass-card profile-v2-panel">
          <div className="profile-v2-panel-head">
            <div>
              <h2>Allowed Modules</h2>
              <p>Modules currently visible for this user role.</p>
            </div>

            <span>{allowedModules.length} modules</span>
          </div>

          <div className="profile-v2-module-grid">
            {allowedModules.map((module) => (
              <div key={module} className="profile-v2-module-card">
                <CheckCircle2 size={16} />
                <span>{module}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="spectra-glass-card profile-v2-panel">
          <div className="profile-v2-panel-head">
            <div>
              <h2>Restricted Access</h2>
              <p>Modules hidden for this role.</p>
            </div>
          </div>

          <div className="profile-v2-restricted-list">
            {Object.values(ROLE_MODULES.Admin)
              .filter((module) => !allowedModules.includes(module))
              .map((module) => (
                <div key={module}>
                  <XCircle size={15} />
                  <span>{module}</span>
                </div>
              ))}

            {Object.values(ROLE_MODULES.Admin).filter(
              (module) => !allowedModules.includes(module)
            ).length === 0 && (
              <div>
                <CheckCircle2 size={15} />
                <span>No restricted modules for Admin.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="spectra-glass-card profile-v2-panel">
        <div className="profile-v2-panel-head">
          <div>
            <h2>Access Summary</h2>
            <p>
              This profile is connected to SpectraSOC frontend RBAC. Admin has
              full control, Employee has operational access, and Viewer has
              read-only visibility for selected modules.
            </p>
          </div>

          <FileText size={20} />
        </div>
      </section>
    </div>
  );
}