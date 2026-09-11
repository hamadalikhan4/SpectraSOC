import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitBranch,
  MessageSquare,
  Paperclip,
  ShieldAlert,
  Timer,
  UserCheck,
} from "lucide-react";

import OverviewTab from "./tabs/OverviewTab";
import TimelineTab from "./tabs/TimelineTab";
import AIInvestigationTab from "./tabs/AIInvestigationTab";
import EvidenceTab from "./tabs/EvidenceTab";
import CommentsTab from "./tabs/CommentsTab";
import AssignmentTab from "./tabs/AssignmentTab";
import ResolutionTab from "./tabs/ResolutionTab";
import MitreTab from "./tabs/MitreTab";

export default function IncidentWorkspace({
  selected,
  ai,
  updateStatus,
  generateReport,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!selected) {
    return (
      <div className="card incident-workspace">
        <div className="empty-state">
          <AlertTriangle size={34} />
          <h4>No Incident Selected</h4>
          <p>Select an incident from the queue to open the investigation workspace.</p>
        </div>
      </div>
    );
  }

  const riskScore = Number(selected.risk_score || 0);
  const priority = riskScore >= 90 ? "P1 Critical" : riskScore >= 70 ? "P2 High" : "P3 Medium";
  const sla = riskScore >= 90 ? "2 Hours" : riskScore >= 70 ? "6 Hours" : "24 Hours";

  const tabs = [
    { id: "overview", label: "Overview", icon: ClipboardList },
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "ai", label: "AI Investigation", icon: Brain },
    { id: "evidence", label: "Evidence", icon: Paperclip },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "assignment", label: "Assignment", icon: UserCheck },
    { id: "resolution", label: "Resolution", icon: CheckCircle2 },
    { id: "mitre", label: "MITRE ATT&CK", icon: GitBranch },
  ];

  return (
    <div className="card incident-workspace">
      <div className="incident-hero">
        <div className="incident-hero-left">
          <div className="incident-hero-icon">
            <ShieldAlert size={26} />
          </div>

          <div>
            <span className="incident-eyebrow">Active Investigation</span>
            <h2>{selected.incident_id}</h2>
            <p>{selected.title || selected.summary || "Incident investigation workspace"}</p>
          </div>
        </div>

        <div className="incident-hero-actions">
          <button
            className="btn secondary"
            onClick={() => generateReport(selected.incident_id)}
          >
            <FileText size={15} />
            Report
          </button>

          <button
            className="btn"
            onClick={() => updateStatus(selected.incident_id, "CLOSED")}
          >
            Close
          </button>
        </div>
      </div>

      <div className="incident-hero-grid">
        <HeroMetric label="Severity" value={selected.severity} tone={getSeverityTone(selected.severity)} />
        <HeroMetric label="Status" value={selected.status} tone={selected.status === "CLOSED" ? "success" : "warning"} />
        <HeroMetric label="Risk Score" value={selected.risk_score} tone={riskScore >= 90 ? "danger" : "info"} />
        <HeroMetric label="Priority" value={priority} tone={riskScore >= 90 ? "danger" : "warning"} />
        <HeroMetric label="SLA Target" value={sla} tone="info" icon={<Timer size={15} />} />
        <HeroMetric label="IOC Type" value={selected.indicator_type || "Unknown"} tone="info" />
      </div>

      <div className="incident-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <OverviewTab
            selected={selected}
            updateStatus={updateStatus}
            generateReport={generateReport}
          />
        )}

        {activeTab === "timeline" && <TimelineTab selected={selected} />}

        {activeTab === "ai" && (
          <AIInvestigationTab ai={ai} selected={selected} />
        )}

        {activeTab === "evidence" && <EvidenceTab selected={selected} />}

        {activeTab === "comments" && <CommentsTab selected={selected} />}

        {activeTab === "assignment" && <AssignmentTab selected={selected} />}

        {activeTab === "resolution" && (
          <ResolutionTab
            selected={selected}
            updateStatus={updateStatus}
            generateReport={generateReport}
          />
        )}

        {activeTab === "mitre" && <MitreTab selected={selected} ai={ai} />}
      </div>
    </div>
  );
}

function HeroMetric({ label, value, tone = "info", icon }) {
  return (
    <div className={`incident-hero-metric ${tone}`}>
      <span>{label}</span>
      <b>
        {icon}
        {value || "N/A"}
      </b>
    </div>
  );
}

function getSeverityTone(severity = "") {
  const value = String(severity).toUpperCase();

  if (value === "CRITICAL") return "danger";
  if (value === "HIGH") return "danger";
  if (value === "MEDIUM") return "warning";
  if (value === "LOW") return "success";

  return "info";
}