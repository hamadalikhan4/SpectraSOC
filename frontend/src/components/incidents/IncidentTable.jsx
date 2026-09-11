import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Flame,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function IncidentTable({
  incidents,
  filteredIncidents,
  selected,
  viewIncident,
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

  const riskLabel = (score) => {
    const value = Number(score || 0);
    if (value >= 90) return "Extreme";
    if (value >= 70) return "High";
    if (value >= 40) return "Medium";
    return "Low";
  };

  return (
    <div className="card incident-queue-card">
      <div className="section-header">
        <div>
          <h3>Incident Queue</h3>
          <p className="subtitle">
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Incident</th>
              <th>IOC</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredIncidents.map((i) => (
              <tr
                key={i.incident_id}
                className={
                  selected?.incident_id === i.incident_id
                    ? "incident-row active"
                    : "incident-row"
                }
              >
                <td>
                  <b>{i.incident_id}</b>
                  <small>{i.indicator_type || "IOC"}</small>
                </td>

                <td className="ioc-cell">{i.indicator}</td>

                <td>
                  <span className={`pill ${normalize(i.severity)}`}>
                    {severityIcon(i.severity)}
                    {i.severity}
                  </span>
                </td>

                <td>
                  <span className={`status-pill ${normalize(i.status)}`}>
                    {statusIcon(i.status)}
                    {i.status}
                  </span>
                </td>

                <td>
                  <div className="risk-cell">
                    <span>{i.risk_score}</span>
                    <small>{riskLabel(i.risk_score)}</small>
                  </div>
                </td>

                <td>
                  <span className="priority-pill">
                    {Number(i.risk_score || 0) >= 90 ? "P1" : "P2"}
                  </span>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      className="icon-btn"
                      title="View"
                      onClick={() => viewIncident(i.incident_id)}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      className="icon-btn"
                      title="Investigate"
                      onClick={() =>
                        updateStatus(i.incident_id, "INVESTIGATING")
                      }
                    >
                      <UserCheck size={15} />
                    </button>

                    <button
                      className="icon-btn"
                      title="Generate PDF"
                      onClick={() => generateReport(i.incident_id)}
                    >
                      <FileText size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredIncidents.length === 0 && (
        <p className="subtitle">
          No incidents matched your filters. Create one from Threat Intelligence.
        </p>
      )}
    </div>
  );
}