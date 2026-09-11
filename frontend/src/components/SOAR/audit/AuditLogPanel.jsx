import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileClock,
  Filter,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  clearSoarAuditLogs,
  exportSoarAuditLogs,
  readSoarAuditLogs,
} from "./soarAuditLog";

function formatTime(value) {
  if (!value) return "Unknown";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function statusIcon(status) {
  const value = String(status || "").toLowerCase();

  if (value.includes("success")) return <CheckCircle2 size={15} />;
  if (value.includes("blocked") || value.includes("warning"))
    return <AlertTriangle size={15} />;
  if (value.includes("failed") || value.includes("rejected"))
    return <XCircle size={15} />;

  return <Activity size={15} />;
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value.includes("success")) return "success";
  if (value.includes("blocked") || value.includes("warning")) return "warning";
  if (value.includes("failed") || value.includes("rejected")) return "danger";

  return "info";
}

export default function AuditLogPanel({
  playbookId,
  playbookName,
  refreshKey = 0,
}) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("All");

  const loadLogs = () => {
    setLogs(readSoarAuditLogs());
  };

  useEffect(() => {
    loadLogs();
  }, [refreshKey]);

  const scopedLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!playbookId) return true;

      return (
        log.entity_id === playbookId ||
        log.details?.playbook_id === playbookId ||
        log.entity_name === playbookName
      );
    });
  }, [logs, playbookId, playbookName]);

  const filteredLogs = useMemo(() => {
    if (filter === "All") return scopedLogs;

    return scopedLogs.filter(
      (log) => String(log.status || "").toLowerCase() === filter.toLowerCase()
    );
  }, [scopedLogs, filter]);

  const metrics = useMemo(() => {
    return {
      total: scopedLogs.length,
      success: scopedLogs.filter((log) =>
        String(log.status).toLowerCase().includes("success")
      ).length,
      warning: scopedLogs.filter((log) =>
        String(log.status).toLowerCase().includes("warning")
      ).length,
      failed: scopedLogs.filter((log) =>
        String(log.status).toLowerCase().includes("failed")
      ).length,
    };
  }, [scopedLogs]);

  const handleClear = () => {
    clearSoarAuditLogs();
    loadLogs();
  };

  return (
    <div className="soar-audit-panel spectra-glass-card">
      <div className="soar-audit-header">
        <div>
          <span className="hero-chip">
            <FileClock size={15} />
            SOAR Audit Logs
          </span>

          <h2>Audit Trail</h2>

          <p>
            Track playbook changes, approvals, executions, blocked runs, version
            activity, and analyst actions for this SOAR workflow.
          </p>
        </div>

        <div className="soar-audit-actions">
          <button className="secondary-btn" onClick={loadLogs}>
            <RefreshCcw size={16} />
            Refresh
          </button>

          <button className="secondary-btn" onClick={exportSoarAuditLogs}>
            <Download size={16} />
            Export
          </button>

          <button className="secondary-btn danger-btn" onClick={handleClear}>
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="soar-audit-metrics">
        <div>
          <ShieldCheck size={16} />
          <span>Total Events</span>
          <b>{metrics.total}</b>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>Success</span>
          <b>{metrics.success}</b>
        </div>

        <div>
          <AlertTriangle size={16} />
          <span>Warnings</span>
          <b>{metrics.warning}</b>
        </div>

        <div>
          <XCircle size={16} />
          <span>Failed</span>
          <b>{metrics.failed}</b>
        </div>
      </div>

      <div className="soar-audit-toolbar">
        <div>
          <Filter size={15} />
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option>All</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Failed</option>
            <option>Blocked</option>
            <option>Rejected</option>
            <option>Info</option>
          </select>
        </div>

        <span>
          Showing {filteredLogs.length} of {scopedLogs.length} events
        </span>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="soar-audit-empty">
          <FileClock size={20} />
          <b>No audit events yet</b>
          <p>
            Start saving, approving, running, cloning, or versioning this
            playbook to generate audit logs.
          </p>
        </div>
      ) : (
        <div className="soar-audit-list">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`soar-audit-row ${statusClass(log.status)}`}
            >
              <div className="soar-audit-icon">{statusIcon(log.status)}</div>

              <div className="soar-audit-content">
                <div className="soar-audit-title">
                  <h3>{log.action}</h3>
                  <span>{log.status}</span>
                </div>

                <p>
                  {log.entity_name || "SOAR Entity"} · {log.entity_type} ·{" "}
                  {formatTime(log.timestamp)}
                </p>

                <div className="soar-audit-meta">
                  <span>Actor: {log.actor}</span>
                  <span>Source: {log.source}</span>
                  <span>Severity: {log.severity}</span>
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}