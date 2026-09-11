import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gauge,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

export default function GeneratedPlaybookPreview({
  generated,
  creating,
  createdPlaybook,
  onCreate,
  onOpenPlaybooks,
}) {
  const playbook = generated.playbook;
  const steps = playbook.steps || [];

  return (
    <div className="spectra-glass-card generated-preview">
      <div className="ai-panel-header">
        <div>
          <h2>Generated Playbook Preview</h2>
          <p>AI-generated automation blueprint ready for backend creation.</p>
        </div>

        <span className="generated-badge">
          <Bot size={14} />
          94% Confidence
        </span>
      </div>

      <div className="generated-preview-main">
        <div>
          <span className="category">{playbook.category}</span>

          <h3>{playbook.name}</h3>

          <p>{playbook.description}</p>
        </div>

        <div className="generated-stat-grid">
          <div>
            <GitBranch size={18} />
            <span>Workflow</span>
            <b>{steps.length} Steps</b>
          </div>

          <div>
            <Clock size={18} />
            <span>Runtime</span>
            <b>45–90 seconds</b>
          </div>

          <div>
            <Gauge size={18} />
            <span>Risk</span>
            <b>{playbook.severity}</b>
          </div>

          <div>
            <ShieldCheck size={18} />
            <span>Validation</span>
            <b>Passed</b>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          borderRadius: "14px",
          background: "rgba(0, 170, 255, 0.07)",
          border: "1px solid rgba(0, 170, 255, 0.14)",
          color: "#bdeaff",
          lineHeight: "1.6",
        }}
      >
        <b style={{ color: "#00ffaa" }}>AI Summary:</b> {generated.summary}
      </div>

      {createdPlaybook && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px",
            borderRadius: "14px",
            background: "rgba(0,255,170,0.08)",
            border: "1px solid rgba(0,255,170,0.16)",
            color: "#00ffaa",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={17} />
          Saved to PostgreSQL as Draft Playbook
        </div>
      )}

      <div className="generated-actions">
        <button
          className="primary-btn"
          onClick={onCreate}
          disabled={creating || !!createdPlaybook}
        >
          <Activity size={16} />
          {creating
            ? "Creating..."
            : createdPlaybook
            ? "Created"
            : "Create Backend Playbook"}
        </button>

        {createdPlaybook ? (
          <button className="secondary-btn" onClick={onOpenPlaybooks}>
            <ExternalLink size={16} />
            Open in Playbooks
          </button>
        ) : (
          <button className="secondary-btn">Edit Workflow</button>
        )}
      </div>
    </div>
  );
}