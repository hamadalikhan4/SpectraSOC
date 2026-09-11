import {
  LayoutDashboard,
  Shield,
  Globe2,
  Radar,
  Siren,
  Brain,
  FileBarChart2,
  Network,
  User,
  Workflow,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function Sidebar({ page, setPage, role }) {
  const menu = [
    {
      section: "COMMAND",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          roles: ["Admin", "Employee", "Viewer"],
        },
      ],
    },
    {
      section: "SECURITY OPERATIONS",
      items: [
        {
          id: "siem",
          label: "SIEM",
          icon: Shield,
          roles: ["Admin", "Employee"],
        },
        {
          id: "threat-center",
          label: "Threat Center",
          icon: Globe2,
          roles: ["Admin", "Employee", "Viewer"],
        },
        {
          id: "threat",
          label: "Threat Intelligence",
          icon: Radar,
          roles: ["Admin", "Employee"],
        },
        {
          id: "incidents",
          label: "Incidents",
          icon: Siren,
          roles: ["Admin", "Employee"],
        },
        {
          id: "soar",
          label: "SOAR Automation",
          icon: Workflow,
          roles: ["Admin", "Employee"],
        },
      ],
    },
    {
      section: "AI & REPORTING",
      items: [
        {
          id: "assistant",
          label: "AI Assistant",
          icon: Brain,
          roles: ["Admin", "Employee"],
        },
        {
          id: "reports",
          label: "Reports",
          icon: FileBarChart2,
          roles: ["Admin", "Employee", "Viewer"],
        },
      ],
    },
    {
      section: "PLATFORM",
      items: [
        {
          id: "architecture",
          label: "Architecture",
          icon: Network,
          roles: ["Admin"],
        },
        {
          id: "profile",
          label: "Profile",
          icon: User,
          roles: ["Admin", "Employee", "Viewer"],
        },
      ],
    },
  ];

  return (
    <aside className="sidebar sidebar-v2">
      <div className="sidebar-brand sidebar-brand-v2">
        <div className="sidebar-logo">
          <Shield size={24} />
        </div>

        <div>
          <h2>SpectraSOC</h2>
          <p>Enterprise AI-Powered SOC Platform</p>
        </div>
      </div>

      <div className="sidebar-role sidebar-role-v2">
        <div>
          <span>Current Role</span>
          <b>{role}</b>
        </div>

        <div className="sidebar-role-icon">
          <CheckCircle2 size={17} />
        </div>
      </div>

      <div className="sidebar-health-card">
        <div>
          <Activity size={16} />
          <span>Platform Health</span>
        </div>

        <b>96%</b>

        <div className="sidebar-health-line">
          <i style={{ width: "96%" }} />
        </div>
      </div>

      <nav className="sidebar-nav sidebar-nav-v2">
        {menu.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.section} className="sidebar-menu-group">
              <div className="sidebar-section-title">{group.section}</div>

              {visibleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    className={
                      page === item.id
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                    onClick={() => setPage(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-status sidebar-status-v2">
        <div>
          <span className="status-dot"></span>
          SpectraSOC Online
        </div>

        <small>All systems monitored</small>
      </div>
    </aside>
  );
}