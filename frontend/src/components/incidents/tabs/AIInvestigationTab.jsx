import {
  AlertTriangle,
  Brain,
  Briefcase,
  Crosshair,
  FileText,
  Flame,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

import WorkspaceHeader from "../common/WorkspaceHeader";
import SectionCard from "../common/SectionCard";
import StatusChip from "../common/StatusChip";

export default function AIInvestigationTab({ ai, selected }) {
  if (!selected) {
    return (
      <div className="empty-state">
        <Brain size={34} />
        <h4>No Incident Selected</h4>
        <p>Select an incident to view AI investigation.</p>
      </div>
    );
  }

  if (!ai) {
    return (
      <div className="empty-state">
        <Brain size={34} />
        <h4>AI Investigation Loading</h4>
        <p>AI analysis will appear after the incident is loaded.</p>
      </div>
    );
  }

  const risk = Number(selected.risk_score || 0);
  const confidence = risk >= 90 ? "High" : risk >= 60 ? "Medium" : "Low";
  const attackStage =
    risk >= 90 ? "Active Threat" : risk >= 60 ? "Suspicious Activity" : "Monitoring";
  const threatType =
    selected.indicator_type === "hash"
      ? "Malware / File Hash"
      : selected.indicator_type === "ip"
      ? "Network IOC"
      : "Threat Intelligence IOC";

  return (
    <div className="ai-investigation-pro">
      <WorkspaceHeader
        icon={<Brain size={22} />}
        title="AI SOC Analyst Report"
        description="AI-generated triage, business impact, containment guidance, recovery actions, and analyst recommendations."
        status={confidence}
        statusType={confidence === "High" ? "danger" : "warning"}
      />

      <div className="ai-verdict-card">
        <div>
          <span>AI Threat Verdict</span>
          <h2>{selected.severity || "UNKNOWN"}</h2>
          <p>{ai.threat_summary || "No threat summary available."}</p>
        </div>

        <div className="ai-verdict-score">
          <b>{risk}</b>
          <span>Risk Score</span>
        </div>
      </div>

      <div className="ai-kpi-grid">
        <AiMetric icon={<Flame />} label="Severity" value={selected.severity} type="danger" />
        <AiMetric icon={<Radar />} label="Threat Type" value={threatType} />
        <AiMetric icon={<Crosshair />} label="Attack Stage" value={attackStage} />
        <AiMetric icon={<Zap />} label="Confidence" value={confidence} />
      </div>

      <div className="overview-split-grid">
        <SectionCard title="Business Impact" subtitle="Potential operational and security impact.">
          <p className="ai-text">
            {ai.business_impact || "No business impact available."}
          </p>
        </SectionCard>

        <SectionCard title="Executive Summary" subtitle="Short incident explanation for reporting.">
          <p className="ai-text">
            This incident is classified as <b>{selected.severity}</b> with a
            risk score of <b>{risk}</b>. The IOC should be reviewed by the SOC
            analyst and validated against endpoint, firewall, proxy, and SIEM logs.
          </p>
        </SectionCard>
      </div>

      <div className="overview-split-grid">
        <AiList title="Containment Plan" items={ai.containment} />
        <AiList title="Recovery Plan" items={ai.recovery} />
      </div>

      <AiList title="Analyst Recommendations" items={ai.recommendations} wide />

      <SectionCard title="AI Notes" subtitle="How this analysis should be used.">
        <div className="ai-note-row">
          <FileText size={18} />
          <p>
            AI analysis should support analyst decision-making, not replace
            verification. Confirm IOC activity using SIEM logs, endpoint telemetry,
            firewall records, DNS logs, and asset context before final closure.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

function AiMetric({ icon, label, value, type = "info" }) {
  return (
    <div className="ai-metric-card">
      <div className="ai-metric-icon">{icon}</div>
      <span>{label}</span>
      <b>{value || "N/A"}</b>
      <StatusChip type={type}>{type === "danger" ? "Priority" : "AI Generated"}</StatusChip>
    </div>
  );
}

function AiList({ title, items, wide }) {
  return (
    <SectionCard
      title={title}
      subtitle="AI-generated response guidance for the analyst."
    >
      <div className={wide ? "ai-list-pro wide" : "ai-list-pro"}>
        {items?.length ? (
          items.map((item, index) => (
            <div className="ai-action-item" key={index}>
              <ShieldCheck size={16} />
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="subtitle">No {title.toLowerCase()} available.</p>
        )}
      </div>
    </SectionCard>
  );
}