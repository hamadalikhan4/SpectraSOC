import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  RefreshCw,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

import API from "../../../api/api";
import WorkspaceHeader from "../common/WorkspaceHeader";
import StatusChip from "../common/StatusChip";

export default function TimelineTab({ selected }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTimeline = async () => {
    if (!selected?.incident_id) return;

    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/incidents/${selected.incident_id}/timeline`);
      setEvents(res.data.timeline || []);
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to load timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.incident_id]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      evidence: events.filter((e) => e.event_type?.includes("EVIDENCE")).length,
      comments: events.filter((e) => e.event_type?.includes("COMMENT")).length,
      status: events.filter((e) => e.event_type?.includes("STATUS")).length,
    };
  }, [events]);

  if (!selected) {
    return (
      <div className="empty-state">
        <Clock size={34} />
        <h4>No Incident Selected</h4>
        <p>Select an incident to view the audit timeline.</p>
      </div>
    );
  }

  return (
    <div className="timeline-audit-pro">
      <WorkspaceHeader
        icon={<Clock size={22} />}
        title="Automatic Audit Timeline"
        description="Live incident history generated from assignments, comments, evidence, resolution, and status changes."
        status={`${events.length} Events`}
        statusType="info"
      />

      <div className="timeline-toolbar">
        <div className="timeline-stats">
          <TimelineStat label="Total Events" value={stats.total} />
          <TimelineStat label="Evidence" value={stats.evidence} />
          <TimelineStat label="Comments" value={stats.comments} />
          <TimelineStat label="Status Changes" value={stats.status} />
        </div>

        <button className="btn secondary" onClick={loadTimeline} disabled={loading}>
          <RefreshCw size={15} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="result error-message">{error}</div>}

      {!loading && events.length === 0 && (
        <div className="empty-state">
          <Clock size={34} />
          <h4>No Timeline Events</h4>
          <p>No audit events have been recorded for this incident yet.</p>
        </div>
      )}

      <div className="timeline-audit-list">
        {events.map((event) => {
          const Icon = getEventIcon(event.event_type);
          const chip = getEventChip(event.event_type);

          return (
            <div className="timeline-audit-item" key={event.id || event.created_at}>
              <div className={`timeline-audit-marker ${chip.type}`}>
                <Icon size={18} />
              </div>

              <div className="timeline-audit-card">
                <div className="timeline-audit-head">
                  <div>
                    <h4>{formatEventType(event.event_type)}</h4>
                    <p>{event.description}</p>
                  </div>

                  <StatusChip type={chip.type}>{chip.label}</StatusChip>
                </div>

                <div className="timeline-audit-meta">
                  <span>Created By: {event.created_by || "SpectraSOC"}</span>
                  <span>{formatDate(event.created_at)}</span>
                  <span>{relativeTime(event.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineStat({ label, value }) {
  return (
    <div className="timeline-stat-card">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function getEventIcon(type = "") {
  const value = type.toUpperCase();

  if (value.includes("ASSIGNMENT")) return UserCheck;
  if (value.includes("COMMENT")) return MessageSquare;
  if (value.includes("EVIDENCE")) return Paperclip;
  if (value.includes("RESOLUTION")) return CheckCircle2;
  if (value.includes("STATUS")) return Activity;
  if (value.includes("CREATED")) return ShieldAlert;

  return FileText;
}

function getEventChip(type = "") {
  const value = type.toUpperCase();

  if (value.includes("ASSIGNMENT")) {
    return { label: "Assignment", type: "info" };
  }

  if (value.includes("COMMENT")) {
    return { label: "Comment", type: "success" };
  }

  if (value.includes("EVIDENCE")) {
    return { label: "Evidence", type: "warning" };
  }

  if (value.includes("RESOLUTION")) {
    return { label: "Resolution", type: "success" };
  }

  if (value.includes("STATUS")) {
    return { label: "Status", type: "danger" };
  }

  if (value.includes("CREATED")) {
    return { label: "Created", type: "info" };
  }

  return { label: "Audit", type: "info" };
}

function formatEventType(type = "") {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Unknown time";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function relativeTime(value) {
  if (!value) return "Unknown";

  try {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${diffDay} day ago`;
  } catch {
    return "Unknown";
  }
}