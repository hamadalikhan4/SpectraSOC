import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Save,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

import API from "../../../api/api";
import WorkspaceHeader from "../common/WorkspaceHeader";

export default function AssignmentTab({ selected }) {
  const risk = Number(selected?.risk_score || 0);

  const defaultPriority =
    risk >= 90 ? "P1 - Critical" : risk >= 70 ? "P2 - High" : "P3 - Medium";

  const defaultAssignment = {
    analyst: "Unassigned",
    priority: defaultPriority,
    sla: risk >= 90 ? "2 Hours" : risk >= 70 ? "6 Hours" : "24 Hours",
    dueDate: "",
    escalation: "SOC Lead",
  };

  const [assignment, setAssignment] = useState(defaultAssignment);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAssignment = async () => {
    if (!selected?.incident_id) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get(
        `/api/v1/incidents/${selected.incident_id}/assignment`
      );

      if (res.data) {
        setAssignment({
          analyst: res.data.analyst || "Unassigned",
          priority: res.data.priority || defaultAssignment.priority,
          sla: res.data.sla || defaultAssignment.sla,
          dueDate: res.data.due_date || "",
          escalation: res.data.escalation || "SOC Lead",
        });
      } else {
        setAssignment(defaultAssignment);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load assignment.");
      setAssignment(defaultAssignment);
    } finally {
      setLoading(false);
    }
  };

  const saveAssignment = async () => {
    if (!selected?.incident_id) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        analyst: assignment.analyst,
        priority: assignment.priority,
        sla: assignment.sla,
        due_date: assignment.dueDate || null,
        escalation: assignment.escalation,
      };

      const res = await API.post(
        `/api/v1/incidents/${selected.incident_id}/assignment`,
        payload
      );

      setAssignment({
        analyst: res.data.analyst || "Unassigned",
        priority: res.data.priority || defaultAssignment.priority,
        sla: res.data.sla || defaultAssignment.sla,
        dueDate: res.data.due_date || "",
        escalation: res.data.escalation || "SOC Lead",
      });

      setMessage("Assignment saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to save assignment.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.incident_id]);

  if (!selected) {
    return (
      <div className="empty-state">
        <UserCheck size={34} />
        <h4>No Incident Selected</h4>
        <p>Select an incident to manage assignment.</p>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setAssignment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="assignment-pro">
      <WorkspaceHeader
        icon={<UserCheck size={22} />}
        title="Incident Assignment"
        description="Assign incident ownership, set priority, define SLA, and track escalation responsibility."
        status={assignment.analyst === "Unassigned" ? "Unassigned" : "Assigned"}
        statusType={assignment.analyst === "Unassigned" ? "warning" : "success"}
      />

      {loading && <div className="result">Loading assignment...</div>}

      {message && <div className="result success-message">{message}</div>}

      {error && <div className="result error-message">{error}</div>}

      <div className="assignment-grid">
        <div className="assignment-panel">
          <h4>Current Ownership</h4>

          <div className="assignment-owner-card">
            <div className="assignment-avatar">
              <UserCheck size={24} />
            </div>

            <div>
              <span>Assigned Analyst</span>
              <b>{assignment.analyst}</b>
              <p>
                {assignment.analyst === "Unassigned"
                  ? "No analyst owns this incident yet."
                  : "Incident ownership assigned and saved."}
              </p>
            </div>
          </div>

          <div className="assignment-metrics">
            <Metric icon={<ShieldAlert size={18} />} label="Priority" value={assignment.priority} />
            <Metric icon={<Clock size={18} />} label="SLA" value={assignment.sla} />
            <Metric icon={<CalendarClock size={18} />} label="Due Date" value={assignment.dueDate || "Not Set"} />
            <Metric icon={<AlertTriangle size={18} />} label="Escalation" value={assignment.escalation} />
          </div>
        </div>

        <div className="assignment-panel">
          <h4>Assign Incident</h4>

          <label className="assignment-field">
            Analyst
            <select
              value={assignment.analyst}
              onChange={(e) => handleChange("analyst", e.target.value)}
            >
              <option>Unassigned</option>
              <option>Hamad Ali Khan</option>
              <option>SOC Analyst L1</option>
              <option>SOC Analyst L2</option>
              <option>Incident Response Lead</option>
            </select>
          </label>

          <label className="assignment-field">
            Priority
            <select
              value={assignment.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
            >
              <option>P1 - Critical</option>
              <option>P2 - High</option>
              <option>P3 - Medium</option>
              <option>P4 - Low</option>
            </select>
          </label>

          <label className="assignment-field">
            SLA
            <select
              value={assignment.sla}
              onChange={(e) => handleChange("sla", e.target.value)}
            >
              <option>2 Hours</option>
              <option>6 Hours</option>
              <option>12 Hours</option>
              <option>24 Hours</option>
            </select>
          </label>

          <label className="assignment-field">
            Due Date
            <input
              type="datetime-local"
              value={assignment.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
            />
          </label>

          <label className="assignment-field">
            Escalation Owner
            <select
              value={assignment.escalation}
              onChange={(e) => handleChange("escalation", e.target.value)}
            >
              <option>SOC Lead</option>
              <option>IR Manager</option>
              <option>Threat Intel Lead</option>
              <option>Security Engineering</option>
            </select>
          </label>

          <button className="btn" onClick={saveAssignment} disabled={saving}>
            <Save size={15} />
            {saving ? "Saving..." : "Save Assignment"}
          </button>
        </div>
      </div>

      <div className="assignment-panel">
        <h4>Incident Assignment Notes</h4>
        <p>
          Assignment is now connected to backend persistence. Ownership, SLA,
          due date, priority, and escalation are saved in the incident database.
        </p>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="assignment-metric-card">
      <div className="assignment-metric-icon">{icon}</div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}