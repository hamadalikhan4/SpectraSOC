import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Link2,
  MessageSquare,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Workflow,
  X,
  XCircle,
} from "lucide-react";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function statusClass(status = "") {
  const value = status.toLowerCase();

  if (value.includes("success") || value.includes("completed")) return "success";
  if (value.includes("failed") || value.includes("error")) return "failed";
  if (value.includes("warning") || value.includes("pending")) return "warning";
  return "info";
}

function typeIcon(type = "") {
  const value = type.toLowerCase();

  if (value.includes("soar")) return Workflow;
  if (value.includes("evidence")) return Link2;
  if (value.includes("triage")) return ShieldAlert;
  if (value.includes("note")) return MessageSquare;
  if (value.includes("containment")) return AlertTriangle;
  return Activity;
}

function exportTimeline(incident, events) {
  const payload = {
    generated_at: new Date().toISOString(),
    incident_id: incident?.id,
    incident_title: incident?.title,
    timeline_count: events.length,
    timeline: events,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident?.id || "incident"}-timeline.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function CaseTimeline({ incident, initialEvents = [] }) {
  const [events, setEvents] = useState(() =>
    initialEvents.map((item, index) => ({
      id: item.id || `timeline-${index + 1}`,
      title: item.title || "Timeline Event",
      type: item.type || "Case",
      status: item.status || "Info",
      time: item.time || new Date().toISOString(),
      description: item.description || "No event description.",
      linked_evidence: item.linked_evidence || "",
      linked_soar: item.linked_soar || incident?.linked_soar_execution || "",
      actor: item.actor || "SOC Analyst",
    }))
  );

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    title: "",
    type: "Analyst Note",
    status: "Info",
    description: "",
    linked_evidence: "",
    linked_soar: incident?.linked_soar_execution || "",
    actor: "SOC Analyst",
  });

  const eventTypes = useMemo(() => {
    return ["All", ...new Set(events.map((event) => event.type).filter(Boolean))];
  }, [events]);

  const statuses = useMemo(() => {
    return ["All", ...new Set(events.map((event) => event.status).filter(Boolean))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase();

    return events
      .filter((event) => {
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query) ||
          event.actor.toLowerCase().includes(query) ||
          event.linked_evidence.toLowerCase().includes(query) ||
          event.linked_soar.toLowerCase().includes(query);

        const matchesType = typeFilter === "All" || event.type === typeFilter;
        const matchesStatus =
          statusFilter === "All" || event.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [events, search, typeFilter, statusFilter]);

  const metrics = useMemo(() => {
    return {
      total: events.length,
      evidenceLinked: events.filter((event) => event.linked_evidence).length,
      soarLinked: events.filter((event) => event.linked_soar).length,
      warnings: events.filter((event) =>
        ["warning", "failed", "pending"].some((word) =>
          event.status.toLowerCase().includes(word)
        )
      ).length,
    };
  }, [events]);

  const addEvent = () => {
    if (!form.title.trim()) return;

    const newEvent = {
      id: `timeline-${Date.now()}`,
      title: form.title.trim(),
      type: form.type,
      status: form.status,
      time: new Date().toISOString(),
      description: form.description || "No event description.",
      linked_evidence: form.linked_evidence || "",
      linked_soar: form.linked_soar || "",
      actor: form.actor || "SOC Analyst",
    };

    setEvents((prev) => [newEvent, ...prev]);
    setShowForm(false);
    setForm({
      title: "",
      type: "Analyst Note",
      status: "Info",
      description: "",
      linked_evidence: "",
      linked_soar: incident?.linked_soar_execution || "",
      actor: "SOC Analyst",
    });
  };

  return (
    <div className="case-timeline-v2">
      <div className="timeline-v2-header">
        <div>
          <span className="hero-chip">
            <Activity size={15} />
            Case Timeline v2
          </span>

          <h2>Investigation Timeline</h2>

          <p>
            Track case activity, triage decisions, evidence links, SOAR
            execution events, analyst notes, and containment actions.
          </p>
        </div>

        <div className="timeline-v2-actions">
          <button
            className="secondary-btn"
            onClick={() => exportTimeline(incident, events)}
          >
            <Download size={16} />
            Export Timeline
          </button>

          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </div>

      <div className="timeline-v2-metrics">
        <div>
          <Activity size={16} />
          <span>Total Events</span>
          <b>{metrics.total}</b>
        </div>

        <div>
          <Link2 size={16} />
          <span>Evidence Linked</span>
          <b>{metrics.evidenceLinked}</b>
        </div>

        <div>
          <Workflow size={16} />
          <span>SOAR Linked</span>
          <b>{metrics.soarLinked}</b>
        </div>

        <div>
          <AlertTriangle size={16} />
          <span>Warnings</span>
          <b>{metrics.warnings}</b>
        </div>
      </div>

      {showForm && (
        <div className="timeline-event-form">
          <div className="timeline-form-header">
            <h3>Add Timeline Event</h3>

            <button onClick={() => setShowForm(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="timeline-form-grid">
            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Event title, e.g. Malware hash confirmed"
            />

            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              <option>Case</option>
              <option>Triage</option>
              <option>Evidence</option>
              <option>SOAR</option>
              <option>Analyst Note</option>
              <option>Containment</option>
              <option>Escalation</option>
              <option>Resolution</option>
            </select>

            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option>Info</option>
              <option>Success</option>
              <option>Warning</option>
              <option>Failed</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>

            <input
              value={form.actor}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, actor: event.target.value }))
              }
              placeholder="Actor, e.g. SOC Analyst"
            />

            <input
              value={form.linked_evidence}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  linked_evidence: event.target.value,
                }))
              }
              placeholder="Linked evidence ID/name"
            />

            <input
              value={form.linked_soar}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  linked_soar: event.target.value,
                }))
              }
              placeholder="Linked SOAR execution"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            placeholder="Describe what happened, what was found, or what action was taken..."
          />

          <button className="primary-btn" onClick={addEvent}>
            <Plus size={16} />
            Save Timeline Event
          </button>
        </div>
      )}

      <div className="timeline-v2-toolbar">
        <div className="timeline-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search timeline events..."
          />
        </div>

        <div className="timeline-filter">
          <Filter size={15} />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {eventTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="timeline-filter">
          <Filter size={15} />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="timeline-v2-empty">
          <Clock size={22} />
          <b>No timeline events found</b>
          <p>Add an event or adjust filters.</p>
        </div>
      ) : (
        <div className="timeline-v2-list">
          {filteredEvents.map((event) => {
            const Icon = typeIcon(event.type);

            return (
              <div
                key={event.id}
                className={`timeline-v2-row ${statusClass(event.status)}`}
              >
                <div className="timeline-v2-icon">
                  <Icon size={16} />
                </div>

                <div className="timeline-v2-content">
                  <div className="timeline-v2-title">
                    <h3>{event.title}</h3>
                    <span className={statusClass(event.status)}>
                      {event.status}
                    </span>
                  </div>

                  <p>{event.description}</p>

                  <div className="timeline-v2-meta">
                    <span>{event.type}</span>
                    <span>{event.actor}</span>
                    <span>{formatTime(event.time)}</span>
                  </div>

                  {(event.linked_evidence || event.linked_soar) && (
                    <div className="timeline-v2-links">
                      {event.linked_evidence && (
                        <span>
                          <Link2 size={12} />
                          Evidence: {event.linked_evidence}
                        </span>
                      )}

                      {event.linked_soar && (
                        <span>
                          <Workflow size={12} />
                          SOAR: {event.linked_soar}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}