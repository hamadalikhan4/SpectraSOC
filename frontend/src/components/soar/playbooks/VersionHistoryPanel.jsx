import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Copy,
  GitBranch,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Tag,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

function cleanBaseName(name = "") {
  return name
    .replace(/\s+-\s+Clone$/i, "")
    .replace(/\s+v\d+(\.\d+)?$/i, "")
    .trim();
}

function nextVersion(version = "1.0") {
  const value = String(version || "1.0");
  const [major, minor] = value.split(".").map((item) => Number(item || 0));
  return `${major || 1}.${(minor || 0) + 1}`;
}

function formatDate(value) {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Recently";
  }
}

export default function VersionHistoryPanel({
  playbook,
  onOpenVersion,
  onVersionCreated,
}) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [note, setNote] = useState("");

  const baseName = useMemo(() => cleanBaseName(playbook?.name), [playbook]);

  const loadVersions = async () => {
    if (!playbook?.id) return;

    try {
      setLoading(true);

      const data = await SOAR_API.getPlaybooks({ limit: 200 });
      const list = Array.isArray(data) ? data : [];

      const related = list
        .filter((item) => cleanBaseName(item.name) === baseName)
        .sort((a, b) => {
          const av = Number(String(a.version || "1.0").replace(".", ""));
          const bv = Number(String(b.version || "1.0").replace(".", ""));
          return bv - av;
        });

      setVersions(related);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNewVersion = async () => {
    try {
      setCreating(true);

      const newVersion = nextVersion(playbook.version);

      const payload = {
        name: `${baseName} v${newVersion}`,
        description: `${playbook.description || ""}

Version Notes:
- Created from: v${playbook.version || "1.0"}
- Note: ${note || "No version note added."}`,
        category: playbook.category || "General",
        status: "Draft",
        severity: playbook.severity || "Medium",
        trigger_type: playbook.trigger_type || "Manual",
        trigger_source: playbook.trigger_source || "SOAR Engine",
        is_active: true,
        version: newVersion,
        tags: [
          ...(playbook.tags || []),
          "versioned",
          `base:${baseName}`,
          `version:${newVersion}`,
        ],
        steps: playbook.steps || [],
      };

      const created = await SOAR_API.createPlaybook(payload);

      setNote("");
      await loadVersions();

      if (onVersionCreated) onVersionCreated(created);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [playbook?.id]);

  return (
    <div className="version-history-panel spectra-glass-card">
      <div className="version-history-header">
        <div>
          <span className="hero-chip">
            <GitBranch size={15} />
            Playbook Versioning
          </span>

          <h2>Version History</h2>

          <p>
            Track playbook revisions, create new versions, and open previous
            workflow versions for comparison or rollback.
          </p>
        </div>

        <button className="secondary-btn" onClick={loadVersions} disabled={loading}>
          {loading ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
          Refresh
        </button>
      </div>

      <div className="version-create-box">
        <div>
          <h3>Create New Version</h3>
          <p>
            This creates a separate versioned copy of the current playbook with
            the same workflow steps.
          </p>
        </div>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add version note, for example: Added approval gate before endpoint isolation..."
        />

        <button
          className="primary-btn"
          onClick={createNewVersion}
          disabled={creating}
        >
          {creating ? <Loader2 size={16} /> : <Copy size={16} />}
          Create v{nextVersion(playbook?.version)}
        </button>
      </div>

      <div className="version-current-card">
        <ShieldCheck size={17} />

        <div>
          <b>Current Open Version</b>
          <p>
            {playbook?.name} · v{playbook?.version || "1.0"} ·{" "}
            {playbook?.status || "Draft"}
          </p>
        </div>
      </div>

      <div className="version-list">
        {loading ? (
          <div className="version-empty">Loading version history...</div>
        ) : versions.length === 0 ? (
          <div className="version-empty">No versions found yet.</div>
        ) : (
          versions.map((item) => {
            const isCurrent = item.id === playbook.id;

            return (
              <div
                key={item.id}
                className={`version-row ${isCurrent ? "current" : ""}`}
              >
                <div className="version-row-main">
                  <div className="version-icon">
                    <GitBranch size={16} />
                  </div>

                  <div>
                    <h4>{item.name}</h4>

                    <p>
                      <Clock size={13} />
                      {formatDate(item.updated_at || item.created_at)}
                    </p>

                    <div className="version-row-tags">
                      <span>
                        <Tag size={12} />
                        v{item.version || "1.0"}
                      </span>

                      <span>{item.status || "Draft"}</span>
                      <span>{item.severity || "Medium"}</span>
                      <span>{item.steps?.length || 0} steps</span>

                      {isCurrent && <span className="current-version-pill">Current</span>}
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    className="secondary-btn"
                    onClick={() => onOpenVersion && onOpenVersion(item)}
                  >
                    Open Version
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}