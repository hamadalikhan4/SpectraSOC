import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  PlayCircle,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  Square,
  TestTube2,
  X,
  XCircle,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

function formatDate(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function statusClass(status = "Queued") {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function normalizeSteps(execution) {
  const rawSteps = execution?.steps || [];

  if (!Array.isArray(rawSteps)) return [];

  return rawSteps
    .slice()
    .sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))
    .map((step, index) => {
      const input = step.input_payload || {};
      const output = step.output_payload || {};

      return {
        id: step.id || index + 1,
        order: step.step_order || index + 1,
        type: step.step_type || "Action",
        name: step.name || `Execution Step ${index + 1}`,
        status: step.status || "Waiting",
        connector: input.connector_name || output.connector_name || "SOAR Engine",
        actionKey: input.action_key || output.action_key || "automation.step",
        message:
          output.message ||
          step.error_message ||
          "Waiting for execution update.",
        errorMessage: step.error_message || "",
        startedAt: step.started_at,
        completedAt: step.completed_at,
        durationMs: step.duration_ms || 0,
        retryCount: step.retry_count || 0,
        logs: Array.isArray(step.logs) ? step.logs : [],
      };
    });
}

function normalizeExecution(item) {
  return {
    id: item.id,
    executionId: item.execution_id,
    playbookName: item.playbook_name || "Unknown Playbook",
    playbookId: item.playbook_id,
    status: item.status || "Queued",
    severity: item.severity || "Medium",
    progress: item.progress || 0,
    triggerSource: item.trigger_source || "Manual",
    startedBy: item.started_by || "SOAR Engine",
    startedAt: item.started_at || item.created_at,
    completedAt: item.completed_at,
    runtimeSeconds: item.runtime_seconds || 0,
    incidentId: item.incident_id,
    errorMessage: item.error_message,
    steps: normalizeSteps(item),
    raw: item,
  };
}

function extractLogTime(log) {
  if (!log || typeof log !== "string") return null;

  const match = log.match(/\[(.*?)\]/);
  return match?.[1] || null;
}

function buildAuditTrail(execution) {
  const events = [];

  const pushEvent = ({
    type = "info",
    title,
    description,
    time,
    actor = "SOAR Engine",
    meta = [],
  }) => {
    events.push({
      id: `${events.length + 1}-${title}`,
      type,
      title,
      description,
      time: time || execution.startedAt || new Date().toISOString(),
      actor,
      meta,
    });
  };

  pushEvent({
    type: "created",
    title: "Execution created",
    description: `${execution.playbookName} execution was created from ${execution.triggerSource}.`,
    time: execution.startedAt,
    actor: execution.startedBy,
    meta: [
      `Execution ID: ${execution.executionId}`,
      `Severity: ${execution.severity}`,
      `Status: ${execution.status}`,
    ],
  });

  execution.steps.forEach((step) => {
    if (step.startedAt) {
      pushEvent({
        type: "running",
        title: `Step started: ${step.name}`,
        description: `${step.actionKey} started using ${step.connector}.`,
        time: step.startedAt,
        actor: "SOAR Worker",
        meta: [`Step ${step.order}`, step.type, step.connector],
      });
    }

    if (step.status === "Completed") {
      pushEvent({
        type: "completed",
        title: `Step completed: ${step.name}`,
        description: step.message || "Step completed successfully.",
        time: step.completedAt,
        actor: "SOAR Worker",
        meta: [
          `Duration: ${step.durationMs || 0}ms`,
          `Retry Count: ${step.retryCount || 0}`,
        ],
      });
    }

    if (step.status === "Failed") {
      pushEvent({
        type: "failed",
        title: `Step failed: ${step.name}`,
        description:
          step.errorMessage ||
          step.message ||
          "Step failed during automation execution.",
        time: step.completedAt || step.startedAt,
        actor: "SOAR Worker",
        meta: [
          `Connector: ${step.connector}`,
          `Action: ${step.actionKey}`,
          `Retry Count: ${step.retryCount || 0}`,
        ],
      });
    }

    if (step.retryCount > 0) {
      pushEvent({
        type: "retry",
        title: `Retry attempted: ${step.name}`,
        description: `Failed step was retried ${step.retryCount} time(s).`,
        time: step.startedAt || step.completedAt,
        actor: execution.startedBy || "SOC Analyst",
        meta: [`Retry Count: ${step.retryCount}`, step.actionKey],
      });
    }

    step.logs?.forEach((log) => {
      const logTime = extractLogTime(log);

      pushEvent({
        type: log.toLowerCase().includes("error") ? "failed" : "log",
        title: "Worker log recorded",
        description: log,
        time: logTime || step.startedAt || execution.startedAt,
        actor: "Execution Logger",
        meta: [`Step: ${step.name}`],
      });
    });
  });

  if (execution.status === "Failed") {
    pushEvent({
      type: "failed",
      title: "Execution marked failed",
      description:
        execution.errorMessage ||
        "Execution stopped because one or more automation steps failed.",
      time: execution.completedAt || new Date().toISOString(),
      actor: "SOAR Engine",
      meta: [`Progress: ${execution.progress}%`],
    });
  }

  if (execution.status === "Completed") {
    pushEvent({
      type: "completed",
      title: "Execution completed",
      description: "All workflow steps completed successfully.",
      time: execution.completedAt || new Date().toISOString(),
      actor: "SOAR Engine",
      meta: [`Runtime: ${execution.runtimeSeconds}s`],
    });
  }

  if (execution.status === "Cancelled") {
    pushEvent({
      type: "cancelled",
      title: "Execution cancelled",
      description: "Execution was cancelled by analyst action.",
      time: execution.completedAt || new Date().toISOString(),
      actor: execution.startedBy || "SOC Analyst",
      meta: [`Progress: ${execution.progress}%`],
    });
  }

  return events.sort((a, b) => new Date(a.time) - new Date(b.time));
}

function buildExecutionReport(execution) {
  const auditTrail = buildAuditTrail(execution);
  const failedSteps = execution.steps.filter((step) => step.status === "Failed");
  const completedSteps = execution.steps.filter(
    (step) => step.status === "Completed"
  );
  const retriedSteps = execution.steps.filter((step) => step.retryCount > 0);

  return {
    report_type: "SOAR Execution Report",
    generated_at: new Date().toISOString(),
    platform: "SpectraSOC / SpectraSOC",
    summary: {
      execution_id: execution.executionId,
      playbook_name: execution.playbookName,
      status: execution.status,
      severity: execution.severity,
      progress: `${execution.progress || 0}%`,
      trigger_source: execution.triggerSource,
      started_by: execution.startedBy,
      started_at: execution.startedAt,
      completed_at: execution.completedAt,
      runtime_seconds: execution.runtimeSeconds,
      incident_id: execution.incidentId || "N/A",
      failed_reason: execution.errorMessage || "N/A",
    },
    statistics: {
      total_steps: execution.steps.length,
      completed_steps: completedSteps.length,
      failed_steps: failedSteps.length,
      retried_steps: retriedSteps.length,
      audit_events: auditTrail.length,
      total_logs: execution.steps.reduce(
        (sum, step) => sum + (step.logs?.length || 0),
        0
      ),
    },
    step_results: execution.steps.map((step) => ({
      order: step.order,
      name: step.name,
      type: step.type,
      status: step.status,
      connector: step.connector,
      action_key: step.actionKey,
      message: step.message,
      error_message: step.errorMessage || "N/A",
      retry_count: step.retryCount,
      duration_ms: step.durationMs,
      started_at: step.startedAt,
      completed_at: step.completedAt,
      logs: step.logs,
    })),
    audit_trail: auditTrail.map((event) => ({
      type: event.type,
      title: event.title,
      description: event.description,
      time: event.time,
      actor: event.actor,
      meta: event.meta,
    })),
  };
}

function buildAnalystSummary(execution) {
  const report = buildExecutionReport(execution);
  const failedSteps = report.step_results.filter((step) => step.status === "Failed");
  const retriedSteps = report.step_results.filter((step) => step.retry_count > 0);

  return [
    "SPECTRASOC / SpectraSOC - SOAR EXECUTION SUMMARY",
    "====================================================",
    "",
    `Execution ID: ${report.summary.execution_id}`,
    `Playbook: ${report.summary.playbook_name}`,
    `Status: ${report.summary.status}`,
    `Severity: ${report.summary.severity}`,
    `Progress: ${report.summary.progress}`,
    `Started By: ${report.summary.started_by}`,
    `Started At: ${formatDate(report.summary.started_at)}`,
    `Completed At: ${formatDate(report.summary.completed_at)}`,
    `Runtime: ${report.summary.runtime_seconds}s`,
    "",
    "EXECUTION RESULT",
    "----------------",
    failedSteps.length > 0
      ? `Execution failed due to ${failedSteps.length} failed step(s).`
      : report.summary.status === "Completed"
      ? "Execution completed successfully. All available workflow steps finished."
      : `Execution currently has status: ${report.summary.status}.`,
    report.summary.failed_reason !== "N/A"
      ? `Failed Reason: ${report.summary.failed_reason}`
      : "",
    "",
    "STEP STATISTICS",
    "---------------",
    `Total Steps: ${report.statistics.total_steps}`,
    `Completed Steps: ${report.statistics.completed_steps}`,
    `Failed Steps: ${report.statistics.failed_steps}`,
    `Retried Steps: ${report.statistics.retried_steps}`,
    `Audit Events: ${report.statistics.audit_events}`,
    `Total Logs: ${report.statistics.total_logs}`,
    "",
    "FAILED STEPS",
    "------------",
    failedSteps.length > 0
      ? failedSteps
          .map(
            (step) =>
              `Step ${step.order}: ${step.name} | Connector: ${step.connector} | Error: ${step.error_message}`
          )
          .join("\n")
      : "No failed steps recorded.",
    "",
    "RETRIED STEPS",
    "-------------",
    retriedSteps.length > 0
      ? retriedSteps
          .map(
            (step) =>
              `Step ${step.order}: ${step.name} | Retry Count: ${step.retry_count}`
          )
          .join("\n")
      : "No retry attempts recorded.",
    "",
    "RECOMMENDED ANALYST ACTIONS",
    "---------------------------",
    failedSteps.length > 0
      ? [
          "1. Review failed connector/action logs.",
          "2. Validate connector credentials and response status.",
          "3. Retry the failed step after confirming connector health.",
          "4. Escalate to SOC lead if failure repeats.",
        ].join("\n")
      : [
          "1. Review execution logs for completeness.",
          "2. Attach this report to the related incident if needed.",
          "3. Close or monitor the incident based on analyst judgement.",
        ].join("\n"),
    "",
    `Generated At: ${formatDate(report.generated_at)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="spectra-glass-card execution-kpi-card polished">
      <div className="execution-kpi-icon">
        <Icon size={18} />
      </div>

      <div className="execution-kpi-content">
        <span>{label}</span>
        <b>{value}</b>
        <small>{hint}</small>
      </div>
    </div>
  );
}

export default function ExecutionDashboard() {
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [failing, setFailing] = useState(false);
  const [retryingStepId, setRetryingStepId] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");

  const syncExecution = (normalized) => {
    setSelectedExecution(normalized);

    setExecutions((current) =>
      current.map((item) => (item.id === normalized.id ? normalized : item))
    );
  };

  const loadExecutions = async (options = {}) => {
    try {
      if (!options.silent) setLoading(true);

      setError("");

      const data = await SOAR_API.getExecutions({ limit: 100 });
      const normalized = Array.isArray(data) ? data.map(normalizeExecution) : [];

      setExecutions(normalized);

      setSelectedExecution((currentSelected) => {
        if (!currentSelected) return null;

        const updatedSelected = normalized.find(
          (item) => item.id === currentSelected.id
        );

        return updatedSelected || currentSelected;
      });
    } catch (err) {
      console.error(err);

      if (!options.silent) {
        setError("Failed to load SOAR executions from backend.");
      }
    } finally {
      if (!options.silent) setLoading(false);
    }
  };

  const refreshOneExecution = async (executionId) => {
    try {
      setRefreshing(true);
      setError("");

      const data = await SOAR_API.getExecution(executionId);
      syncExecution(normalizeExecution(data));
    } catch (err) {
      console.error(err);
      setError("Failed to refresh execution.");
    } finally {
      setRefreshing(false);
    }
  };

  const simulateExecution = async (executionId) => {
    try {
      setSimulating(true);
      setError("");

      const updated = await SOAR_API.simulateExecutionProgress(executionId);
      const fresh = await SOAR_API.getExecution(updated.id);

      syncExecution(normalizeExecution(fresh));
    } catch (err) {
      console.error(err);
      setError("Failed to simulate execution progress.");
    } finally {
      setSimulating(false);
    }
  };

  const simulateFailure = async (executionId) => {
    try {
      setFailing(true);
      setError("");

      const updated = await SOAR_API.simulateExecutionFailure(executionId);
      const fresh = await SOAR_API.getExecution(updated.id);

      syncExecution(normalizeExecution(fresh));
    } catch (err) {
      console.error(err);
      setError("Failed to simulate execution failure.");
    } finally {
      setFailing(false);
    }
  };

  const retryFailedStep = async (executionId, stepId = null) => {
    try {
      setRetryingStepId(stepId || "first-failed-step");
      setError("");

      const updated = await SOAR_API.retryFailedExecutionStep(executionId, {
        step_id: stepId,
      });

      const fresh = await SOAR_API.getExecution(updated.id);

      syncExecution(normalizeExecution(fresh));
    } catch (err) {
      console.error(err);
      setError("Failed to retry failed step.");
    } finally {
      setRetryingStepId("");
    }
  };

  const cancelExecution = async (executionId) => {
    try {
      setRefreshing(true);
      setError("");

      const updated = await SOAR_API.updateExecution(executionId, {
        status: "Cancelled",
      });

      syncExecution(normalizeExecution(updated));
    } catch (err) {
      console.error(err);
      setError("Failed to cancel execution.");
    } finally {
      setRefreshing(false);
    }
  };

  const exportExecutionLogs = (execution) => {
    const report = buildExecutionReport(execution);

    downloadJsonFile(
      `${execution.executionId || "soar-execution"}-logs.json`,
      {
        execution_id: report.summary.execution_id,
        playbook_name: report.summary.playbook_name,
        status: report.summary.status,
        logs: report.step_results.map((step) => ({
          step: step.name,
          status: step.status,
          logs: step.logs,
        })),
      }
    );
  };

  useEffect(() => {
    loadExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasRunningExecutions = useMemo(() => {
    return executions.some((item) => item.status === "Running");
  }, [executions]);

  useEffect(() => {
    if (!hasRunningExecutions && selectedExecution?.status !== "Running") {
      return;
    }

    const interval = setInterval(() => {
      loadExecutions({ silent: true });
    }, 6000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRunningExecutions, selectedExecution?.status]);

  const filteredExecutions = useMemo(() => {
    return executions.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.executionId?.toLowerCase().includes(query) ||
        item.playbookName?.toLowerCase().includes(query) ||
        item.triggerSource?.toLowerCase().includes(query) ||
        item.severity?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [executions, search, statusFilter]);

  const metrics = useMemo(() => {
    const total = executions.length;
    const running = executions.filter((item) => item.status === "Running").length;
    const completed = executions.filter(
      (item) => item.status === "Completed"
    ).length;
    const failed = executions.filter((item) => item.status === "Failed").length;

    const avgProgress =
      total > 0
        ? Math.round(
            executions.reduce(
              (sum, item) => sum + Number(item.progress || 0),
              0
            ) / total
          )
        : 0;

    return { total, running, completed, failed, avgProgress };
  }, [executions]);

  return (
    <div className="execution-dashboard polished-dashboard">
      <section className="execution-hero spectra-glass-card polished-hero">
        <div className="execution-hero-content">
          <div className="hero-chip">
            <Activity size={15} />
            Live Backend Executions
          </div>

          <h1>Enterprise Execution Center</h1>

          <p>
            Monitor real SOAR playbook executions, inspect workflow progress,
            simulate successful and failed steps, retry failed automation, cancel
            running executions, and export backend reports.
          </p>
        </div>

        <div className="execution-hero-actions">
          <button
            className="secondary-btn hero-refresh-btn"
            onClick={() => loadExecutions()}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="spectra-glass-card execution-error-banner">
          <XCircle size={17} />
          {error}
        </div>
      )}

      <div className="execution-kpi-grid polished-grid">
        <MetricCard
          icon={Activity}
          label="Total Executions"
          value={metrics.total}
          hint="All backend runs"
        />

        <MetricCard
          icon={Clock}
          label="Running"
          value={metrics.running}
          hint="Currently active"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={metrics.completed}
          hint="Successful completions"
        />

        <MetricCard
          icon={AlertTriangle}
          label="Failed"
          value={metrics.failed}
          hint="Requires retry"
        />

        <MetricCard
          icon={PlayCircle}
          label="Avg Progress"
          value={`${metrics.avgProgress}%`}
          hint="Across all executions"
        />
      </div>

      <div className="spectra-glass-card execution-table-card polished-table-card">
        <div className="execution-table-header">
          <div>
            <h2>Execution History</h2>
            <p>Backend-connected SOAR execution records.</p>
          </div>

          <div className="execution-filters">
            <div className="execution-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search executions..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Running</option>
              <option>Completed</option>
              <option>Failed</option>
              <option>Queued</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="execution-empty-state">
            <Loader2 size={20} />
            <p>Loading executions from backend...</p>
          </div>
        ) : filteredExecutions.length === 0 ? (
          <div className="execution-empty-state">
            <AlertTriangle size={20} />
            <p>No executions found. Run a playbook first.</p>
          </div>
        ) : (
          <div className="execution-table-wrap">
            <table className="execution-table">
              <thead>
                <tr>
                  <th>Execution</th>
                  <th>Playbook</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Severity</th>
                  <th>Started</th>
                  <th>Steps</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExecutions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="execution-primary-cell">
                        <b>{item.executionId}</b>
                        <span>{item.triggerSource}</span>
                      </div>
                    </td>

                    <td>{item.playbookName}</td>

                    <td>
                      <span
                        className={`execution-status ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-progress">
                        <span style={{ width: `${item.progress || 0}%` }} />
                      </div>
                      <small>{item.progress || 0}%</small>
                    </td>

                    <td>{item.severity}</td>
                    <td>{formatDate(item.startedAt)}</td>
                    <td>{item.steps.length}</td>

                    <td>
                      <button
                        className="icon-action-btn polished-view-btn"
                        onClick={() => setSelectedExecution(item)}
                      >
                        <Eye size={15} />
                        <span>Open Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedExecution && (
        <ExecutionDrawer
          execution={selectedExecution}
          refreshing={refreshing}
          simulating={simulating}
          failing={failing}
          retryingStepId={retryingStepId}
          onClose={() => setSelectedExecution(null)}
          onRefresh={() => refreshOneExecution(selectedExecution.id)}
          onSimulate={() => simulateExecution(selectedExecution.id)}
          onSimulateFailure={() => simulateFailure(selectedExecution.id)}
          onRetryFailedStep={(stepId) =>
            retryFailedStep(selectedExecution.id, stepId)
          }
          onCancel={() => cancelExecution(selectedExecution.id)}
          onExport={() => exportExecutionLogs(selectedExecution)}
        />
      )}
    </div>
  );
}

function AuditTrail({ execution }) {
  const events = useMemo(() => buildAuditTrail(execution), [execution]);

  return (
    <div className="execution-audit-card">
      <div className="audit-card-header">
        <div>
          <h3>
            <History size={18} />
            Execution Audit Trail
          </h3>
          <p>
            Chronological automation activity generated from backend execution
            state.
          </p>
        </div>

        <span>{events.length} events</span>
      </div>

      <div className="audit-timeline">
        {events.map((event) => (
          <div className="audit-event-row" key={event.id}>
            <div className={`audit-dot ${event.type}`}>
              {event.type === "failed" ? (
                <XCircle size={14} />
              ) : event.type === "completed" ? (
                <CheckCircle2 size={14} />
              ) : event.type === "retry" ? (
                <RotateCcw size={14} />
              ) : event.type === "log" ? (
                <FileText size={14} />
              ) : (
                <Clock size={14} />
              )}
            </div>

            <div className="audit-event-content">
              <div className="audit-event-top">
                <h4>{event.title}</h4>
                <span>{formatDate(event.time)}</span>
              </div>

              <p>{event.description}</p>

              <div className="audit-meta">
                <span>Actor: {event.actor}</span>

                {event.meta.map((item, index) => (
                  <span key={`${event.id}-meta-${index}`}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutionReportPanel({ execution }) {
  const report = useMemo(() => buildExecutionReport(execution), [execution]);
  const analystSummary = useMemo(
    () => buildAnalystSummary(execution),
    [execution]
  );

  const failedSteps = report.step_results.filter(
    (step) => step.status === "Failed"
  );

  const exportReport = () => {
    downloadJsonFile(
      `${execution.executionId || "soar-execution"}-full-report.json`,
      report
    );
  };

  const exportSummary = () => {
    downloadTextFile(
      `${execution.executionId || "soar-execution"}-analyst-summary.txt`,
      analystSummary
    );
  };

  return (
    <div className="execution-report-card">
      <div className="report-card-header">
        <div>
          <h3>
            <FileText size={18} />
            Execution Report Preview
          </h3>
          <p>
            Analyst-ready SOAR report generated from execution state, step
            results, logs, retries, and audit events.
          </p>
        </div>

        <div className="report-actions">
          <button className="secondary-btn" onClick={exportReport}>
            <Download size={15} />
            Export JSON
          </button>

          <button className="secondary-btn" onClick={exportSummary}>
            <Download size={15} />
            Export Summary
          </button>
        </div>
      </div>

      <div className="report-summary-grid">
        <div>
          <span>Status</span>
          <b>{report.summary.status}</b>
        </div>

        <div>
          <span>Severity</span>
          <b>{report.summary.severity}</b>
        </div>

        <div>
          <span>Progress</span>
          <b>{report.summary.progress}</b>
        </div>

        <div>
          <span>Runtime</span>
          <b>{report.summary.runtime_seconds}s</b>
        </div>
      </div>

      <div className="report-section">
        <h4>Executive Summary</h4>
        <p>
          Playbook <b>{report.summary.playbook_name}</b> currently has status{" "}
          <b>{report.summary.status}</b> with{" "}
          <b>{report.statistics.completed_steps}</b> completed step(s),{" "}
          <b>{report.statistics.failed_steps}</b> failed step(s), and{" "}
          <b>{report.statistics.retried_steps}</b> retried step(s).
        </p>
      </div>

      {failedSteps.length > 0 && (
        <div className="report-section report-failed-section">
          <h4>Failure Details</h4>

          {failedSteps.map((step) => (
            <div className="report-failed-step" key={`${step.order}-${step.name}`}>
              <b>
                Step {step.order}: {step.name}
              </b>
              <span>{step.error_message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="report-section">
        <h4>Report Includes</h4>

        <div className="report-includes">
          <span>{report.statistics.total_steps} step results</span>
          <span>{report.statistics.audit_events} audit events</span>
          <span>{report.statistics.total_logs} log entries</span>
          <span>{report.statistics.retried_steps} retry records</span>
        </div>
      </div>
    </div>
  );
}

function ExecutionDrawer({
  execution,
  refreshing,
  simulating,
  failing,
  retryingStepId,
  onClose,
  onRefresh,
  onSimulate,
  onSimulateFailure,
  onRetryFailedStep,
  onCancel,
  onExport,
}) {
  const [showReport, setShowReport] = useState(false);

  const isClosed = ["Completed", "Cancelled"].includes(execution.status);
  const isFailed = execution.status === "Failed";
  const failedSteps = execution.steps.filter((step) => step.status === "Failed");
  const hasFailedSteps = failedSteps.length > 0;

  return (
    <div className="execution-drawer-backdrop">
      <aside className="execution-drawer">
        <div className="execution-drawer-header">
          <div>
            <span className={`execution-status ${statusClass(execution.status)}`}>
              {execution.status}
            </span>

            <h2>{execution.playbookName}</h2>
            <p>{execution.executionId}</p>
          </div>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isFailed && (
          <div className="execution-failure-banner">
            <ShieldAlert size={18} />

            <div>
              <b>Execution failed</b>
              <p>
                {execution.errorMessage ||
                  "A workflow step failed and requires retry before continuing."}
              </p>
            </div>
          </div>
        )}

        <div className="execution-drawer-actions">
          <button
            className="primary-btn"
            onClick={onSimulate}
            disabled={simulating || isClosed || isFailed}
          >
            {simulating ? <Loader2 size={16} /> : <TestTube2 size={16} />}
            Simulate Step
          </button>

          <button
            className="secondary-btn failure-soft"
            onClick={onSimulateFailure}
            disabled={failing || isClosed || isFailed}
          >
            {failing ? <Loader2 size={16} /> : <XCircle size={16} />}
            Simulate Failure
          </button>

          <button
            className="secondary-btn retry-soft"
            onClick={() => onRetryFailedStep(null)}
            disabled={!hasFailedSteps || Boolean(retryingStepId) || isClosed}
          >
            {retryingStepId === "first-failed-step" ? (
              <Loader2 size={16} />
            ) : (
              <RotateCcw size={16} />
            )}
            Retry Failed Step
          </button>

          <button
            className="secondary-btn"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
            Refresh
          </button>

          <button className="secondary-btn" onClick={onExport}>
            <Download size={16} />
            Export Logs
          </button>

          <button
            className="secondary-btn report-soft"
            onClick={() => setShowReport((current) => !current)}
          >
            <FileText size={16} />
            {showReport ? "Hide Report" : "Generate Report"}
          </button>

          <button
            className="secondary-btn danger-soft"
            onClick={onCancel}
            disabled={isClosed}
          >
            <Square size={16} />
            Cancel
          </button>
        </div>

        <div className="execution-progress-block">
          <div className="execution-progress-top">
            <span>Execution Progress</span>
            <b>{execution.progress || 0}%</b>
          </div>

          <div className="execution-progress-track">
            <span style={{ width: `${execution.progress || 0}%` }} />
          </div>
        </div>

        <div className="execution-run-grid compact-grid">
          <div>
            <span>Severity</span>
            <b>{execution.severity}</b>
          </div>

          <div>
            <span>Started By</span>
            <b>{execution.startedBy}</b>
          </div>

          <div>
            <span>Started</span>
            <b>{formatDate(execution.startedAt)}</b>
          </div>

          <div>
            <span>Runtime</span>
            <b>{execution.runtimeSeconds}s</b>
          </div>
        </div>

        {showReport && <ExecutionReportPanel execution={execution} />}

        <AuditTrail execution={execution} />

        <div className="drawer-section-title">
          <h3>Step Timeline</h3>
          <span>{execution.steps.length} steps</span>
        </div>

        <div className="execution-step-timeline">
          {execution.steps.map((step, index) => (
            <div
              className={`execution-step-row ${
                step.status === "Failed" ? "failed-step-row" : ""
              }`}
              key={step.id}
            >
              <div className={`step-dot ${statusClass(step.status)}`}>
                {step.status === "Completed" ? (
                  <CheckCircle2 size={15} />
                ) : step.status === "Failed" ? (
                  <XCircle size={15} />
                ) : step.status === "Running" ? (
                  <Activity size={15} />
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
                    className={`execution-status ${statusClass(step.status)}`}
                  >
                    {step.status}
                  </span>
                </div>

                <p>{step.message}</p>

                {step.errorMessage && (
                  <div className="step-error-message">
                    <ShieldAlert size={14} />
                    {step.errorMessage}
                  </div>
                )}

                <div className="queue-meta">
                  <span>{step.type}</span>
                  <span>{step.connector}</span>
                  <span>{step.actionKey}</span>
                  <span>
                    {step.durationMs ? `${step.durationMs}ms` : "Duration pending"}
                  </span>
                  <span>Retry: {step.retryCount}</span>
                </div>

                {step.status === "Failed" && (
                  <div className="failed-step-actions">
                    <button
                      className="secondary-btn retry-soft retry-step-btn"
                      onClick={() => onRetryFailedStep(step.id)}
                      disabled={retryingStepId === step.id}
                    >
                      {retryingStepId === step.id ? (
                        <Loader2 size={15} />
                      ) : (
                        <RotateCcw size={15} />
                      )}
                      Retry This Step
                    </button>
                  </div>
                )}

                {step.logs?.length > 0 && (
                  <div className="execution-step-logs">
                    {step.logs.slice(-5).map((log, logIndex) => (
                      <code key={`${step.id}-log-${logIndex}`}>{log}</code>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
