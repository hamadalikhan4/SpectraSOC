import { useEffect, useMemo, useState } from "react";
import API from "../../api/api";
import {
  Search,
  RefreshCcw,
  Download,
  Eye,
  Brain,
  ShieldAlert,
} from "lucide-react";

export default function LogExplorer() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const loadLogs = async () => {
    try {
      const res = await API.get("/api/v1/siem/logs?limit=100");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = `
        ${log.source_ip || ""}
        ${log.event_type || ""}
        ${log.severity || ""}
        ${log.message || ""}
        ${log.mitre_technique || ""}
        ${log.source_type || ""}
        ${log.username || ""}
      `.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesSeverity = severity === "ALL" || log.severity === severity;
      const matchesSource = source === "ALL" || log.source_type === source;

      return matchesSearch && matchesSeverity && matchesSource;
    });
  }, [logs, search, severity, source]);

  const exportCSV = () => {
    const rows = [
      ["Time", "Source IP", "Event Type", "Severity", "Risk", "MITRE", "Message"],
      ...filteredLogs.map((l) => [
        l.created_at,
        l.source_ip || "",
        l.event_type || "",
        l.severity || "",
        l.risk_score || "",
        l.mitre_technique || "",
        l.message || "",
      ]),
    ];

    const csv = rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SpectraSOC_siem_logs.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="siem-card log-explorer">
      <div className="siem-card-head">
        <div>
          <h3>Log Explorer</h3>
          <p className="subtitle">
            Search, filter, inspect, and investigate normalized SIEM events.
          </p>
        </div>

        <div className="log-actions">
          <button onClick={loadLogs}>
            <RefreshCcw size={15} />
            Refresh
          </button>

          <button onClick={exportCSV}>
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="log-toolbar">
        <div className="log-search">
          <Search size={16} />
          <input
            placeholder="Search IP, MITRE, username, event, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="ALL">All Sources</option>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
          <option value="firewall">Firewall</option>
          <option value="web">Web</option>
          <option value="honeypot">Honeypot</option>
          <option value="application">Application</option>
        </select>
      </div>

      <div className="log-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Source IP</th>
              <th>Event</th>
              <th>Severity</th>
              <th>Risk</th>
              <th>Zero-Day</th>
              <th>MITRE</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleTimeString()}</td>
                <td>{log.source_ip || "N/A"}</td>
                <td>{log.event_type}</td>
                <td>
                  <span className={`pill ${log.severity}`}>
                    {log.severity}
                  </span>
                </td>
                <td>{log.risk_score}</td>
                <td>
                  {log.zero_day_suspicion === "true" ? (
                    <span className="pill CRITICAL">{log.zero_day_score}</span>
                  ) : (
                    <span className="pill LOW">{log.zero_day_score}</span>
                  )}
                </td>
                <td>{log.mitre_technique}</td>
                <td>{log.source_type}</td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => setSelected(log)} title="View">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => setSelected(log)} title="AI Explain">
                      <Brain size={15} />
                    </button>
                    <button onClick={() => setSelected(log)} title="Create Incident">
                      <ShieldAlert size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="result">No logs matched your filters.</div>
        )}
      </div>

      {selected && (
        <div className="log-drawer">
          <div className="log-drawer-header">
            <h3>Event Investigation</h3>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>

          <div className="grid two">
            <div className="result">
              <p><b>Event Type:</b> {selected.event_type}</p>
              <p><b>Source IP:</b> {selected.source_ip || "N/A"}</p>
              <p><b>Destination IP:</b> {selected.destination_ip || "N/A"}</p>
              <p><b>Username:</b> {selected.username || "N/A"}</p>
              <p><b>Severity:</b> {selected.severity}</p>
              <p><b>Risk Score:</b> {selected.risk_score}</p>
              <p><b>MITRE:</b> {selected.mitre_technique}</p>
              <p><b>Zero-Day Score:</b> {selected.zero_day_score}</p>
            </div>

            <div className="result">
              <h4>SpectraSOC Assessment</h4>
              <p>
                This event indicates <b>{selected.event_type}</b> activity from{" "}
                <b>{selected.source_ip || "unknown source"}</b>. The event has a
                risk score of <b>{selected.risk_score}</b> and maps to{" "}
                <b>{selected.mitre_technique}</b>.
              </p>

              <h4>Recommended Actions</h4>
              <ul>
                <li>Review related logs from the same source IP.</li>
                <li>Check whether this IP appears in threat intelligence.</li>
                <li>Validate whether the user account was compromised.</li>
                <li>Create an incident if activity is repeated or high risk.</li>
              </ul>
            </div>
          </div>

          <br />

          <div className="result">
            <h4>Raw Message</h4>
            <p>{selected.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}