import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Flame,
  Gauge,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  Siren,
  UserRound,
  Workflow,
} from "lucide-react";

import INCIDENT_API from "../../../api/incidentApi";
import IncidentCaseWorkspace from "./IncidentCaseWorkspace";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
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

function severityClass(value = "") {
  const severity = String(value).toLowerCase();

  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function statusClass(value = "") {
  const status = String(value).toLowerCase();

  if (status.includes("resolved") || status.includes("closed")) return "resolved";
  if (status.includes("investigating") || status.includes("progress"))
    return "investigating";
  return "open";
}

function isSlaRisk(incident) {
  const status = String(incident.status || "").toLowerCase();

  if (status.includes("resolved") || status.includes("closed")) return false;

  const diff = new Date(incident.sla_due_at).getTime() - Date.now();

  return diff <= 1000 * 60 * 60;
}

function MetricCard({ icon: Icon, label, value, trend, tone = "blue" }) {
  return (
    <div className={`incident-metric-card spectra-glass-card ${tone}`}>
      <Icon size={20} />

      <div>
        <span>{label}</span>
        <b>{value}</b>
        <p>{trend}</p>
      </div>
    </div>
  );
}

function IncidentRow({ incident, selected, onSelect, onOpen }) {
  return (
    <div
      className={`incident-command-row ${selected ? "active" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
    >
      <div className="incident-row-main">
        <div className={`incident-severity-icon ${severityClass(incident.severity)}`}>
          <ShieldAlert size={17} />
        </div>

        <div>
          <div className="incident-row-title">
            <h3>{incident.title}</h3>

            <span className={`severity-pill ${severityClass(incident.severity)}`}>
              {incident.severity}
            </span>

            <span className={`status-pill ${statusClass(incident.status)}`}>
              {incident.status}
            </span>
          </div>

          <p>{incident.description}</p>

          <div className="incident-row-meta">
            <span>{incident.id}</span>
            <span>{incident.category}</span>
            <span>{incident.source}</span>
            <span>
              <UserRound size={12} />
              {incident.assigned_to}
            </span>
          </div>

          <div className="incident-tags">
            {incident.tags.slice(0, 5).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="incident-row-side">
        <div className="risk-score">
          <span>Risk</span>
          <b>{incident.risk_score}</b>
        </div>

        <div className={`sla-box ${isSlaRisk(incident) ? "risk" : ""}`}>
          <Clock size={14} />
          {timeUntil(incident.sla_due_at)}
        </div>

        {incident.linked_soar_execution && (
          <div className="soar-link-pill">
            <Workflow size={13} />
            SOAR Linked
          </div>
        )}

        <button
          className="secondary-btn"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          <Eye size={15} />
          Open Case
        </button>
      </div>
    </div>
  );
}

export default function IncidentCommandCenter() {
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [workspaceIncident, setWorkspaceIncident] = useState(null);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await INCIDENT_API.getOverview();

      const list = data.incidents || [];

      setIncidents(list);
      setMetrics(data.metrics || {});
      setSelectedIncident((prev) => prev || list[0] || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load incident command center.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        incident.id.toLowerCase().includes(query) ||
        incident.category.toLowerCase().includes(query) ||
        incident.tags.join(" ").toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "All" || incident.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" || incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, search, severityFilter, statusFilter]);

  const priorityQueue = useMemo(() => {
    return [...incidents]
      .filter((item) => !["Resolved", "Closed"].includes(item.status))
      .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
      .slice(0, 5);
  }, [incidents]);

  const severityBreakdown = useMemo(() => {
    return ["Critical", "High", "Medium", "Low"].map((severity) => ({
      severity,
      count: incidents.filter((item) => item.severity === severity).length,
    }));
  }, [incidents]);

  if (workspaceIncident) {
    return (
      <IncidentCaseWorkspace
        incident={workspaceIncident}
        onBack={() => setWorkspaceIncident(null)}
        onRefresh={loadIncidents}
      />
    );
  }

  return (
    <div className="incident-command-center">
      <div className="incident-command-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <Siren size={15} />
            Phase 7.2
          </span>

          <h1>Incident Command Center</h1>

          <p>
            Centralized SOC case dashboard for active incidents, SLA risk,
            severity tracking, analyst ownership, linked SOAR executions, and
            full investigation workspaces.
          </p>
        </div>

        <div className="incident-hero-actions">
          <button
            className="secondary-btn"
            onClick={loadIncidents}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
            Refresh
          </button>

          <button className="primary-btn">
            <FileText size={16} />
            New Case
          </button>
        </div>
      </div>

      {error && (
        <div className="spectra-glass-card incident-error-banner">
          <AlertTriangle size={17} />
          {error}
        </div>
      )}

      <div className="incident-metric-grid">
        <MetricCard
          icon={Activity}
          label="Total Incidents"
          value={metrics?.total ?? 0}
          trend="All active cases"
          tone="blue"
        />

        <MetricCard
          icon={Flame}
          label="Critical"
          value={metrics?.critical ?? 0}
          trend="Immediate attention"
          tone="red"
        />

        <MetricCard
          icon={ShieldAlert}
          label="High Severity"
          value={metrics?.high ?? 0}
          trend="Priority queue"
          tone="orange"
        />

        <MetricCard
          icon={Clock}
          label="SLA Risk"
          value={metrics?.slaRisk ?? 0}
          trend="Due within 1 hour"
          tone="yellow"
        />

        <MetricCard
          icon={Gauge}
          label="Avg Risk Score"
          value={metrics?.avgRisk ?? 0}
          trend="Risk posture"
          tone="green"
        />
      </div>

      <div className="incident-command-grid">
        <div className="incident-main-panel spectra-glass-card">
          <div className="incident-panel-header">
            <div>
              <h2>Incident Queue</h2>
              <p>
                Search, filter, and triage incidents from threat intelligence,
                SOAR, SIEM, and manual analyst reports.
              </p>
            </div>

            <span>{filteredIncidents.length} incidents</span>
          </div>

          <div className="incident-toolbar">
            <div className="incident-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search incident id, title, tags..."
              />
            </div>

            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Open</option>
              <option>Investigating</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>

          {loading ? (
            <div className="incident-empty-state">
              <Loader2 size={22} />
              <h3>Loading incidents...</h3>
              <p>Fetching cases from incident source.</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="incident-empty-state">
              <CheckCircle2 size={22} />
              <h3>No incidents found</h3>
              <p>Change filters or create a new case.</p>
            </div>
          ) : (
            <div className="incident-command-list">
              {filteredIncidents.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  selected={selectedIncident?.id === incident.id}
                  onSelect={() => setSelectedIncident(incident)}
                  onOpen={() => setWorkspaceIncident(incident)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="incident-side-panel">
          <div className="spectra-glass-card priority-queue-card">
            <div className="side-card-title">
              <h2>Priority Queue</h2>
              <span>Top risk</span>
            </div>

            <div className="priority-list">
              {priorityQueue.map((incident) => (
                <button
                  key={incident.id}
                  className="priority-row"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div>
                    <b>{incident.title}</b>
                    <span>{incident.id}</span>
                  </div>

                  <strong>{incident.risk_score}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="spectra-glass-card severity-card">
            <div className="side-card-title">
              <h2>Severity Distribution</h2>
              <span>{incidents.length} total</span>
            </div>

            <div className="severity-breakdown">
              {severityBreakdown.map((item) => (
                <div key={item.severity}>
                  <span>{item.severity}</span>
                  <div>
                    <i
                      style={{
                        width: `${
                          incidents.length
                            ? Math.max((item.count / incidents.length) * 100, 5)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="spectra-glass-card selected-incident-card">
            <div className="side-card-title">
              <h2>Selected Case</h2>
              <span>{selectedIncident?.id || "None"}</span>
            </div>

            {selectedIncident ? (
              <div className="selected-case-body">
                <h3>{selectedIncident.title}</h3>

                <p>{selectedIncident.description}</p>

                <div className="selected-case-grid">
                  <div>
                    <span>Status</span>
                    <b>{selectedIncident.status}</b>
                  </div>

                  <div>
                    <span>Severity</span>
                    <b>{selectedIncident.severity}</b>
                  </div>

                  <div>
                    <span>Priority</span>
                    <b>{selectedIncident.priority}</b>
                  </div>

                  <div>
                    <span>Risk</span>
                    <b>{selectedIncident.risk_score}</b>
                  </div>

                  <div>
                    <span>Assigned</span>
                    <b>{selectedIncident.assigned_to}</b>
                  </div>

                  <div>
                    <span>SLA</span>
                    <b>{timeUntil(selectedIncident.sla_due_at)}</b>
                  </div>
                </div>

                <div className="selected-case-footer">
                  <span>Created: {formatTime(selectedIncident.created_at)}</span>
                  <span>Updated: {formatTime(selectedIncident.updated_at)}</span>
                </div>

                <button
                  className="primary-btn full-width-btn"
                  onClick={() => setWorkspaceIncident(selectedIncident)}
                >
                  <Eye size={16} />
                  Open Investigation Workspace
                </button>
              </div>
            ) : (
              <div className="incident-empty-state compact">
                <p>Select an incident to preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}