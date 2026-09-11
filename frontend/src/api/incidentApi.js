import API from "./api";

const USE_MOCK_INCIDENTS = true;
const LOCAL_INCIDENTS_KEY = "spectrasoc_created_incidents_v1";

const MOCK_INCIDENTS = [
  {
    id: "INC-2026-0001",
    title: "Suspicious Email IOC Triage",
    severity: "High",
    status: "Open",
    category: "Phishing",
    source: "Threat Intelligence",
    detection_source: "IOC Enrichment",
    assigned_to: "SOC Analyst",
    risk_score: 84,
    priority: "P1",
    sla_state: "On Track",
    sla_due_at: "2026-07-17T18:30:00",
    linked_soar_execution: "SOAR-EXEC-001",
    description:
      "Suspicious email indicator detected and enriched with threat intelligence.",
    tags: ["phishing", "ioc", "email"],
    created_at: "2026-07-17T09:30:00",
    timeline: [],
    evidence: [],
    notes: [],
    ai_insights: [],
  },
  {
    id: "INC-2026-0002",
    title: "Ransomware Behavior Detected",
    severity: "Critical",
    status: "Investigating",
    category: "Malware",
    source: "EDR",
    detection_source: "Endpoint Telemetry",
    assigned_to: "IR Lead",
    risk_score: 96,
    priority: "P0",
    sla_state: "At Risk",
    sla_due_at: "2026-07-17T13:30:00",
    linked_soar_execution: "SOAR-EXEC-002",
    description:
      "Endpoint activity indicates possible ransomware behavior and file encryption pattern.",
    tags: ["ransomware", "endpoint", "critical"],
    created_at: "2026-07-17T10:10:00",
    timeline: [],
    evidence: [],
    notes: [],
    ai_insights: [],
  },
  {
    id: "INC-2026-0003",
    title: "Brute Force Login Attempts",
    severity: "High",
    status: "Open",
    category: "Credential Access",
    source: "SIEM",
    detection_source: "Authentication Logs",
    assigned_to: "Tier 1 Analyst",
    risk_score: 88,
    priority: "P1",
    sla_state: "On Track",
    sla_due_at: "2026-07-17T19:00:00",
    linked_soar_execution: "",
    description:
      "Multiple failed login attempts detected against administrative account.",
    tags: ["brute-force", "identity", "mitre-t1110"],
    created_at: "2026-07-17T11:20:00",
    timeline: [],
    evidence: [],
    notes: [],
    ai_insights: [],
  },
];

function readLocalIncidents() {
  try {
    const raw = localStorage.getItem(LOCAL_INCIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalIncidents(incidents) {
  localStorage.setItem(LOCAL_INCIDENTS_KEY, JSON.stringify(incidents));
}

function normalizeSeverity(value = "Medium") {
  const severity = String(value).toLowerCase();

  if (severity.includes("critical")) return "Critical";
  if (severity.includes("high")) return "High";
  if (severity.includes("medium")) return "Medium";
  return "Low";
}

function priorityForSeverity(severity) {
  const value = normalizeSeverity(severity);

  if (value === "Critical") return "P0";
  if (value === "High") return "P1";
  if (value === "Medium") return "P2";
  return "P3";
}

function slaStateForSeverity(severity) {
  const value = normalizeSeverity(severity);

  if (value === "Critical") return "At Risk";
  if (value === "High") return "On Track";
  return "Healthy";
}

function generateIncidentId() {
  const now = new Date();
  const year = now.getFullYear();
  const suffix = String(Date.now()).slice(-5);

  return `INC-${year}-${suffix}`;
}

function calculateOverview(incidents) {
  const total = incidents.length;

  const open = incidents.filter((item) =>
    ["open", "new"].includes(String(item.status).toLowerCase())
  ).length;

  const investigating = incidents.filter((item) =>
    String(item.status).toLowerCase().includes("investigating")
  ).length;

  const resolved = incidents.filter((item) =>
    String(item.status).toLowerCase().includes("resolved")
  ).length;

  const critical = incidents.filter(
    (item) => normalizeSeverity(item.severity) === "Critical"
  ).length;

  const high = incidents.filter(
    (item) => normalizeSeverity(item.severity) === "High"
  ).length;

  const slaRisk = incidents.filter((item) =>
    String(item.sla_state || "").toLowerCase().includes("risk")
  ).length;

  const avgRisk =
    Math.round(
      incidents.reduce((sum, item) => sum + Number(item.risk_score || 0), 0) /
        Math.max(total, 1)
    ) || 0;

  return {
    total,
    open,
    investigating,
    resolved,
    critical,
    high,
    slaRisk,
    avgRisk,
  };
}

function getCombinedIncidents() {
  const local = readLocalIncidents();

  const merged = [...local, ...MOCK_INCIDENTS];

  const unique = new Map();

  merged.forEach((incident) => {
    unique.set(incident.id, incident);
  });

  return Array.from(unique.values());
}

function buildIncidentFromSIEMAlert(log) {
  const severity = normalizeSeverity(log.severity);
  const createdAt = new Date().toISOString();

  return {
    id: generateIncidentId(),
    title: log.title || "SIEM Security Alert",
    severity,
    status: "Open",
    category: log.category || "SIEM Alert",
    source: "SIEM",
    detection_source: log.source || "SIEM Logs",
    assigned_to: "SOC Analyst",
    risk_score: Number(log.risk || 70),
    priority: priorityForSeverity(severity),
    sla_state: slaStateForSeverity(severity),
    sla_due_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    linked_soar_execution: "",
    description:
      log.rule ||
      "SIEM alert was converted into an incident for analyst investigation.",
    tags: [
      "siem",
      "triage",
      log.technique || "mitre",
      String(log.category || "security").toLowerCase(),
    ].filter(Boolean),
    created_at: createdAt,

    siem_context: {
      source_log_id: log.id,
      timestamp: log.timestamp,
      source: log.source,
      host: log.host,
      user: log.user,
      ip: log.ip,
      tactic: log.tactic,
      technique: log.technique,
      risk: log.risk,
      confidence: log.confidence,
      raw: log.raw,
    },

    evidence: [
      {
        id: `EV-${Date.now()}`,
        type: "SIEM Log",
        name: `SIEM Evidence - ${log.id}`,
        source: log.source || "SIEM",
        value: log.raw || log.rule || "Raw SIEM log",
        status: "Verified",
        collected_at: createdAt,
      },
    ],

    timeline: [
      {
        id: `TL-${Date.now()}-1`,
        type: "Detection",
        title: "SIEM alert detected",
        description: `${log.title} detected from ${log.source}.`,
        timestamp: createdAt,
        source: "SIEM",
      },
      {
        id: `TL-${Date.now()}-2`,
        type: "Triage",
        title: "Incident created from SIEM",
        description:
          "Alert converted into Incident Command Center case for investigation.",
        timestamp: createdAt,
        source: "SpectraSOC",
      },
    ],

    notes: [
      {
        id: `NOTE-${Date.now()}`,
        author: "SpectraSOC",
        body: "Incident automatically created from SIEM Alert Triage Drawer.",
        created_at: createdAt,
      },
    ],

    ai_insights: [
      {
        id: `AI-${Date.now()}`,
        title: "SIEM Alert Context",
        summary: `Risk score ${log.risk}/100 with MITRE mapping ${
          log.technique || "N/A"
        }. Analyst should validate host, user, IOC, and related logs.`,
        created_at: createdAt,
      },
    ],
  };
}

const INCIDENT_API = {
  getIncidents: async () => {
    if (!USE_MOCK_INCIDENTS) {
      try {
        const res = await API.get("/api/v1/incidents");
        return Array.isArray(res.data)
          ? res.data
          : res.data.incidents || res.data.records || [];
      } catch {
        return getCombinedIncidents();
      }
    }

    return getCombinedIncidents();
  },

  getOverview: async () => {
    const incidents = await INCIDENT_API.getIncidents();
    const metrics = calculateOverview(incidents);

    return {
      incidents,
      records: incidents,
      list: incidents,
      metrics,
      ...metrics,
    };
  },

  getIncident: async (id) => {
    const incidents = await INCIDENT_API.getIncidents();
    return incidents.find((incident) => String(incident.id) === String(id));
  },

  createFromSIEMAlert: async (log) => {
    const incident = buildIncidentFromSIEMAlert(log);
    const existing = readLocalIncidents();

    const withoutDuplicate = existing.filter(
      (item) => item?.siem_context?.source_log_id !== log.id
    );

    const updated = [incident, ...withoutDuplicate];

    writeLocalIncidents(updated);

    localStorage.setItem("spectrasoc_focus_incident_id", incident.id);

    return incident;
  },

  clearLocalIncidents: async () => {
    localStorage.removeItem(LOCAL_INCIDENTS_KEY);
    localStorage.removeItem("spectrasoc_focus_incident_id");
    return true;
  },
};

export default INCIDENT_API;
export { INCIDENT_API };