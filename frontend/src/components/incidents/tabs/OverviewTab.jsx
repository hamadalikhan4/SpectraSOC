import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe2,
  Server,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function OverviewTab({
  selected,
  updateStatus,
  generateReport,
}) {
  if (!selected) {
    return null;
  }

  const riskScore = Number(selected.risk_score || 0);
  const priority = riskScore >= 90 ? "P1" : riskScore >= 70 ? "P2" : "P3";

  return (
    <div className="overview-tab-pro">
      <div className="overview-hero">
        <div>
          <span className="section-eyebrow">Incident Summary</span>
          <h3>{selected.incident_id}</h3>
          <p>{selected.summary || "No incident summary available."}</p>
        </div>

        <span className={`pill ${selected.severity}`}>
          <AlertTriangle size={14} />
          {selected.severity}
        </span>
      </div>

      <div className="overview-info-grid">
        <Info label="Indicator" value={selected.indicator} />
        <Info label="Indicator Type" value={selected.indicator_type} />
        <Info label="Risk Score" value={selected.risk_score} />
        <Info label="Status" value={selected.status} />
        <Info label="Priority" value={priority} />
        <Info label="Source" value="Threat Intelligence" />
      </div>

      <div className="overview-split-grid">
        <div className="overview-panel">
          <h4>Threat Intelligence</h4>

          <IntelRow icon={<ShieldCheck />} label="Threat Score" value={`${riskScore}/100`} />
          <IntelRow icon={<Activity />} label="Confidence" value={riskScore >= 90 ? "High" : "Medium"} />
          <IntelRow icon={<Globe2 />} label="GeoIP" value="Available after enrichment" />
          <IntelRow icon={<AlertTriangle />} label="Detection" value="Multi-source IOC analysis" />
        </div>

        <div className="overview-panel">
          <h4>Affected Assets</h4>

          <IntelRow icon={<Server />} label="Hostname" value="Unknown" />
          <IntelRow icon={<UserCheck />} label="Assigned Analyst" value="Unassigned" />
          <IntelRow icon={<Globe2 />} label="Location" value="Unknown" />
          <IntelRow icon={<Activity />} label="Business Unit" value="SOC Operations" />
        </div>
      </div>

      <div className="overview-panel">
        <h4>Quick Response Actions</h4>

        <div className="overview-actions">
          <button
            className="btn"
            onClick={() => updateStatus(selected.incident_id, "INVESTIGATING")}
          >
            <Activity size={15} />
            Investigate
          </button>

          <button
            className="btn secondary"
            onClick={() => updateStatus(selected.incident_id, "CONTAINED")}
          >
            <ShieldCheck size={15} />
            Contain
          </button>

          <button
            className="btn secondary"
            onClick={() => generateReport(selected.incident_id)}
          >
            <FileText size={15} />
            Generate Report
          </button>

          <button
            className="btn secondary"
            onClick={() => updateStatus(selected.incident_id, "CLOSED")}
          >
            <CheckCircle2 size={15} />
            Close Incident
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="overview-info-card">
      <span>{label}</span>
      <b>{value || "N/A"}</b>
    </div>
  );
}

function IntelRow({ icon, label, value }) {
  return (
    <div className="overview-intel-row">
      <div className="overview-intel-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
    </div>
  );
}