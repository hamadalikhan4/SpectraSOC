import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Clock,
  Database,
  Download,
  FileText,
  MessageSquare,
  NotebookPen,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

import EvidenceVault from "./EvidenceVault";
import CaseTimeline from "./CaseTimeline";
import LinkedSOARPanel from "./LinkedSOARPanel";
import SLATrackingPanel from "./SLATrackingPanel";
import IncidentReportStudio from "./IncidentReportStudio";
import CaseWorkflowSummary from "./CaseWorkflowSummary";
import AIPlaybookRecommendationEngine from "./AIPlaybookRecommendationEngine";

import {
  buildIncidentCopilotContext,
  saveCopilotContext,
} from "../../../utils/copilotContextBridge";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function severityClass(value = "") {
  const severity = String(value).toLowerCase();

  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function statusClass(value = "") {
  const status = String(value).toLowerCase();

  if (status.includes("resolved") || status.includes("closed")) {
    return "resolved";
  }

  if (status.includes("investigating") || status.includes("progress")) {
    return "investigating";
  }

  if (status.includes("contained")) {
    return "contained";
  }

  return "open";
}

function timeUntil(value) {
  if (!value) return "No SLA";

  const diff = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.floor(abs / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  const text =
    hours > 0 ? `${hours}h ${minutes % 60}m` : `${Math.max(minutes, 0)}m`;

  return diff < 0 ? `Breached ${text} ago` : `${text} left`;
}

function buildTimeline(incident = {}) {
  return [
    {
      id: "tl-1",
      title: "Incident created",
      type: "Case",
      status: "Success",
      time: incident.created_at || new Date().toISOString(),
      description: `${incident.source || "SOC Platform"} generated incident ${
        incident.id || "INC-UNKNOWN"
      }.`,
      linked_evidence: "Incident Summary JSON",
      linked_soar: "",
      actor: "SpectraSOC",
    },
    {
      id: "tl-2",
      title: "Initial triage completed",
      type: "Triage",
      status: "Success",
      time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      description:
        "Analyst reviewed severity, category, risk score, and initial indicators.",
      linked_evidence: "IOC Enrichment Output",
      linked_soar: "",
      actor: "SOC Analyst",
    },
    {
      id: "tl-3",
      title: "SOAR execution linked",
      type: "SOAR",
      status: incident.linked_soar_execution ? "Success" : "Info",
      time: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
      description: incident.linked_soar_execution
        ? `Linked SOAR execution ${incident.linked_soar_execution}.`
        : "No SOAR execution linked yet.",
      linked_evidence: "SOAR Execution Evidence",
      linked_soar: incident.linked_soar_execution || "",
      actor: "SOAR Engine",
    },
    {
      id: "tl-4",
      title: "Evidence package prepared",
      type: "Evidence",
      status: "Success",
      time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      description:
        "Evidence placeholders prepared for logs, IOCs, screenshots, and analyst notes.",
      linked_evidence: "Evidence Vault",
      linked_soar: incident.linked_soar_execution || "",
      actor: "SpectraSOC",
    },
  ];
}

function buildEvidence(incident = {}) {
  return [
    {
      id: "ev-1",
      name: "Incident Summary JSON",
      type: "Case Record",
      source: "SpectraSOC",
      integrity: "Verified",
      added_at: incident.created_at || new Date().toISOString(),
      description:
        "Normalized incident metadata, severity, owner, and risk score.",
    },
    {
      id: "ev-2",
      name: "IOC Enrichment Output",
      type: "Threat Intelligence",
      source: incident.source || "Threat Intelligence",
      integrity: "Verified",
      added_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      description:
        "Threat intelligence enrichment results and reputation context.",
    },
    {
      id: "ev-3",
      name: "SOAR Execution Evidence",
      type: "Automation",
      source: incident.linked_soar_execution || "SOAR Engine",
      integrity: incident.linked_soar_execution ? "Verified" : "Pending",
      added_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      description:
        "Automation timeline, step results, approval state, and action logs.",
    },
  ];
}

function buildAIInsights(incident = {}) {
  const severity = String(incident.severity || "").toLowerCase();

  if (severity === "critical") {
    return [
      "Immediate containment is recommended due to critical severity and high business impact.",
      "Verify endpoint scope, isolate confirmed hosts only after approval, and preserve forensic artifacts.",
      "Escalate to incident commander and prepare executive status update.",
    ];
  }

  if (severity === "high") {
    return [
      "Prioritize triage and validate whether indicators are active in the environment.",
      "Check SIEM history, user context, and linked SOAR execution output.",
      "Prepare containment recommendations and monitor SLA risk.",
    ];
  }

  return [
    "Continue enrichment and monitor for repeated activity.",
    "Correlate with SIEM history and related cases.",
    "Close after validation if no malicious activity is confirmed.",
  ];
}

function downloadCaseReport(incident = {}, notes = [], status = "Open") {
  const payload = {
    generated_at: new Date().toISOString(),
    incident: {
      ...incident,
      current_status: status,
    },
    timeline: buildTimeline(incident),
    evidence: buildEvidence(incident),
    ai_insights: buildAIInsights(incident),
    analyst_notes: notes,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident.id || "incident"}-case-report.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function CaseMetric({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`case-metric-card ${tone}`}>
      <Icon size={18} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function IncidentCaseWorkspace({ incident, onBack, onRefresh }) {
  const safeIncident = incident || {};

  const [activeTab, setActiveTab] = useState("overview");
  const [caseStatus, setCaseStatus] = useState(safeIncident.status || "Open");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState([
    {
      id: "note-1",
      author: "SOC Analyst",
      time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      text: "Initial triage completed. Case moved into investigation workspace.",
    },
  ]);

  const timeline = useMemo(() => buildTimeline(safeIncident), [safeIncident]);
  const evidence = useMemo(() => buildEvidence(safeIncident), [safeIncident]);
  const aiInsights = useMemo(
    () => buildAIInsights(safeIncident),
    [safeIncident]
  );

  if (!incident) {
    return (
      <div className="spectra-glass-card case-empty-shell">
        <AlertTriangle size={22} />
        <h3>No incident selected</h3>
        <p>Go back and select an incident to open the case workspace.</p>

        <button className="secondary-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    );
  }

  const addNote = () => {
    if (!noteInput.trim()) return;

    setNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        author: "SOC Analyst",
        time: new Date().toISOString(),
        text: noteInput.trim(),
      },
      ...prev,
    ]);

    setNoteInput("");
  };

  const sendToCopilot = () => {
    const context = buildIncidentCopilotContext({
      incident: safeIncident,
      caseStatus,
      timeline,
      evidence,
      notes,
      aiInsights,
    });

    saveCopilotContext(context);

    alert(
      "Incident context sent to AI SOC Copilot. Open AI Assistant from the sidebar."
    );
  };

  return (
    <div className="incident-case-workspace">
      <div className="case-workspace-hero spectra-glass-card">
        <button className="secondary-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="case-hero-main">
          <span className="hero-chip">
            <ShieldAlert size={15} />
            Advanced Case Workspace
          </span>

          <h1>{safeIncident.title}</h1>

          <p>{safeIncident.description}</p>

          <div className="case-hero-tags">
            <span>{safeIncident.id}</span>

            <span className={severityClass(safeIncident.severity)}>
              {safeIncident.severity}
            </span>

            <span className={statusClass(caseStatus)}>{caseStatus}</span>

            <span>{safeIncident.category}</span>
          </div>
        </div>

        <div className="case-hero-actions">
          <button className="secondary-btn" onClick={onRefresh}>
            <RefreshCcw size={16} />
            Refresh
          </button>

          <button className="secondary-btn" onClick={sendToCopilot}>
            <Brain size={16} />
            Ask AI Copilot
          </button>

          <button
            className="primary-btn"
            onClick={() => downloadCaseReport(safeIncident, notes, caseStatus)}
          >
            <Download size={16} />
            Export Case
          </button>
        </div>
      </div>

      <div className="case-metric-grid">
        <CaseMetric
          icon={ShieldAlert}
          label="Severity"
          value={safeIncident.severity}
          tone="red"
        />

        <CaseMetric
          icon={Activity}
          label="Risk Score"
          value={safeIncident.risk_score}
          tone="orange"
        />

        <CaseMetric
          icon={Clock}
          label="SLA"
          value={timeUntil(safeIncident.sla_due_at)}
          tone="yellow"
        />

        <CaseMetric
          icon={UserRound}
          label="Owner"
          value={safeIncident.assigned_to}
          tone="blue"
        />

        <CaseMetric
          icon={Workflow}
          label="SOAR"
          value={safeIncident.linked_soar_execution ? "Linked" : "Not Linked"}
          tone="green"
        />
      </div>

      <CaseWorkflowSummary incident={safeIncident} caseStatus={caseStatus} />

      <div className="case-tab-bar spectra-glass-card">
        {[
          ["overview", "Overview", FileText],
          ["timeline", "Timeline", Activity],
          ["evidence", "Evidence", Database],
          ["soar", "Linked SOAR", Workflow],
          ["sla", "SLA Tracking", Clock],
          ["ai", "AI Analysis", Brain],
          ["notes", "Notes", MessageSquare],
          ["report", "Report", Download],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="case-content-grid">
          <div className="spectra-glass-card case-main-card">
            <div className="case-section-title">
              <h2>Case Overview</h2>
              <span>{safeIncident.priority}</span>
            </div>

            <div className="case-overview-grid">
              <div>
                <span>Incident ID</span>
                <b>{safeIncident.id}</b>
              </div>

              <div>
                <span>Status</span>
                <b>{caseStatus}</b>
              </div>

              <div>
                <span>Severity</span>
                <b>{safeIncident.severity}</b>
              </div>

              <div>
                <span>Category</span>
                <b>{safeIncident.category}</b>
              </div>

              <div>
                <span>Source</span>
                <b>{safeIncident.source}</b>
              </div>

              <div>
                <span>Assigned To</span>
                <b>{safeIncident.assigned_to}</b>
              </div>

              <div>
                <span>Created</span>
                <b>{formatTime(safeIncident.created_at)}</b>
              </div>

              <div>
                <span>Updated</span>
                <b>{formatTime(safeIncident.updated_at)}</b>
              </div>
            </div>

            <div className="case-tag-block">
              <h3>Tags</h3>

              <div>
                {(safeIncident.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="spectra-glass-card case-side-card">
            <div className="case-section-title">
              <h2>Status Control</h2>
              <span>Analyst action</span>
            </div>

            <div className="case-status-actions">
              {["Open", "Investigating", "Contained", "Resolved", "Closed"].map(
                (status) => (
                  <button
                    key={status}
                    className={caseStatus === status ? "active" : ""}
                    onClick={() => setCaseStatus(status)}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            <div className="case-sla-warning">
              <Clock size={16} />
              SLA status: {timeUntil(safeIncident.sla_due_at)}
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="spectra-glass-card case-main-card">
          <CaseTimeline incident={safeIncident} initialEvents={timeline} />
        </div>
      )}

      {activeTab === "evidence" && (
        <div className="spectra-glass-card case-main-card">
          <EvidenceVault incident={safeIncident} initialEvidence={evidence} />
        </div>
      )}

      {activeTab === "soar" && (
        <div className="soar-case-stack">
          <div className="spectra-glass-card case-main-card">
            <AIPlaybookRecommendationEngine
              incident={safeIncident}
              caseStatus={caseStatus}
              timeline={timeline}
              evidence={evidence}
              notes={notes}
              aiInsights={aiInsights}
            />
          </div>

          <div className="spectra-glass-card case-main-card">
            <LinkedSOARPanel incident={safeIncident} />
          </div>
        </div>
      )}

      {activeTab === "sla" && (
        <div className="spectra-glass-card case-main-card">
          <SLATrackingPanel
            incident={safeIncident}
            caseStatus={caseStatus}
            onStatusChange={setCaseStatus}
          />
        </div>
      )}

      {activeTab === "ai" && (
        <div className="spectra-glass-card case-main-card">
          <div className="case-section-title">
            <h2>AI Investigation Analysis</h2>
            <span>Assistant generated</span>
          </div>

          <div className="case-ai-summary">
            <Brain size={24} />

            <div>
              <h3>AI Summary</h3>

              <p>
                Based on severity, risk score, SLA timing, category, and linked
                automation context, this case should be handled as a{" "}
                <b>{safeIncident.severity}</b> priority incident.
              </p>
            </div>
          </div>

          <div className="case-ai-list">
            {aiInsights.map((insight) => (
              <div key={insight}>
                <Sparkles size={15} />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="spectra-glass-card case-main-card">
          <div className="case-section-title">
            <h2>Analyst Notes</h2>
            <span>{notes.length} notes</span>
          </div>

          <div className="case-note-composer">
            <textarea
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              placeholder="Write investigation note, containment decision, or analyst observation..."
            />

            <button className="primary-btn" onClick={addNote}>
              <NotebookPen size={16} />
              Add Note
            </button>
          </div>

          <div className="case-note-list">
            {notes.map((note) => (
              <div key={note.id} className="case-note-card">
                <MessageSquare size={16} />

                <div>
                  <h3>{note.author}</h3>
                  <p>{note.text}</p>
                  <span>{formatTime(note.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "report" && (
        <div className="spectra-glass-card case-main-card">
          <IncidentReportStudio
            incident={safeIncident}
            caseStatus={caseStatus}
            notes={notes}
            timeline={timeline}
            evidence={evidence}
            aiInsights={aiInsights}
          />
        </div>
      )}
    </div>
  );
}