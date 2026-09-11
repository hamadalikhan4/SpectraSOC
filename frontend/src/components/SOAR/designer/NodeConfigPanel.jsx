import { useEffect, useState } from "react";
import { Save, Settings2, X } from "lucide-react";

export default function NodeConfigPanel({ node, onUpdate, onClose }) {
  const [draft, setDraft] = useState(null);
  const [configText, setConfigText] = useState("{}");
  const [conditionText, setConditionText] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (!node) return;

    setDraft(node.data);
    setConfigText(JSON.stringify(node.data.config || {}, null, 2));
    setConditionText(JSON.stringify(node.data.condition || {}, null, 2));
    setJsonError("");
  }, [node]);

  if (!node || !draft) {
    return (
      <aside className="spectra-glass-card node-config-panel">
        <div className="panel-title">
          <Settings2 size={18} />
          Node Configuration
        </div>

        <p className="ai-subtitle">
          Select a workflow node to inspect and configure its automation logic.
        </p>
      </aside>
    );
  }

  const update = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyChanges = () => {
    try {
      const parsedConfig = JSON.parse(configText || "{}");
      const parsedCondition = JSON.parse(conditionText || "{}");

      onUpdate(node.id, {
        ...draft,
        config: parsedConfig,
        condition: parsedCondition,
      });

      setJsonError("");
    } catch {
      setJsonError("Config or condition JSON is invalid.");
    }
  };

  return (
    <aside className="spectra-glass-card node-config-panel">
      <div className="node-config-header">
        <div className="panel-title">
          <Settings2 size={18} />
          Node Configuration
        </div>

        <button onClick={onClose}>
          <X size={17} />
        </button>
      </div>

      <label>
        Step Type
        <select
          value={draft.step_type}
          onChange={(e) => update("step_type", e.target.value)}
        >
          <option>Trigger</option>
          <option>Action</option>
          <option>Decision</option>
        </select>
      </label>

      <label>
        Name
        <input
          value={draft.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </label>

      <label>
        Description
        <textarea
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      <label>
        Connector
        <input
          value={draft.connector_name}
          onChange={(e) => update("connector_name", e.target.value)}
        />
      </label>

      <label>
        Action Key
        <input
          value={draft.action_key}
          onChange={(e) => update("action_key", e.target.value)}
        />
      </label>

      <div className="node-config-grid">
        <label>
          Timeout
          <input
            type="number"
            value={draft.timeout_seconds}
            onChange={(e) => update("timeout_seconds", e.target.value)}
          />
        </label>

        <label>
          Retry Count
          <input
            type="number"
            value={draft.retry_count}
            onChange={(e) => update("retry_count", e.target.value)}
          />
        </label>
      </div>

      <label>
        Config JSON
        <textarea
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
        />
      </label>

      <label>
        Condition JSON
        <textarea
          value={conditionText}
          onChange={(e) => setConditionText(e.target.value)}
        />
      </label>

      {jsonError && <p className="drawer-error">{jsonError}</p>}

      <button className="primary-btn full-width-btn" onClick={applyChanges}>
        <Save size={16} />
        Apply Node Changes
      </button>
    </aside>
  );
}