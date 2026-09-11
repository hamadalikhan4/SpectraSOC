import {
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  RefreshCcw,
  ShieldAlert,
  TestTube2,
  XCircle,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function statusClass(status = "waiting") {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function normalizeSteps(execution) {
  const rawSteps =
    execution?.steps ||
    execution?.execution_steps ||
    execution?.step_results ||
    [];

  if (!Array.isArray(rawSteps)) return [];

  return rawSteps
    .slice()
    .sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))
    .map((step, index) => {
      const input = step.input_payload || {};
      const output = step.output_payload || {};

      return {
        id: step.id || index + 1,
        step_order: step.step_order || index + 1,
        name: step.name || step.step_name || `Execution Step ${index + 1}`,
        status: step.status || "Waiting",
        action_key: step.action_key || input.action_key || "automation.step",
        connector_name:
          step.connector_name || input.connector_name || "SOAR Engine",
        started_at: step.started_at,
        completed_at: step.completed_at,
        duration_ms: step.duration_ms,
        message:
          output.message ||
          step.message ||
          step.result_message ||
          step.description ||
          "Waiting for execution update.",
        logs: step.logs || [],
      };
    });
}

export default function ExecutionRunPanel({
  playbook,
  execution,
  running,
  simulating,
  refreshing,
  onRun,
  onSimulate,
  onRefreshExecution,
}) {
  const steps = normalizeSteps(execution);

  const progress = execution?.progress || 0;

  return (
    <div className="spectra-glass-card execution-run-panel">
      <div className="execution-run-header">
        <div>
          <span className="hero-chip">
            <Activity size={14} />
            Execution Engine
          </span>

          <h2>Live Playbook Execution</h2>

          <p>
            Run this playbook, simulate step-by-step progress, and inspect live
            execution state directly from the SOAR designer.
          </p>
        </div>

        <div className="hero-actions">
          <button className="primary-btn" onClick={onRun} disabled={running}>
            {running ? <Loader2 size={16} /> : <Play size={16} />}
            {running ? "Starting..." : "Run Playbook"}
          </button>

          <button
            className="secondary-btn"
            onClick={onSimulate}
            disabled={simulating || !execution}
          >
            {simulating ? <Loader2 size={16} /> : <TestTube2 size={16} />}
            Simulate Step
          </button>

          <button
            className="secondary-btn"
            onClick={onRefreshExecution}
            disabled={refreshing || !execution}
          >
            {refreshing ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
            Refresh
          </button>
        </div>
      </div>

      {!execution ? (
        <div className="execution-empty-state">
          <ShieldAlert size={22} />

          <div>
            <h3>No execution started yet</h3>
            <p>
              Click <b>Run Playbook</b> to create a backend execution from{" "}
              <b>{playbook?.name}</b>.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="execution-progress-block">
            <div className="execution-progress-top">
              <span>Execution Progress</span>
              <b>{progress}%</b>
            </div>

            <div className="execution-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="execution-run-grid">
            <div>
              <span>Status</span>
              <b className={`execution-status ${statusClass(execution.status)}`}>
                {execution.status || "Running"}
              </b>
            </div>

            <div>
              <span>Severity</span>
              <b>{execution.severity || playbook?.severity || "Medium"}</b>
            </div>

            <div>
              <span>Started</span>
              <b>{formatDate(execution.started_at || execution.created_at)}</b>
            </div>

            <div>
              <span>Started By</span>
              <b>{execution.started_by || "SOC Analyst"}</b>
            </div>
          </div>

          <div className="execution-step-timeline">
            {steps.length === 0 ? (
              <div className="execution-empty-state compact">
                <Clock size={18} />
                <p>No execution steps found yet.</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div className="execution-step-row" key={step.id}>
                  <div className={`step-dot ${statusClass(step.status)}`}>
                    {step.status?.toLowerCase() === "completed" ? (
                      <CheckCircle2 size={15} />
                    ) : step.status?.toLowerCase() === "failed" ? (
                      <XCircle size={15} />
                    ) : (
                      <Clock size={15} />
                    )}
                  </div>

                  <div className="step-line-content">
                    <div className="step-line-top">
                      <h4>
                        {index + 1}. {step.name}
                      </h4>

                      <span
                        className={`execution-status ${statusClass(
                          step.status
                        )}`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <p>{step.message}</p>

                    <div className="queue-meta">
                      <span>{step.connector_name}</span>
                      <span>{step.action_key}</span>
                      <span>
                        {step.duration_ms
                          ? `${step.duration_ms}ms`
                          : "Duration pending"}
                      </span>
                    </div>

                    {step.logs?.length > 0 && (
                      <div className="execution-step-logs">
                        {step.logs.slice(-2).map((log, logIndex) => (
                          <code key={`${step.id}-log-${logIndex}`}>{log}</code>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}