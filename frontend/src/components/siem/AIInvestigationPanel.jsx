import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Crosshair,
  FileText,
} from "lucide-react";

export default function AIInvestigationPanel({ selectedCase }) {
  if (!selectedCase) {
    return (
      <div className="siem-card">
        <h3>AI Investigation</h3>
        <div className="result">
          Select a correlation case to generate AI investigation context.
        </div>
      </div>
    );
  }

  const tactics = selectedCase.mitre_tactics || [];
  const events = selectedCase.correlated_events || [];

  return (
    <div className="siem-card ai-investigation-panel">
      <div className="siem-card-head">
        <div>
          <h3>SpectraSOC Investigation</h3>
          <p className="subtitle">
            AI-assisted explanation, business impact, and response guidance.
          </p>
        </div>

        <div className="ai-confidence">
          <Brain size={18} />
          {selectedCase.risk_score >= 85 ? "96%" : "82%"}
        </div>
      </div>

      <div className="ai-summary-box">
        <Brain size={22} />
        <p>{selectedCase.ai_summary}</p>
      </div>

      <div className="ai-investigation-grid">
        <div className="ai-mini-card">
          <AlertTriangle size={20} />
          <span>Risk Score</span>
          <strong>{selectedCase.risk_score}/100</strong>
        </div>

        <div className="ai-mini-card">
          <Crosshair size={20} />
          <span>Observed Events</span>
          <strong>{events.length}</strong>
        </div>

        <div className="ai-mini-card">
          <ShieldCheck size={20} />
          <span>MITRE Tactics</span>
          <strong>{tactics.length}</strong>
        </div>
      </div>

      <div className="result">
        <h4>Business Impact</h4>
        <p>
          This correlated activity may indicate coordinated attacker behavior
          against internal assets. If the activity involves authentication,
          command execution, or abnormal behavior, it may lead to credential
          compromise, unauthorized access, persistence, or lateral movement.
        </p>

        <h4>Recommended Response</h4>
        <ul>
          <li>Block or temporarily restrict the source IP.</li>
          <li>Review authentication activity for the targeted account.</li>
          <li>Check whether the source IP appears in threat intelligence.</li>
          <li>Inspect related host logs for command execution or persistence.</li>
          <li>Create an incident if repeated or high-risk behavior is confirmed.</li>
        </ul>

        <h4>Forensic Actions</h4>
        <ul>
          <li>Preserve related SIEM logs and raw evidence.</li>
          <li>Collect process, network, and authentication artifacts from the host.</li>
          <li>Calculate evidence hashes for chain of custody.</li>
        </ul>
      </div>

      <div className="ai-action-row">
        <button>
          <FileText size={15} />
          Generate Report
        </button>

        <button>
          <ShieldCheck size={15} />
          Create Incident
        </button>
      </div>
    </div>
  );
}