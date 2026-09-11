import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import LiveAlerts from "../components/LiveAlerts";
import ThreatMap from "../components/ThreatMap";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Globe2,
  Lock,
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const severityData = [
  { name: "Critical", value: 7 },
  { name: "High", value: 12 },
  { name: "Medium", value: 25 },
  { name: "Low", value: 41 },
];

const severityColors = ["#ff4d6d", "#ff9f1c", "#ffd166", "#00ffaa"];

const mitreData = [
  { technique: "T1110", count: 9, name: "Brute Force" },
  { technique: "T1059", count: 14, name: "Command Shell" },
  { technique: "T1190", count: 7, name: "Exploit Public App" },
  { technique: "T1090", count: 11, name: "Proxy" },
  { technique: "T1204", count: 16, name: "User Execution" },
];

const trendData = [
  { day: "Mon", threats: 18, incidents: 4 },
  { day: "Tue", threats: 29, incidents: 6 },
  { day: "Wed", threats: 23, incidents: 5 },
  { day: "Thu", threats: 41, incidents: 9 },
  { day: "Fri", threats: 36, incidents: 7 },
  { day: "Sat", threats: 48, incidents: 11 },
  { day: "Sun", threats: 31, incidents: 6 },
];

const aiActivityData = [
  { time: "11:10", actions: 8 },
  { time: "11:30", actions: 12 },
  { time: "11:50", actions: 7 },
  { time: "12:00", actions: 10 },
  { time: "12:20", actions: 16 },
];

const fallbackAlerts = [
  {
    id: 1,
    title: "SSH brute force detected",
    source: "185.220.101.44",
    severity: "CRITICAL",
    mitre: "T1110",
    status: "Open",
  },
  {
    id: 2,
    title: "SQL injection attempt",
    source: "Web logs",
    severity: "HIGH",
    mitre: "T1190",
    status: "Investigating",
  },
  {
    id: 3,
    title: "Suspicious PowerShell activity",
    source: "Finance-PC",
    severity: "HIGH",
    mitre: "T1059",
    status: "Contained",
  },
];

const modules = [
  {
    title: "Threat Intelligence",
    value: "Live",
    desc: "VT, AbuseIPDB, GeoIP, IOC scoring",
    icon: Globe2,
    health: 96,
  },
  {
    title: "Incident Command",
    value: "Ready",
    desc: "Evidence, timeline, SLA, final report",
    icon: ShieldAlert,
    health: 98,
  },
  {
    title: "SOAR Automation",
    value: "Active",
    desc: "Playbooks, executions, approvals",
    icon: Workflow,
    health: 94,
  },
  {
    title: "AI SOC Copilot",
    value: "Ready",
    desc: "Context-aware investigation support",
    icon: Brain,
    health: 95,
  },
];

const recommendations = [
  "Block Tor exit IPs with high abuse score.",
  "Disable SSH password login on exposed hosts.",
  "Patch internet-facing Apache and Nginx services.",
  "Reset credentials for accounts with abnormal login activity.",
  "Enable MFA for privileged and admin users.",
];

const incidentQueue = [
  {
    id: "INC-2026-0001",
    title: "Suspicious Email IOC Triage",
    severity: "High",
    status: "Open",
    owner: "SOC Analyst",
    sla: "42m left",
  },
  {
    id: "INC-2026-0002",
    title: "Ransomware Behavior Detected",
    severity: "Critical",
    status: "Investigating",
    owner: "IR Lead",
    sla: "At Risk",
  },
  {
    id: "INC-2026-0003",
    title: "Brute Force Login Attempts",
    severity: "High",
    status: "Open",
    owner: "Tier 1 Analyst",
    sla: "1h 18m left",
  },
];

function severityClass(value = "") {
  const severity = String(value).toLowerCase();

  if (severity.includes("critical")) return "critical";
  if (severity.includes("high")) return "high";
  if (severity.includes("medium")) return "medium";
  return "low";
}

function DashboardMetric({ icon: Icon, label, value, change, tone = "blue" }) {
  return (
    <div className={`soc-v2-metric ${tone}`}>
      <div className="soc-v2-metric-icon">
        <Icon size={20} />
      </div>

      <span>{label}</span>
      <b>{value}</b>

      {change && <small>{change}</small>}
    </div>
  );
}

function ModuleHealthCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="soc-v2-module-card">
      <div className="soc-v2-module-head">
        <div>
          <Icon size={18} />
        </div>

        <span>{item.health}%</span>
      </div>

      <h3>{item.title}</h3>
      <b>{item.value}</b>
      <p>{item.desc}</p>

      <div className="soc-v2-progress">
        <i style={{ width: `${item.health}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard({ setPage }) {
  const [alerts, setAlerts] = useState(fallbackAlerts);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await API.get("/alerts/");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.alerts || res.data.records || [];

      if (data.length > 0) {
        const formatted = data.map((a, index) => ({
          id: a.id || a.alert_id || index,
          title: a.title || a.name || a.alert_type || "Security Alert",
          source: a.source || a.indicator || a.ip || "Unknown",
          severity: (a.severity || a.risk_level || "LOW").toUpperCase(),
          mitre: a.mitre || a.technique_id || "N/A",
          status: a.status || "Open",
        }));

        setAlerts(formatted);
      }
    } catch (error) {
      console.log("Using fallback alerts because /alerts/ failed", error);
    }
  };

  const dashboardHealth = useMemo(() => {
    const avg =
      modules.reduce((sum, item) => sum + item.health, 0) / modules.length;

    return Math.round(avg);
  }, []);

  const goTo = (target) => {
    if (typeof setPage === "function") {
      setPage(target);
    }
  };

  return (
    <div className="soc-dashboard-v2">
      <section className="soc-v2-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <ShieldAlert size={15} />
            Enterprise SOC Command Center
          </span>

          <h1>SOC Command Dashboard</h1>

          <p>
            Unified security operations view for threats, incidents, SOAR
            automation, AI Copilot activity, SLA risk, MITRE activity, and
            executive-level SOC readiness.
          </p>

          <div className="soc-v2-hero-actions">
            <button onClick={() => goTo("incidents")}>
              <ShieldAlert size={16} />
              Open Incidents
            </button>

            <button onClick={() => goTo("soar")}>
              <Workflow size={16} />
              Open SOAR
            </button>

            <button onClick={() => goTo("assistant")}>
              <Brain size={16} />
              Ask AI Copilot
            </button>
          </div>
        </div>

        <div className="soc-v2-risk-panel">
          <GaugeCircle value={dashboardHealth} />

          <span>Platform Health</span>
          <b>{dashboardHealth}%</b>
          <small>Enterprise demo ready</small>
        </div>
      </section>

      <section className="soc-v2-metric-grid">
        <DashboardMetric
          icon={Activity}
          label="Total Alerts"
          value="248"
          change="+18 this week"
          tone="blue"
        />

        <DashboardMetric
          icon={AlertTriangle}
          label="Critical Incidents"
          value="07"
          change="2 require escalation"
          tone="red"
        />

        <DashboardMetric
          icon={Radar}
          label="Threat Intel Hits"
          value="31"
          change="VT / AbuseIPDB / GeoIP"
          tone="green"
        />

        <DashboardMetric
          icon={Lock}
          label="Blocked Attacks"
          value="1,284"
          change="Automated controls"
          tone="purple"
        />

        <DashboardMetric
          icon={Clock}
          label="SLA At Risk"
          value="03"
          change="Critical queue"
          tone="orange"
        />

        <DashboardMetric
          icon={Brain}
          label="AI Actions"
          value="56"
          change="Copilot assisted"
          tone="yellow"
        />
      </section>

      <section className="soc-v2-main-grid">
        <div className="spectra-glass-card soc-v2-panel large">
          <div className="soc-v2-panel-head">
            <div>
              <h2>Threat and Incident Trend</h2>
              <p>Weekly detection and incident activity.</p>
            </div>

            <span>Live SOC telemetry</span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#00d5ff"
                fill="#00d5ff33"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#ff4d6d"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>Severity Distribution</h2>
              <p>Current alert severity split.</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={95}
                paddingAngle={4}
              >
                {severityData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={severityColors[index % severityColors.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="soc-v2-module-grid">
        {modules.map((item) => (
          <ModuleHealthCard key={item.title} item={item} />
        ))}
      </section>

      <section className="soc-v2-main-grid">
        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>MITRE ATT&CK Activity</h2>
              <p>Most observed adversary techniques.</p>
            </div>

            <span>ATT&CK mapped</span>
          </div>

          <ResponsiveContainer width="100%" height={285}>
            <BarChart data={mitreData}>
              <XAxis dataKey="technique" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00ffaa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>AI Copilot Activity</h2>
              <p>AI-assisted investigation workload.</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={285}>
            <LineChart data={aiActivityData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="actions"
                stroke="#ffd166"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="soc-v2-bottom-grid">
        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>Priority Incident Queue</h2>
              <p>Cases requiring analyst attention.</p>
            </div>

            <button onClick={() => goTo("incidents")}>Open Case Center</button>
          </div>

          <div className="soc-v2-incident-list">
            {incidentQueue.map((incident) => (
              <div key={incident.id} className="soc-v2-incident-row">
                <div>
                  <b>{incident.title}</b>
                  <span>{incident.id}</span>
                </div>

                <span className={`soc-v2-severity ${severityClass(incident.severity)}`}>
                  {incident.severity}
                </span>

                <span>{incident.status}</span>
                <span>{incident.owner}</span>
                <span>{incident.sla}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>Top AI Recommendations</h2>
              <p>Recommended security actions.</p>
            </div>

            <Sparkles size={18} />
          </div>

          <div className="soc-v2-recommendation-list">
            {recommendations.map((item) => (
              <div key={item}>
                <CheckCircle2 size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soc-v2-bottom-grid">
        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>Global Threat Map</h2>
              <p>Geographic threat visibility and IOC intelligence.</p>
            </div>
          </div>

          <ThreatMap />
        </div>

        <div className="spectra-glass-card soc-v2-panel">
          <div className="soc-v2-panel-head">
            <div>
              <h2>Latest Security Alerts</h2>
              <p>Recent alerts from SOC telemetry.</p>
            </div>
          </div>

          <div className="soc-v2-alert-table">
            <table>
              <thead>
                <tr>
                  <th>Alert</th>
                  <th>Source</th>
                  <th>Severity</th>
                  <th>MITRE</th>
                </tr>
              </thead>

              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.title}</td>
                    <td>{alert.source}</td>
                    <td>
                      <span
                        className={`soc-v2-severity ${severityClass(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td>{alert.mitre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="spectra-glass-card soc-v2-panel">
        <div className="soc-v2-panel-head">
          <div>
            <h2>Live Security Alerts</h2>
            <p>Streaming alert feed from connected security sources.</p>
          </div>
        </div>

        <LiveAlerts />
      </section>
    </div>
  );
}

function GaugeCircle({ value }) {
  return (
    <div className="soc-v2-gauge">
      <div
        style={{
          background: `conic-gradient(#00ffaa ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <span>{value}%</span>
      </div>
    </div>
  );
}