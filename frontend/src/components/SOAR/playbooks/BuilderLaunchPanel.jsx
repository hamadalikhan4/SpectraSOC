import {
  Activity,
  Bot,
  Copy,
  GitBranch,
  Loader2,
  Play,
  Save,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";

function extractTemplateMeta(playbook = {}) {
  const description = playbook.description || "";

  return {
    maturity:
      description.match(/Maturity:\s*(.*)/)?.[1]?.trim() ||
      playbook.maturity ||
      "Custom Workflow",
    riskScore:
      description.match(/Risk Score:\s*(.*)/)?.[1]?.trim() ||
      playbook.risk_score ||
      "N/A",
    approval:
      description.match(/Approval Required:\s*(.*)/)?.[1]?.trim() ||
      "Unknown",
    demoReady:
      description.match(/Demo Ready:\s*(.*)/)?.[1]?.trim() ||
      "Unknown",
    mitre:
      description.match(/MITRE:\s*(.*)/)?.[1]?.trim() ||
      "Not mapped",
  };
}

export default function BuilderLaunchPanel({
  playbook,
  saving,
  running,
  cloning,
  onSaveDraft,
  onRun,
  onSaveAndRun,
  onClone,
}) {
  const meta = extractTemplateMeta(playbook);
  const stepCount = playbook?.steps?.length || 0;

  return (
    <div className="builder-launch-panel spectra-glass-card">
      <div className="builder-launch-main">
        <div>
          <span className="hero-chip">
            <Sparkles size={15} />
            Builder Launch Panel
          </span>

          <h2>{playbook?.name || "Untitled SOAR Playbook"}</h2>

          <p>
            Review trigger context, template quality, workflow maturity, and run
            actions before launching this automation.
          </p>
        </div>

        <div className="builder-launch-actions">
          <button className="secondary-btn" onClick={onSaveDraft} disabled={saving}>
            {saving ? <Loader2 size={16} /> : <Save size={16} />}
            Save Draft
          </button>

          <button className="secondary-btn" onClick={onClone} disabled={cloning}>
            {cloning ? <Loader2 size={16} /> : <Copy size={16} />}
            Clone
          </button>

          <button className="primary-btn" onClick={onSaveAndRun} disabled={saving || running}>
            {saving || running ? <Loader2 size={16} /> : <Zap size={16} />}
            Save & Run
          </button>

          <button className="primary-btn" onClick={onRun} disabled={running}>
            {running ? <Loader2 size={16} /> : <Play size={16} />}
            Run Playbook
          </button>
        </div>
      </div>

      <div className="builder-launch-grid">
        <div>
          <GitBranch size={16} />
          <span>Version</span>
          <b>v{playbook?.version || "1.0"}</b>
        </div>

        <div>
          <Activity size={16} />
          <span>Trigger</span>
          <b>{playbook?.trigger_source || playbook?.trigger_type || "Manual"}</b>
        </div>

        <div>
          <ShieldCheck size={16} />
          <span>Severity</span>
          <b>{playbook?.severity || "Medium"}</b>
        </div>

        <div>
          <Bot size={16} />
          <span>Steps</span>
          <b>{stepCount}</b>
        </div>

        <div>
          <Tag size={16} />
          <span>Maturity</span>
          <b>{meta.maturity}</b>
        </div>

        <div>
          <Activity size={16} />
          <span>Risk Score</span>
          <b>{meta.riskScore}</b>
        </div>

        <div>
          <ShieldCheck size={16} />
          <span>Approval</span>
          <b>{meta.approval}</b>
        </div>

        <div>
          <Sparkles size={16} />
          <span>Demo Ready</span>
          <b>{meta.demoReady}</b>
        </div>
      </div>

      <div className="builder-mitre-box">
        <span>MITRE ATT&CK Mapping</span>
        <p>{meta.mitre}</p>
      </div>
    </div>
  );
}