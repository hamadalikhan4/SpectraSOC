import {
  Bot,
  CheckCircle2,
  Cpu,
  GitBranch,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export default function AIValidationPanel({
  validationFindings = [],
  mitreMappings = [],
  connectorRequirements = [],
  summary = "",
}) {
  return (
    <div className="ai-validation-stack">
      <div className="spectra-glass-card ai-validation-panel">
        <div className="panel-title">
          <ShieldCheck size={18} />
          AI Safety Validation
        </div>

        <p className="ai-subtitle">
          SpectraAI checks automation safety, connector availability, and
          enterprise readiness before playbook creation.
        </p>

        <div className="validation-list">
          {validationFindings.map((item) => (
            <div className="validation-item" key={item.title}>
              <div
                className={`validation-icon ${
                  item.status === "Warning" ? "warning" : "passed"
                }`}
              >
                {item.status === "Warning" ? (
                  <TriangleAlert size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
              </div>

              <div>
                <h4>{item.title}</h4>
                <span>{item.status}</span>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="spectra-glass-card ai-mitre-panel">
        <div className="panel-title">
          <GitBranch size={18} />
          MITRE ATT&CK Mapping
        </div>

        <div className="mitre-list">
          {mitreMappings.length === 0 ? (
            <p className="subtitle">No MITRE techniques generated yet.</p>
          ) : (
            mitreMappings.map((item) => (
              <div className="mitre-item" key={item.technique}>
                <b>{item.technique}</b>
                <span>{item.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="spectra-glass-card ai-connectors-panel">
        <div className="panel-title">
          <Cpu size={18} />
          Required Connectors
        </div>

        <div className="required-connector-list">
          {connectorRequirements.length === 0 ? (
            <p className="subtitle">No connector requirements generated yet.</p>
          ) : (
            connectorRequirements.map((item) => (
              <div className="required-connector" key={item}>
                <span />
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="spectra-glass-card ai-builder-copilot">
        <div className="panel-title">
          <Bot size={18} />
          SpectraAI Copilot
        </div>

        <div className="copilot-message">
          <Sparkles size={17} />
          <p>
            {summary ||
              "This workflow is ready for analyst review before production deployment."}
          </p>
        </div>

        <button className="secondary-btn full-width-btn">
          Ask Follow-up
        </button>
      </div>
    </div>
  );
}