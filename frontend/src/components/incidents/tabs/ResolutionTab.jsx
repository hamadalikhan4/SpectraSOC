import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import API from "../../../api/api";
import WorkspaceHeader from "../common/WorkspaceHeader";

export default function ResolutionTab({
  selected,
  updateStatus,
  generateReport,
}) {
  const defaultResolution = {
    rootCause: "",
    containment: "",
    recovery: "",
    lessons: "",
    closeNotes: "",
    resolvedBy: "Hamad Ali Khan",
  };

  const [resolution, setResolution] = useState(defaultResolution);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadResolution = async () => {
    if (!selected?.incident_id) return;

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const res = await API.get(
        `/api/v1/incidents/${selected.incident_id}/resolution`
      );

      if (res.data) {
        setResolution({
          rootCause: res.data.root_cause || "",
          containment: res.data.containment || "",
          recovery: res.data.recovery || "",
          lessons: res.data.lessons_learned || "",
          closeNotes: res.data.closure_notes || "",
          resolvedBy: res.data.resolved_by || "Hamad Ali Khan",
        });
      } else {
        setResolution(defaultResolution);
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to load resolution.");
      setResolution(defaultResolution);
    } finally {
      setLoading(false);
    }
  };

  const saveResolution = async () => {
    if (!selected?.incident_id) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        root_cause: resolution.rootCause,
        containment: resolution.containment,
        recovery: resolution.recovery,
        lessons_learned: resolution.lessons,
        closure_notes: resolution.closeNotes,
        resolved_by: resolution.resolvedBy,
      };

      const res = await API.post(
        `/api/v1/incidents/${selected.incident_id}/resolution`,
        payload
      );

      setResolution({
        rootCause: res.data.root_cause || "",
        containment: res.data.containment || "",
        recovery: res.data.recovery || "",
        lessons: res.data.lessons_learned || "",
        closeNotes: res.data.closure_notes || "",
        resolvedBy: res.data.resolved_by || "Hamad Ali Khan",
      });

      setMessage("Resolution saved successfully.");
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to save resolution.");
    } finally {
      setSaving(false);
    }
  };

  const closeIncident = async () => {
    await saveResolution();
    await updateStatus(selected.incident_id, "CLOSED");
  };

  useEffect(() => {
    loadResolution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.incident_id]);

  if (!selected) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={34} />
        <h4>No Incident Selected</h4>
        <p>Select an incident to complete the resolution workflow.</p>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setResolution((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="resolution-pro">
      <WorkspaceHeader
        icon={<CheckCircle2 size={22} />}
        title="Incident Resolution"
        description="Document the root cause, recovery actions, and closure details before closing the incident."
        status={selected.status}
        statusType={selected.status === "CLOSED" ? "success" : "warning"}
      />

      {loading && <div className="result">Loading resolution...</div>}

      {message && <div className="result success-message">{message}</div>}

      {error && <div className="result error-message">{error}</div>}

      <div className="resolution-grid">
        <div className="resolution-panel">
          <Field
            icon={<ClipboardCheck size={18} />}
            title="Root Cause"
            value={resolution.rootCause}
            onChange={(v) => handleChange("rootCause", v)}
            placeholder="Describe the root cause..."
          />

          <Field
            icon={<ShieldCheck size={18} />}
            title="Containment Actions"
            value={resolution.containment}
            onChange={(v) => handleChange("containment", v)}
            placeholder="Document containment actions..."
          />

          <Field
            icon={<Wrench size={18} />}
            title="Recovery Actions"
            value={resolution.recovery}
            onChange={(v) => handleChange("recovery", v)}
            placeholder="Describe recovery actions..."
          />
        </div>

        <div className="resolution-panel">
          <Field
            icon={<BookOpen size={18} />}
            title="Lessons Learned"
            value={resolution.lessons}
            onChange={(v) => handleChange("lessons", v)}
            placeholder="Lessons learned..."
          />

          <Field
            icon={<FileText size={18} />}
            title="Closure Notes"
            value={resolution.closeNotes}
            onChange={(v) => handleChange("closeNotes", v)}
            placeholder="Final closure notes..."
          />

          <label className="assignment-field">
            Resolved By
            <input
              type="text"
              value={resolution.resolvedBy}
              onChange={(e) => handleChange("resolvedBy", e.target.value)}
            />
          </label>

          <div className="resolution-status">
            <StatusRow label="Containment" value="Completed" />
            <StatusRow label="Recovery" value="Completed" />
            <StatusRow label="Incident" value={selected.status} />
          </div>
        </div>
      </div>

      <div className="resolution-actions">
        <button
          className="btn secondary"
          onClick={() => generateReport(selected.incident_id)}
        >
          Generate Report
        </button>

        <button className="btn secondary" onClick={saveResolution} disabled={saving}>
          <Save size={15} />
          {saving ? "Saving..." : "Save Resolution"}
        </button>

        <button className="btn" onClick={closeIncident} disabled={saving}>
          Close Incident
        </button>
      </div>
    </div>
  );
}

function Field({ icon, title, value, onChange, placeholder }) {
  return (
    <div className="resolution-field">
      <label>
        <span>
          {icon}
          {title}
        </span>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </label>
    </div>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="resolution-status-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}