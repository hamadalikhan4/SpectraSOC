import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  GitBranch,
  Loader2,
  PlayCircle,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Workflow,
  XCircle,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function statusClass(status = "") {
  const value = String(status).toLowerCase();

  if (value.includes("complete") || value.includes("success")) return "success";
  if (value.includes("fail") || value.includes("error")) return "failed";
  if (value.includes("running") || value.includes("progress")) return "running";
  if (value.includes("queued") || value.includes("waiting")) return "queued";

  return "info";
}

function normalizeStep(step = {}, index = 0) {
  return {
    id: step.id || step.step_id || `step-${index + 1}`,
    order: step.step_order ?? step.order ?? index + 1,
    name: step.name || step.step_name || `Step ${index + 1}`,
    type: step.step_type || step.type || "Action",
    status: step.status || "Waiting",
    connector:
      step.connector_name ||
      step.connector ||
      step.output_payload?.connector ||
      "SOAR Engine",
    action:
      step.action_key ||
      step.action ||
      step.output_payload?.action ||
      "automation.action",
    duration_ms: step.duration_ms || 0,
    started_at: step.started_at || "",
    completed_at: step.completed_at || "",
    error_message: step.error_message || "",
    logs: Array.isArray(step.logs) ? step.logs : [],
    raw: step,
  };
}

function normalizeExecution(item = {}) {
  const steps = Array.isArray(item.steps)
    ? item.steps.map(normalizeStep)
    : Array.isArray(item.execution_steps)
      ? item.execution_steps.map(normalizeStep)
      : [];

  return {
    backend_id: item.id || item.backend_id || item.execution_id || "",
    execution_id: item.execution_id || item.id || "SOAR-EXEC-DEMO",
    playbook_id: item.playbook_id || "",
    playbook_name: item.playbook_name || item.playbook || "Incident Response Playbook",
    status: item.status || "Running",
    severity: item.severity || "High",
    trigger_source: item.trigger_source || "Incident Case",
    progress: Number(item.progress ?? 68),
    runtime_seconds: Number(item.runtime_seconds ?? 148),
    started_by: item.started_by || "SOAR Engine",
    incident_id: item.incident_id || "",
    started_at: item.started_at || item.created_at || new Date().toISOString(),
    completed_at: item.completed_at || "",
    error_message: item.error_message || "",
    steps,
    raw: item,
  };
}

function buildDemoExecution(incident = {}) {
  const linkedId = incident.linked_soar_execution || "SOAR-EXEC-DEMO";

  return normalizeExecution({
    id: linkedId,
    execution_id: linkedId,
    playbook_name:
      incident.severity === "Critical"
        ? "Ransomware Initial Response"
        : "Phishing / IOC Investigation",
    status: incident.status === "Resolved" ? "Completed" : "Running",
    severity: incident.severity || "High",
    trigger_source: incident.source || "Incident Command Center",
    progress: incident.status === "Resolved" ? 100 : 72,
    runtime_seconds: 210,
    started_by: "Incident Case Binding",
    incident_id: incident.id,
    started_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    completed_at:
      incident.status === "Resolved"
        ? new Date(Date.now() - 1000 * 60 * 12).toISOString()
        : "",
    steps: [
      {
        id: "soar-step-1",
        step_order: 1,
        name: "Parse Incident Context",
        step_type: "Trigger",
        status: "Completed",
        connector_name: "SOAR Engine",
        action_key: "incident.parse",
        duration_ms: 820,
        completed_at: new Date(Date.now() - 1000 * 60 * 39).toISOString(),
      },
      {
        id: "soar-step-2",
        step_order: 2,
        name: "Enrich Indicators",
        step_type: "Enrichment",
        status: "Completed",
        connector_name: "VirusTotal / AbuseIPDB",
        action_key: "ioc.enrich",
        duration_ms: 2300,
        completed_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: "soar-step-3",
        step_order: 3,
        name: "Correlate SIEM Events",
        step_type: "Investigation",
        status: "Completed",
        connector_name: "SIEM",
        action_key: "siem.search",
        duration_ms: 3100,
        completed_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      },
      {
        id: "soar-step-4",
        step_order: 4,
        name: "Approval Gate",
        step_type: "Approval",
        status: "Pending",
        connector_name: "SOC Manager",
        action_key: "approval.request",
        duration_ms: 0,
      },
      {
        id: "soar-step-5",
        step_order: 5,
        name: "Containment Action",
        step_type: "Response",
        status: "Waiting",
        connector_name: "EDR / Firewall",
        action_key: "containment.execute",
        duration_ms: 0,
      },
    ],
  });
}

function exportSOARCaseSummary(incident, execution) {
  const payload = {
    generated_at: new Date().toISOString(),
    incident: {
      id: incident?.id,
      title: incident?.title,
      severity: incident?.severity,
      status: incident?.status,
      risk_score: incident?.risk_score,
    },
    linked_soar_execution: execution,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident?.id || "incident"}-linked-soar-summary.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function SOARMetric({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`linked-soar-metric ${tone}`}>
      <Icon size={17} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function LinkedSOARPanel({ incident }) {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const linkedExecutionId = incident?.linked_soar_execution || "";

  const loadExecution = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!linkedExecutionId) {
        setExecution(null);
        return;
      }

      const executions = await SOAR_API.getExecutions({ limit: 100 });

      const list = Array.isArray(executions)
        ? executions
        : Array.isArray(executions?.items)
          ? executions.items
          : Array.isArray(executions?.executions)
            ? executions.executions
            : [];

      const matched = list.find((item) => {
        const normalized = normalizeExecution(item);

        return (
          normalized.execution_id === linkedExecutionId ||
          normalized.backend_id === linkedExecutionId ||
          normalized.incident_id === incident?.id
        );
      });

      if (matched) {
        setExecution(normalizeExecution(matched));
      } else {
        setExecution(buildDemoExecution(incident));
        setMessage(
          "Using demo SOAR binding because no matching backend execution was found."
        );
      }
    } catch (err) {
      console.error(err);
      setExecution(buildDemoExecution(incident));
      setMessage("Using demo SOAR binding because backend SOAR lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedExecutionId, incident?.id]);

  const stepMetrics = useMemo(() => {
    const steps = execution?.steps || [];

    return {
      total: steps.length,
      completed: steps.filter((step) =>
        ["completed", "success"].includes(String(step.status).toLowerCase())
      ).length,
      failed: steps.filter((step) =>
        String(step.status).toLowerCase().includes("fail")
      ).length,
      pending: steps.filter((step) =>
        ["pending", "waiting", "queued"].includes(
          String(step.status).toLowerCase()
        )
      ).length,
    };
  }, [execution]);

  const connectorSummary = useMemo(() => {
    const map = new Map();

    (execution?.steps || []).forEach((step) => {
      const key = step.connector || "SOAR Engine";

      if (!map.has(key)) {
        map.set(key, {
          connector: key,
          total: 0,
          completed: 0,
          failed: 0,
        });
      }

      const item = map.get(key);
      item.total += 1;

      if (statusClass(step.status) === "success") item.completed += 1;
      if (statusClass(step.status) === "failed") item.failed += 1;
    });

    return Array.from(map.values());
  }, [execution]);

  const updateLocalProgress = (mode) => {
    setExecution((prev) => {
      if (!prev) return prev;

      if (mode === "fail") {
        const updatedSteps = prev.steps.map((step, index) =>
          index === prev.steps.findIndex((item) => statusClass(item.status) !== "success")
            ? {
                ...step,
                status: "Failed",
                error_message: "Simulated failure from incident case workspace.",
              }
            : step
        );

        return {
          ...prev,
          status: "Failed",
          error_message: "Simulated failure from incident case workspace.",
          steps: updatedSteps,
        };
      }

      if (mode === "retry") {
        const updatedSteps = prev.steps.map((step) =>
          statusClass(step.status) === "failed"
            ? {
                ...step,
                status: "Running",
                error_message: "",
              }
            : step
        );

        return {
          ...prev,
          status: "Running",
          error_message: "",
          steps: updatedSteps,
        };
      }

      const nextProgress = Math.min(100, Number(prev.progress || 0) + 12);
      const currentIndex = prev.steps.findIndex(
        (step) => statusClass(step.status) !== "success"
      );

      const updatedSteps = prev.steps.map((step, index) => {
        if (index < currentIndex) return step;

        if (index === currentIndex) {
          return {
            ...step,
            status: nextProgress >= 100 ? "Completed" : "Running",
            completed_at:
              nextProgress >= 100 ? new Date().toISOString() : step.completed_at,
          };
        }

        return step;
      });

      return {
        ...prev,
        progress: nextProgress,
        status: nextProgress >= 100 ? "Completed" : "Running",
        completed_at: nextProgress >= 100 ? new Date().toISOString() : "",
        steps: updatedSteps,
      };
    });
  };

  const simulateProgress = async () => {
    if (!execution) return;

    try {
      setActionLoading("progress");
      setError("");
      setMessage("");

      if (execution.backend_id && !String(execution.backend_id).startsWith("SOAR-EXEC-DEMO")) {
        const updated = await SOAR_API.simulateExecutionProgress(
          execution.backend_id
        );
        setExecution(normalizeExecution(updated));
      } else {
        updateLocalProgress("progress");
      }

      setMessage("SOAR execution progress simulated.");
    } catch (err) {
      console.error(err);
      updateLocalProgress("progress");
      setMessage("Backend simulation failed, updated local demo execution.");
    } finally {
      setActionLoading("");
    }
  };

  const simulateFailure = async () => {
    if (!execution) return;

    try {
      setActionLoading("failure");
      setError("");
      setMessage("");

      if (execution.backend_id && !String(execution.backend_id).startsWith("SOAR-EXEC-DEMO")) {
        const updated = await SOAR_API.simulateExecutionFailure(
          execution.backend_id
        );
        setExecution(normalizeExecution(updated));
      } else {
        updateLocalProgress("fail");
      }

      setMessage("SOAR execution failure simulated.");
    } catch (err) {
      console.error(err);
      updateLocalProgress("fail");
      setMessage("Backend failure simulation failed, updated local demo execution.");
    } finally {
      setActionLoading("");
    }
  };

  const retryFailedStep = async () => {
    if (!execution) return;

    try {
      setActionLoading("retry");
      setError("");
      setMessage("");

      const failedStep = execution.steps.find(
        (step) => statusClass(step.status) === "failed"
      );

      if (execution.backend_id && failedStep) {
        const updated = await SOAR_API.retryFailedExecutionStep(
          execution.backend_id,
          { step_id: failedStep.id }
        );
        setExecution(normalizeExecution(updated));
      } else {
        updateLocalProgress("retry");
      }

      setMessage("Failed SOAR step retried.");
    } catch (err) {
      console.error(err);
      updateLocalProgress("retry");
      setMessage("Backend retry failed, updated local demo execution.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="linked-soar-loading">
        <Loader2 size={22} />
        <h3>Loading linked SOAR execution...</h3>
        <p>Checking SOAR execution context for this incident.</p>
      </div>
    );
  }

  if (!linkedExecutionId) {
    return (
      <div className="linked-soar-empty">
        <Workflow size={30} />
        <h3>No SOAR execution linked</h3>
        <p>
          This incident does not currently have a linked SOAR execution. Later
          we can add “Start Playbook from Incident” here.
        </p>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="linked-soar-empty">
        <AlertTriangle size={30} />
        <h3>SOAR execution not available</h3>
        <p>Could not load linked execution details.</p>
      </div>
    );
  }

  return (
    <div className="linked-soar-panel">
      <div className="linked-soar-header">
        <div>
          <span className="hero-chip">
            <Workflow size={15} />
            Linked SOAR Execution
          </span>

          <h2>{execution.playbook_name}</h2>

          <p>
            Incident-bound automation context showing playbook execution,
            connector actions, approval gates, progress, and step-level response
            output.
          </p>
        </div>

        <div className="linked-soar-actions">
          <button className="secondary-btn" onClick={loadExecution}>
            <RefreshCcw size={16} />
            Refresh
          </button>

          <button
            className="secondary-btn"
            onClick={simulateProgress}
            disabled={Boolean(actionLoading)}
          >
            {actionLoading === "progress" ? (
              <Loader2 size={16} />
            ) : (
              <PlayCircle size={16} />
            )}
            Simulate Step
          </button>

          <button
            className="secondary-btn"
            onClick={retryFailedStep}
            disabled={Boolean(actionLoading)}
          >
            {actionLoading === "retry" ? (
              <Loader2 size={16} />
            ) : (
              <RotateCcw size={16} />
            )}
            Retry Failed
          </button>

          <button
            className="secondary-btn danger-btn"
            onClick={simulateFailure}
            disabled={Boolean(actionLoading)}
          >
            {actionLoading === "failure" ? (
              <Loader2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            Simulate Failure
          </button>

          <button
            className="primary-btn"
            onClick={() => exportSOARCaseSummary(incident, execution)}
          >
            <Download size={16} />
            Export Summary
          </button>
        </div>
      </div>

      {message && (
        <div className="linked-soar-message">
          <Sparkles size={16} />
          {message}
        </div>
      )}

      {error && (
        <div className="linked-soar-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="linked-soar-metrics-grid">
        <SOARMetric
          icon={Activity}
          label="Execution Status"
          value={execution.status}
          tone={statusClass(execution.status)}
        />

        <SOARMetric
          icon={GitBranch}
          label="Total Steps"
          value={stepMetrics.total}
          tone="blue"
        />

        <SOARMetric
          icon={CheckCircle2}
          label="Completed"
          value={stepMetrics.completed}
          tone="green"
        />

        <SOARMetric
          icon={AlertTriangle}
          label="Pending"
          value={stepMetrics.pending}
          tone="yellow"
        />

        <SOARMetric
          icon={XCircle}
          label="Failed"
          value={stepMetrics.failed}
          tone="red"
        />
      </div>

      <div className="linked-soar-progress-card">
        <div className="linked-soar-progress-head">
          <div>
            <span>Execution ID</span>
            <b>{execution.execution_id}</b>
          </div>

          <strong>{execution.progress}%</strong>
        </div>

        <div className="linked-soar-progress-bar">
          <i style={{ width: `${Math.min(execution.progress, 100)}%` }} />
        </div>

        <div className="linked-soar-exec-meta">
          <span>Started by: {execution.started_by}</span>
          <span>Trigger: {execution.trigger_source}</span>
          <span>Started: {formatTime(execution.started_at)}</span>
          <span>Runtime: {execution.runtime_seconds}s</span>
        </div>

        {execution.error_message && (
          <div className="linked-soar-error-inline">
            <AlertTriangle size={15} />
            {execution.error_message}
          </div>
        )}
      </div>

      <div className="linked-soar-grid">
        <div className="linked-soar-steps-card">
          <div className="linked-soar-section-title">
            <h3>Execution Steps</h3>
            <span>{execution.steps.length} steps</span>
          </div>

          <div className="linked-soar-step-list">
            {execution.steps.map((step) => (
              <div
                key={step.id}
                className={`linked-soar-step ${statusClass(step.status)}`}
              >
                <div className="linked-soar-step-icon">
                  {statusClass(step.status) === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : statusClass(step.status) === "failed" ? (
                    <XCircle size={16} />
                  ) : statusClass(step.status) === "running" ? (
                    <Loader2 size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                </div>

                <div>
                  <div className="linked-soar-step-title">
                    <h4>
                      {step.order}. {step.name}
                    </h4>
                    <span className={statusClass(step.status)}>
                      {step.status}
                    </span>
                  </div>

                  <p>
                    {step.type} action via {step.connector}
                  </p>

                  <div className="linked-soar-step-meta">
                    <span>{step.action}</span>
                    <span>{step.duration_ms}ms</span>
                    {step.completed_at && (
                      <span>Completed: {formatTime(step.completed_at)}</span>
                    )}
                  </div>

                  {step.error_message && (
                    <div className="linked-soar-step-error">
                      <AlertTriangle size={13} />
                      {step.error_message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="linked-soar-side-stack">
          <div className="linked-soar-connectors-card">
            <div className="linked-soar-section-title">
              <h3>Connector Actions</h3>
              <span>{connectorSummary.length} connectors</span>
            </div>

            <div className="linked-soar-connector-list">
              {connectorSummary.map((item) => (
                <div key={item.connector}>
                  <ShieldCheck size={16} />

                  <div>
                    <b>{item.connector}</b>
                    <span>
                      {item.completed}/{item.total} completed
                      {item.failed ? ` • ${item.failed} failed` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="linked-soar-approval-card">
            <div className="linked-soar-section-title">
              <h3>Approval State</h3>
              <span>Case response gate</span>
            </div>

            <div className="linked-soar-approval-box">
              <AlertTriangle size={18} />

              <div>
                <b>Manual Approval Required</b>
                <p>
                  Destructive or containment actions should be reviewed before
                  execution. Approval gates are visible in the step list.
                </p>
              </div>
            </div>
          </div>

          <div className="linked-soar-ai-card">
            <Sparkles size={18} />

            <div>
              <b>AI SOAR Insight</b>
              <p>
                This execution is suitable for demonstrating the full SOC flow:
                incident creation → evidence → timeline → automation → report.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}