import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  FileDigit,
  FileText,
  Hash,
  Paperclip,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import API from "../../../api/api";
import WorkspaceHeader from "../common/WorkspaceHeader";

export default function EvidenceTab({ selected }) {
  const [evidence, setEvidence] = useState([]);
  const [form, setForm] = useState({
    evidenceType: "IOC",
    title: "",
    description: "",
    value: "",
    source: "SOC Analyst",
    collectedBy: "Hamad Ali Khan",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEvidence = async () => {
    if (!selected?.incident_id) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get(
        `/api/v1/incidents/${selected.incident_id}/evidence`
      );

      setEvidence(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to load evidence.");
    } finally {
      setLoading(false);
    }
  };

  const addEvidence = async () => {
    if (!selected?.incident_id) return;

    if (!form.title.trim() || !form.value.trim()) {
      setError("Evidence title and value are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        evidence_type: form.evidenceType,
        title: form.title.trim(),
        description: form.description.trim() || null,
        value: form.value.trim(),
        source: form.source,
        collected_by: form.collectedBy,
      };

      await API.post(
        `/api/v1/incidents/${selected.incident_id}/evidence`,
        payload
      );

      setForm({
        evidenceType: "IOC",
        title: "",
        description: "",
        value: "",
        source: "SOC Analyst",
        collectedBy: "Hamad Ali Khan",
      });

      setMessage("Evidence added successfully.");
      await loadEvidence();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to add evidence.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvidence = async (evidenceId) => {
    if (!selected?.incident_id) return;

    try {
      setError("");
      setMessage("");

      await API.delete(
        `/api/v1/incidents/${selected.incident_id}/evidence/${evidenceId}`
      );

      setMessage("Evidence deleted successfully.");
      await loadEvidence();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to delete evidence.");
    }
  };

  useEffect(() => {
    loadEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.incident_id]);

  if (!selected) {
    return (
      <div className="empty-state">
        <h4>No Evidence Available</h4>
        <p>Select an incident to review collected evidence.</p>
      </div>
    );
  }

  return (
    <div className="evidence-pro">
      <WorkspaceHeader
        icon={<Paperclip size={22} />}
        title="Evidence Collection"
        description="Review artifacts gathered from IOC enrichment, AI investigation, incident timeline, and analyst-added evidence."
        status={`${evidence.length} Items`}
        statusType="success"
      />

      {loading && <div className="result">Loading evidence...</div>}

      {message && <div className="result success-message">{message}</div>}

      {error && <div className="result error-message">{error}</div>}

      <div className="evidence-summary-grid">
        <EvidenceInfo
          icon={<Hash size={18} />}
          title="Indicator"
          value={selected.indicator}
        />

        <EvidenceInfo
          icon={<FileDigit size={18} />}
          title="IOC Type"
          value={selected.indicator_type}
        />

        <EvidenceInfo
          icon={<ShieldAlert size={18} />}
          title="Risk Score"
          value={selected.risk_score}
        />

        <EvidenceInfo
          icon={<Database size={18} />}
          title="Stored Evidence"
          value={evidence.length}
        />
      </div>

      <div className="evidence-two-grid">
        <div className="evidence-panel">
          <h4>Add Evidence</h4>

          <label className="assignment-field">
            Evidence Type
            <select
              value={form.evidenceType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  evidenceType: e.target.value,
                }))
              }
            >
              <option>IOC</option>
              <option>Hash</option>
              <option>IP Address</option>
              <option>Domain</option>
              <option>URL</option>
              <option>Log Entry</option>
              <option>Screenshot</option>
              <option>File Artifact</option>
              <option>PCAP</option>
              <option>Memory Artifact</option>
            </select>
          </label>

          <label className="assignment-field">
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Example: Malicious SHA256 hash"
            />
          </label>

          <label className="assignment-field">
            Evidence Value
            <textarea
              value={form.value}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
              placeholder="Paste IOC, hash, log entry, file name, URL, or investigation artifact..."
            />
          </label>

          <label className="assignment-field">
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe why this evidence matters..."
            />
          </label>

          <button className="btn" onClick={addEvidence} disabled={saving}>
            <Plus size={15} />
            {saving ? "Adding..." : "Add Evidence"}
          </button>
        </div>

        <div className="evidence-panel">
          <h4>Automated Artifacts</h4>

          <Artifact icon={<CheckCircle2 size={16} />} title="IOC" status="Collected" />
          <Artifact icon={<Brain size={16} />} title="AI Investigation" status="Generated" />
          <Artifact icon={<Clock3 size={16} />} title="Incident Timeline" status="Completed" />
          <Artifact icon={<Database size={16} />} title="Threat Context" status="Attached" />
          <Artifact icon={<FileText size={16} />} title="Incident Metadata" status="Available" />
        </div>
      </div>

      <div className="evidence-panel">
        <h4>Stored Evidence</h4>

        {evidence.length === 0 && (
          <div className="empty-state">
            <Paperclip size={30} />
            <h4>No Stored Evidence</h4>
            <p>Add evidence to preserve it with this incident.</p>
          </div>
        )}

        <div className="stored-evidence-grid">
          {evidence.map((item) => (
            <div className="stored-evidence-card" key={item.id}>
              <div className="stored-evidence-head">
                <div>
                  <span>{item.evidence_type}</span>
                  <h4>{item.title}</h4>
                </div>

                <button
                  className="icon-btn danger"
                  onClick={() => deleteEvidence(item.id)}
                  title="Delete evidence"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <p>{item.description || "No description provided."}</p>

              <div className="stored-evidence-value">
                {item.value}
              </div>

              <div className="stored-evidence-meta">
                <span>Source: {item.source}</span>
                <span>Collected By: {item.collected_by}</span>
                <span>{formatDate(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="evidence-panel">
        <h4>Evidence Notes</h4>

        <p>
          Evidence is now stored in the backend and linked to the selected
          incident. Future versions can support file uploads, hash verification,
          chain of custody, screenshots, malware samples, PCAP files, and
          forensic images.
        </p>
      </div>
    </div>
  );
}

function EvidenceInfo({ icon, title, value }) {
  return (
    <div className="evidence-info-card">
      <div className="evidence-info-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <b>{value || "N/A"}</b>
      </div>
    </div>
  );
}

function Artifact({ icon, title, status }) {
  return (
    <div className="artifact-row">
      <div className="artifact-left">
        {icon}
        <span>{title}</span>
      </div>

      <span className="artifact-status">{status}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Unknown time";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}