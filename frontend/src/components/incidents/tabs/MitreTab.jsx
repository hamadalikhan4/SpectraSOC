import {
  Activity,
  Crosshair,
  GitBranch,
  ShieldAlert,
  Target,
} from "lucide-react";

import WorkspaceHeader from "../common/WorkspaceHeader";
import SectionCard from "../common/SectionCard";
import StatusChip from "../common/StatusChip";

export default function MitreTab({ selected, ai }) {
  if (!selected) {
    return (
      <div className="empty-state">
        <GitBranch size={34} />
        <h4>No Incident Selected</h4>
        <p>Select an incident to view MITRE ATT&CK mapping.</p>
      </div>
    );
  }

  const risk = Number(selected.risk_score || 0);
  const type = String(selected.indicator_type || "").toUpperCase();

  const techniques = [
    {
      tactic: "Initial Access",
      technique:
        type === "URL" || type === "DOMAIN"
          ? "T1190 Exploit Public-Facing Application"
          : "T1071 Application Layer Protocol",
      confidence: risk >= 70 ? "High" : "Medium",
      stage: "Entry",
    },
    {
      tactic: "Command and Control",
      technique: "T1071 Web Protocols",
      confidence: risk >= 70 ? "High" : "Medium",
      stage: "C2",
    },
    {
      tactic: "Discovery",
      technique: "T1016 System Network Configuration Discovery",
      confidence: "Medium",
      stage: "Recon",
    },
  ];

  return (
    <div className="mitre-pro">
      <WorkspaceHeader
        icon={<GitBranch size={22} />}
        title="MITRE ATT&CK Mapping"
        description="Review estimated ATT&CK tactics, techniques, confidence levels, and attack-stage mapping for this incident."
        status="Mapped"
        statusType="info"
      />

      <div className="mitre-kpi-grid">
        <MitreKpi icon={<Target />} label="Mapped Techniques" value={techniques.length} />
        <MitreKpi icon={<ShieldAlert />} label="Risk Score" value={risk} />
        <MitreKpi icon={<Crosshair />} label="IOC Type" value={selected.indicator_type || "Unknown"} />
        <MitreKpi icon={<Activity />} label="Confidence" value={risk >= 70 ? "High" : "Medium"} />
      </div>

      <SectionCard
        title="Technique Mapping"
        subtitle="Estimated mapping generated from IOC type and incident risk score."
      >
        <div className="mitre-technique-grid">
          {techniques.map((item, index) => (
            <div className="mitre-technique-card" key={index}>
              <div className="mitre-technique-head">
                <div>
                  <span>{item.tactic}</span>
                  <h4>{item.technique}</h4>
                </div>

                <StatusChip type={item.confidence === "High" ? "danger" : "warning"}>
                  {item.confidence}
                </StatusChip>
              </div>

              <p>Attack Stage: {item.stage}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Mapping Notes"
        subtitle="Backend ATT&CK mapper integration will make this mapping dynamic."
      >
        <p className="mitre-notes">
          Current mapping is estimated from IOC type and risk score. Later,
          this tab should consume backend MITRE mapper output from the threat
          analysis engine and AI explanation service.
        </p>
      </SectionCard>
    </div>
  );
}

function MitreKpi({ icon, label, value }) {
  return (
    <div className="mitre-kpi-card">
      <div className="mitre-kpi-icon">{icon}</div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}