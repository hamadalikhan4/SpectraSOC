import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  Gauge,
  Loader2,
  PlayCircle,
  RefreshCcw,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import {
  buildConnectorExecutionPlan,
  executeConnectorStep,
  getConnectorMode,
  setConnectorMode,
  summarizeConnectorResults,
} from "./connectorExecutionRegistry";

function statusClass(status = "") {
  const value = status.toLowerCase();

  if (value.includes("completed")) return "success";
  if (value.includes("blocked")) return "warning";
  if (value.includes("skipped")) return "info";
  if (value.includes("failed")) return "danger";

  return "info";
}

function formatTime(value) {
  if (!value) return "Unknown";

  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return value;
  }
}

function downloadResults(results = [], playbookName = "soar-playbook") {
  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${playbookName
    .toLowerCase()
    .replaceAll(" ", "-")}-connector-results.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function ConnectorExecutionLayer({
  playbook,
  approvalState,
  onAudit,
  onResult,
}) {
  const [mode, setMode] = useState(getConnectorMode());
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [activeStep, setActiveStep] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const plan = useMemo(() => {
    return buildConnectorExecutionPlan(playbook?.steps || [], approvalState);
  }, [playbook, approvalState]);

  const health = useMemo(() => {
    const connectors = new Map();

    plan.forEach((item) => {
      connectors.set(item.connector.name, item.connector);
    });

    const list = [...connectors.values()];

    return {
      total: list.length,
      ready: list.filter((item) => item.health === "Ready").length,
      approval: list.filter((item) => item.health === "Approval Required").length,
      mockOnly: list.filter((item) => item.health === "Mock Only").length,
    };
  }, [plan]);

  const summary = useMemo(() => summarizeConnectorResults(results), [results]);

  const changeMode = (nextMode) => {
    setConnectorMode(nextMode);
    setMode(nextMode);
  };

  const runConnectorSimulation = async () => {
    try {
      setRunning(true);
      setResults([]);
      setSelectedResult(null);

      const output = [];

      for (const item of plan) {
        setActiveStep(item.step.step_order);

        const result = await executeConnectorStep(item.step, {
          mode,
          approvalState,
          playbook,
        });

        output.push(result);
        setResults((prev) => [result, ...prev]);
        setSelectedResult(result);

        if (onAudit) {
          onAudit({
            action: `Connector Step ${result.status}`,
            status:
              result.status === "Completed"
                ? "Success"
                : result.status === "Blocked"
                ? "Blocked"
                : result.status === "Skipped"
                ? "Info"
                : "Failed",
            severity: result.severity || "Medium",
            source: "Connector Execution Layer",
            details: {
              step_order: result.step_order,
              step_name: result.step_name,
              action_key: result.action_key,
              connector_name: result.connector_name,
              mode: result.mode,
              duration_ms: result.duration_ms,
              output_payload: result.output_payload,
            },
          });
        }
      }

      const finalSummary = summarizeConnectorResults(output);

      if (onResult) {
        onResult({
          mode,
          ...finalSummary,
        });
      }
    } finally {
      setRunning(false);
      setActiveStep(null);
    }
  };

  return (
    <div className="connector-execution-layer spectra-glass-card">
      <div className="connector-layer-header">
        <div>
          <span className="hero-chip">
            <Cpu size={15} />
            Connector Execution Layer
          </span>

          <h2>Mock / Real Connector Execution</h2>

          <p>
            Execute playbook steps through a connector registry. Mock mode
            produces realistic provider responses. Real mode is safely staged as
            a placeholder until live credentials are configured.
          </p>
        </div>

        <div className="connector-layer-actions">
          <div className="mode-switch">
            <button
              className={mode === "mock" ? "active" : ""}
              onClick={() => changeMode("mock")}
              disabled={running}
            >
              Mock
            </button>

            <button
              className={mode === "real" ? "active" : ""}
              onClick={() => changeMode("real")}
              disabled={running}
            >
              Real
            </button>
          </div>

          <button
            className="secondary-btn"
            onClick={() => {
              setResults([]);
              setSelectedResult(null);
            }}
            disabled={running}
          >
            <RefreshCcw size={16} />
            Clear
          </button>

          <button
            className="secondary-btn"
            onClick={() => downloadResults(results, playbook?.name)}
            disabled={results.length === 0}
          >
            <Download size={16} />
            Export
          </button>

          <button
            className="primary-btn"
            onClick={runConnectorSimulation}
            disabled={running || plan.length === 0}
          >
            {running ? <Loader2 size={16} /> : <PlayCircle size={16} />}
            {running ? "Executing..." : "Run Connector Test"}
          </button>
        </div>
      </div>

      {mode === "real" && (
        <div className="real-mode-warning">
          <AlertTriangle size={16} />
          Real mode is currently a safe placeholder. No external API calls will
          be made until connector credentials and request handlers are added.
        </div>
      )}

      <div className="connector-health-grid">
        <div>
          <Gauge size={16} />
          <span>Total Connectors</span>
          <b>{health.total}</b>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>Ready</span>
          <b>{health.ready}</b>
        </div>

        <div>
          <ShieldAlert size={16} />
          <span>Approval Required</span>
          <b>{health.approval}</b>
        </div>

        <div>
          <SlidersHorizontal size={16} />
          <span>Mock Only</span>
          <b>{health.mockOnly}</b>
        </div>
      </div>

      <div className="connector-runtime-grid">
        <div className="connector-plan-card">
          <div className="connector-section-title">
            <h3>Execution Plan</h3>
            <span>{plan.length} steps</span>
          </div>

          <div className="connector-plan-list">
            {plan.map((item) => (
              <div
                key={item.step.step_order}
                className={`connector-plan-row ${
                  activeStep === item.step.step_order ? "active" : ""
                } ${item.blocked ? "blocked" : ""}`}
              >
                <div className="connector-plan-icon">
                  {item.blocked ? (
                    <AlertTriangle size={15} />
                  ) : (
                    <Activity size={15} />
                  )}
                </div>

                <div>
                  <h4>{item.step.name}</h4>

                  <p>{item.step.action_key}</p>

                  <div className="connector-plan-meta">
                    <span>{item.connector.name}</span>
                    <span>{item.connector.type}</span>
                    <span>{item.connector.health}</span>
                    {item.dangerous && <span>High Risk</span>}
                    {item.approved && <span>Approved</span>}
                    {item.blocked && <span>Blocked</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="connector-results-card">
          <div className="connector-section-title">
            <h3>Execution Results</h3>
            <span>
              {summary.completed} completed · {summary.blocked} blocked ·{" "}
              {summary.skipped} skipped
            </span>
          </div>

          {results.length === 0 ? (
            <div className="connector-empty">
              <Cpu size={22} />
              <b>No connector results yet</b>
              <p>
                Run connector test to generate realistic mock or staged real
                execution results.
              </p>
            </div>
          ) : (
            <div className="connector-result-list">
              {results.map((result) => (
                <button
                  key={`${result.step_order}-${result.completed_at}`}
                  className={`connector-result-row ${statusClass(result.status)}`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div>
                    <h4>{result.step_name}</h4>
                    <p>
                      {result.connector_name} · {result.status} ·{" "}
                      {formatTime(result.completed_at)}
                    </p>
                  </div>

                  <span>{result.duration_ms}ms</span>
                </button>
              ))}
            </div>
          )}

          {selectedResult && (
            <div className="connector-result-detail">
              <div className="connector-detail-title">
                <h3>{selectedResult.step_name}</h3>
                <span className={statusClass(selectedResult.status)}>
                  {selectedResult.status}
                </span>
              </div>

              <div className="connector-detail-meta">
                <span>{selectedResult.connector_name}</span>
                <span>{selectedResult.connector_type}</span>
                <span>{selectedResult.mode}</span>
                <span>{selectedResult.duration_ms}ms</span>
              </div>

              <pre>{JSON.stringify(selectedResult.output_payload, null, 2)}</pre>

              <div className="connector-log-lines">
                {selectedResult.logs?.map((line) => (
                  <span key={line}>
                    {selectedResult.status === "Blocked" ? (
                      <XCircle size={12} />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    {line}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}