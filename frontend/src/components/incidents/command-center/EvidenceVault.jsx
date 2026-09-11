import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Link2,
  LockKeyhole,
  NotebookPen,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function pseudoHash(input = "") {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  const clean = Math.abs(hash).toString(16).padStart(8, "0");

  return `sha256:${clean}${clean}${clean}${clean}`;
}

function buildEvidencePackage(incident, evidenceItems) {
  return {
    generated_at: new Date().toISOString(),
    incident_id: incident?.id,
    incident_title: incident?.title,
    evidence_count: evidenceItems.length,
    evidence: evidenceItems,
  };
}

function downloadEvidencePackage(incident, evidenceItems) {
  const payload = buildEvidencePackage(incident, evidenceItems);

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident?.id || "incident"}-evidence-package.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function normalizeSeedEvidence(items = [], incident) {
  return items.map((item, index) => ({
    id: item.id || `ev-${index + 1}`,
    name: item.name || "Untitled Evidence",
    type: item.type || "Case Record",
    source: item.source || "SpectraSOC",
    integrity: item.integrity || "Verified",
    added_at: item.added_at || new Date().toISOString(),
    description: item.description || "No evidence description.",
    hash:
      item.hash ||
      pseudoHash(
        `${incident?.id}-${item.name}-${item.type}-${item.source}-${item.description}`
      ),
    linked_timeline: item.linked_timeline ?? true,
    custody: [
      {
        id: `custody-${index}-1`,
        action: "Evidence Collected",
        actor: "SOC Analyst",
        time: item.added_at || new Date().toISOString(),
        note: "Evidence added to case vault.",
      },
      {
        id: `custody-${index}-2`,
        action: "Integrity Verified",
        actor: "SpectraSOC",
        time: item.added_at || new Date().toISOString(),
        note: "Evidence hash generated and stored.",
      },
    ],
  }));
}

export default function EvidenceVault({ incident, initialEvidence = [] }) {
  const [evidenceItems, setEvidenceItems] = useState(() =>
    normalizeSeedEvidence(initialEvidence, incident)
  );
  const [selectedEvidence, setSelectedEvidence] = useState(
    () => normalizeSeedEvidence(initialEvidence, incident)[0] || null
  );
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    type: "Log File",
    source: "SpectraSOC",
    description: "",
    integrity: "Pending",
  });

  const evidenceTypes = useMemo(() => {
    return [
      "All",
      ...new Set(evidenceItems.map((item) => item.type).filter(Boolean)),
    ];
  }, [evidenceItems]);

  const filteredEvidence = useMemo(() => {
    const query = search.toLowerCase();

    return evidenceItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.hash.toLowerCase().includes(query);

      const matchesType = typeFilter === "All" || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [evidenceItems, search, typeFilter]);

  const metrics = useMemo(() => {
    return {
      total: evidenceItems.length,
      verified: evidenceItems.filter((item) => item.integrity === "Verified")
        .length,
      pending: evidenceItems.filter((item) => item.integrity === "Pending")
        .length,
      linked: evidenceItems.filter((item) => item.linked_timeline).length,
    };
  }, [evidenceItems]);

  const addEvidence = () => {
    if (!form.name.trim()) return;

    const now = new Date().toISOString();

    const newEvidence = {
      id: `ev-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      source: form.source || "Manual Upload",
      integrity: form.integrity,
      added_at: now,
      description: form.description || "No description provided.",
      hash: pseudoHash(
        `${incident?.id}-${form.name}-${form.type}-${form.source}-${form.description}-${now}`
      ),
      linked_timeline: true,
      custody: [
        {
          id: `custody-${Date.now()}-1`,
          action: "Evidence Added",
          actor: "SOC Analyst",
          time: now,
          note: "Evidence manually added to vault.",
        },
        {
          id: `custody-${Date.now()}-2`,
          action: "Hash Generated",
          actor: "SpectraSOC",
          time: now,
          note: "Pseudo SHA-256 integrity hash generated for tracking.",
        },
      ],
    };

    setEvidenceItems((prev) => [newEvidence, ...prev]);
    setSelectedEvidence(newEvidence);
    setShowForm(false);
    setForm({
      name: "",
      type: "Log File",
      source: "SpectraSOC",
      description: "",
      integrity: "Pending",
    });
  };

  const verifyEvidence = (item) => {
    const now = new Date().toISOString();

    const updated = {
      ...item,
      integrity: "Verified",
      custody: [
        {
          id: `custody-${Date.now()}`,
          action: "Integrity Verified",
          actor: "SOC Analyst",
          time: now,
          note: "Analyst verified evidence integrity.",
        },
        ...(item.custody || []),
      ],
    };

    setEvidenceItems((prev) =>
      prev.map((evidence) => (evidence.id === item.id ? updated : evidence))
    );
    setSelectedEvidence(updated);
  };

  const linkToTimeline = (item) => {
    const now = new Date().toISOString();

    const updated = {
      ...item,
      linked_timeline: true,
      custody: [
        {
          id: `custody-${Date.now()}`,
          action: "Linked to Timeline",
          actor: "SOC Analyst",
          time: now,
          note: "Evidence linked to investigation timeline.",
        },
        ...(item.custody || []),
      ],
    };

    setEvidenceItems((prev) =>
      prev.map((evidence) => (evidence.id === item.id ? updated : evidence))
    );
    setSelectedEvidence(updated);
  };

  const removeEvidence = (item) => {
    const updated = evidenceItems.filter((evidence) => evidence.id !== item.id);

    setEvidenceItems(updated);
    setSelectedEvidence(updated[0] || null);
  };

  return (
    <div className="evidence-vault-upgrade">
      <div className="evidence-vault-header">
        <div>
          <span className="hero-chip">
            <Database size={15} />
            Evidence Vault
          </span>

          <h2>Digital Evidence Management</h2>

          <p>
            Manage investigation evidence, integrity hashes, custody records,
            source attribution, timeline links, and exportable evidence packages.
          </p>
        </div>

        <div className="evidence-vault-actions">
          <button
            className="secondary-btn"
            onClick={() => downloadEvidencePackage(incident, evidenceItems)}
          >
            <Download size={16} />
            Export Package
          </button>

          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Add Evidence
          </button>
        </div>
      </div>

      <div className="evidence-metric-grid">
        <div>
          <ClipboardList size={16} />
          <span>Total Evidence</span>
          <b>{metrics.total}</b>
        </div>

        <div>
          <ShieldCheck size={16} />
          <span>Verified</span>
          <b>{metrics.verified}</b>
        </div>

        <div>
          <Fingerprint size={16} />
          <span>Pending</span>
          <b>{metrics.pending}</b>
        </div>

        <div>
          <Link2 size={16} />
          <span>Timeline Linked</span>
          <b>{metrics.linked}</b>
        </div>
      </div>

      {showForm && (
        <div className="evidence-add-form">
          <div className="evidence-form-header">
            <h3>Add New Evidence</h3>

            <button onClick={() => setShowForm(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="evidence-form-grid">
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Evidence name, e.g. firewall_logs.json"
            />

            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              <option>Log File</option>
              <option>IOC Report</option>
              <option>Packet Capture</option>
              <option>Screenshot</option>
              <option>Memory Artifact</option>
              <option>Endpoint Artifact</option>
              <option>SOAR Output</option>
              <option>Analyst Note</option>
              <option>Case Record</option>
            </select>

            <input
              value={form.source}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, source: event.target.value }))
              }
              placeholder="Source, e.g. SIEM, EDR, SOAR"
            />

            <select
              value={form.integrity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, integrity: event.target.value }))
              }
            >
              <option>Pending</option>
              <option>Verified</option>
            </select>
          </div>

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Describe evidence relevance, collection source, and investigation value..."
          />

          <button className="primary-btn" onClick={addEvidence}>
            <Plus size={16} />
            Save Evidence
          </button>
        </div>
      )}

      <div className="evidence-toolbar">
        <div className="evidence-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search evidence, hash, source..."
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          {evidenceTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="evidence-vault-grid">
        <div className="evidence-list-panel">
          {filteredEvidence.length === 0 ? (
            <div className="evidence-empty">
              <Database size={22} />
              <b>No evidence found</b>
              <p>Add or adjust filters to view evidence.</p>
            </div>
          ) : (
            filteredEvidence.map((item) => (
              <button
                key={item.id}
                className={`evidence-row ${
                  selectedEvidence?.id === item.id ? "active" : ""
                }`}
                onClick={() => setSelectedEvidence(item)}
              >
                <div className="evidence-row-icon">
                  <FileText size={16} />
                </div>

                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  <div className="evidence-row-meta">
                    <span>{item.type}</span>
                    <span>{item.source}</span>
                    <span>{item.integrity}</span>
                    {item.linked_timeline && <span>Timeline Linked</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="evidence-preview-panel">
          {selectedEvidence ? (
            <>
              <div className="evidence-preview-header">
                <div>
                  <span>{selectedEvidence.type}</span>
                  <h3>{selectedEvidence.name}</h3>
                  <p>{selectedEvidence.description}</p>
                </div>

                <div className="evidence-preview-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => verifyEvidence(selectedEvidence)}
                  >
                    <CheckCircle2 size={15} />
                    Verify
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => linkToTimeline(selectedEvidence)}
                  >
                    <Link2 size={15} />
                    Link
                  </button>

                  <button
                    className="secondary-btn danger-btn"
                    onClick={() => removeEvidence(selectedEvidence)}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>

              <div className="evidence-preview-grid">
                <div>
                  <span>Integrity</span>
                  <b>{selectedEvidence.integrity}</b>
                </div>

                <div>
                  <span>Source</span>
                  <b>{selectedEvidence.source}</b>
                </div>

                <div>
                  <span>Added</span>
                  <b>{formatTime(selectedEvidence.added_at)}</b>
                </div>

                <div>
                  <span>Timeline</span>
                  <b>
                    {selectedEvidence.linked_timeline ? "Linked" : "Not Linked"}
                  </b>
                </div>
              </div>

              <div className="evidence-hash-box">
                <Fingerprint size={16} />
                <div>
                  <span>Evidence Integrity Hash</span>
                  <code>{selectedEvidence.hash}</code>
                </div>
              </div>

              <div className="evidence-custody-section">
                <div className="evidence-section-title">
                  <h3>Chain of Custody</h3>
                  <span>{selectedEvidence.custody?.length || 0} records</span>
                </div>

                <div className="custody-list">
                  {(selectedEvidence.custody || []).map((record) => (
                    <div key={record.id} className="custody-row">
                      <div className="custody-icon">
                        <LockKeyhole size={14} />
                      </div>

                      <div>
                        <h4>{record.action}</h4>
                        <p>{record.note}</p>

                        <div className="custody-meta">
                          <span>{record.actor}</span>
                          <span>{formatTime(record.time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="evidence-preview-note">
                <Eye size={15} />
                This is a structured evidence preview. File upload and backend
                persistence will be added in the next backend phase.
              </div>
            </>
          ) : (
            <div className="evidence-empty">
              <Eye size={22} />
              <b>Select evidence</b>
              <p>Choose an evidence item to view preview and custody details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}