import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
} from "lucide-react";

export default function IncidentDetails({
  selected,
  loading,
  updateStatus,
  generateReport,
}) {
  const normalize = (value) => String(value || "").toUpperCase();

  const severityIcon = (severity) => {
    const sev = normalize(severity);
    if (sev === "CRITICAL") return <Flame size={14} />;
    if (sev === "HIGH") return <AlertTriangle size={14} />;
    if (sev === "MEDIUM") return <Activity size={14} />;
    return <ShieldCheck size={14} />;
  };

  const statusIcon = (status) => {
    const st = normalize(status);
    if (st === "CLOSED") return <CheckCircle2 size={14} />;
    if (st === "CONTAINED") return <ShieldCheck size={14} />;
    if (st === "INVESTIGATING") return <Activity size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className="card incident-details-card">
      <h3>Incident Details</h3>

      {loading && <div className="result">Loading incident details...</div>}

      {!loading && !selected && (
        <div className="empty-state">
          <AlertTriangle size={34} />
          <h4>No Incident Selected</h4>
          <p>Select an incident from the queue to begin investigation.</p>
        </div>
      )}

      {!loading && selected && (
        <div className="result">
          <div className="details-title-row">
            <div>
              <h4>{selected.incident_id}</h4>
              <p>{selected.indicator}</p>
            </div>

            <span className={`pill ${normalize(selected.severity)}`}>
              {severityIcon(selected.severity)}
              {selected.severity}
            </span>
          </div>

          <div className="details-grid">
            <Info label="Indicator Type" value={selected.indicator_type} />
            <Info label="Risk Score" value={selected.risk_score} />
            <Info
              label="Status"
              value={
                <span className={`status-pill ${normalize(selected.status)}`}>
                  {statusIcon(selected.status)}
                  {selected.status}
                </span>
              }
            />
            <Info
              label="Priority"
              value={Number(selected.risk_score || 0) >= 90 ? "P1" : "P2"}
            />
          </div>

          <div className="summary-box">
            <b>Summary</b>
            <p>{selected.summary || "No summary available."}</p>
          </div>

          <div className="actions action-toolbar">
            <button
              className="btn"
              onClick={() =>
                updateStatus(selected.incident_id, "INVESTIGATING")
              }
            >
              Investigating
            </button>

            <button
              className="btn secondary"
              onClick={() => updateStatus(selected.incident_id, "CONTAINED")}
            >
              Contained
            </button>

            <button
              className="btn secondary"
              onClick={() => updateStatus(selected.incident_id, "CLOSED")}
            >
              Close
            </button>

            <button
              className="btn secondary"
              onClick={() => generateReport(selected.incident_id)}
            >
              Generate PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-box">
      <span>{label}</span>
      <b>{value || "N/A"}</b>
    </div>
  );
}