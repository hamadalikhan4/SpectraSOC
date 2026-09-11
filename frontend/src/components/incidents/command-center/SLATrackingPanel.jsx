import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Gauge,
  RefreshCcw,
  ShieldAlert,
  TimerReset,
  TrendingUp,
  UserRound,
  Workflow,
  XCircle,
} from "lucide-react";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatDuration(ms) {
  const abs = Math.abs(ms);
  const minutes = Math.floor(abs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;

  return `${Math.max(minutes, 0)}m`;
}

function severityClass(value = "") {
  const severity = String(value).toLowerCase();

  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function policyForSeverity(severity = "Medium") {
  const normalized = String(severity).toLowerCase();

  const policies = {
    critical: {
      severity: "Critical",
      responseTargetMinutes: 15,
      containmentTargetMinutes: 60,
      resolutionTargetMinutes: 240,
      escalationAfterMinutes: 30,
      priority: "P0",
      owner: "Incident Commander",
      color: "critical",
    },
    high: {
      severity: "High",
      responseTargetMinutes: 30,
      containmentTargetMinutes: 180,
      resolutionTargetMinutes: 720,
      escalationAfterMinutes: 90,
      priority: "P1",
      owner: "Senior SOC Analyst",
      color: "high",
    },
    medium: {
      severity: "Medium",
      responseTargetMinutes: 120,
      containmentTargetMinutes: 480,
      resolutionTargetMinutes: 1440,
      escalationAfterMinutes: 300,
      priority: "P2",
      owner: "SOC Analyst",
      color: "medium",
    },
    low: {
      severity: "Low",
      responseTargetMinutes: 480,
      containmentTargetMinutes: 1440,
      resolutionTargetMinutes: 2880,
      escalationAfterMinutes: 900,
      priority: "P3",
      owner: "Junior Analyst",
      color: "low",
    },
  };

  return policies[normalized] || policies.medium;
}

function getStatusState(status = "") {
  const value = String(status).toLowerCase();

  if (value.includes("closed") || value.includes("resolved")) {
    return "resolved";
  }

  if (value.includes("contained")) {
    return "contained";
  }

  if (value.includes("investigating") || value.includes("progress")) {
    return "investigating";
  }

  return "open";
}

function computeSLAState(incident = {}, caseStatus = "Open", now = Date.now()) {
  const policy = policyForSeverity(incident.severity);
  const createdAt = new Date(incident.created_at || Date.now()).getTime();

  const responseDueAt = createdAt + policy.responseTargetMinutes * 60 * 1000;
  const containmentDueAt =
    createdAt + policy.containmentTargetMinutes * 60 * 1000;
  const resolutionDueAt =
    new Date(incident.sla_due_at || "").getTime() ||
    createdAt + policy.resolutionTargetMinutes * 60 * 1000;

  const statusState = getStatusState(caseStatus);
  const riskScore = Number(incident.risk_score || 50);

  const responseRemaining = responseDueAt - now;
  const containmentRemaining = containmentDueAt - now;
  const resolutionRemaining = resolutionDueAt - now;

  const responseBreached =
    responseRemaining < 0 && !["investigating", "contained", "resolved"].includes(statusState);

  const containmentBreached =
    containmentRemaining < 0 && !["contained", "resolved"].includes(statusState);

  const resolutionBreached = resolutionRemaining < 0 && statusState !== "resolved";

  const escalationDueAt = createdAt + policy.escalationAfterMinutes * 60 * 1000;
  const escalationRemaining = escalationDueAt - now;

  const shouldEscalate =
    escalationRemaining < 0 &&
    !["contained", "resolved"].includes(statusState);

  const severityWeight = {
    critical: 40,
    high: 30,
    medium: 18,
    low: 8,
  }[severityClass(incident.severity)];

  const breachWeight =
    (responseBreached ? 12 : 0) +
    (containmentBreached ? 16 : 0) +
    (resolutionBreached ? 20 : 0);

  const priorityScore = Math.min(
    100,
    Math.round(riskScore * 0.55 + severityWeight + breachWeight)
  );

  const workloadImpact =
    priorityScore >= 85
      ? "Very High"
      : priorityScore >= 70
        ? "High"
        : priorityScore >= 45
          ? "Medium"
          : "Low";

  const health =
    resolutionBreached || containmentBreached
      ? "Breached"
      : shouldEscalate
        ? "Escalation Required"
        : resolutionRemaining <= 1000 * 60 * 60
          ? "At Risk"
          : "Healthy";

  return {
    policy,
    createdAt,
    responseDueAt,
    containmentDueAt,
    resolutionDueAt,
    escalationDueAt,
    responseRemaining,
    containmentRemaining,
    resolutionRemaining,
    escalationRemaining,
    responseBreached,
    containmentBreached,
    resolutionBreached,
    shouldEscalate,
    priorityScore,
    workloadImpact,
    health,
    statusState,
  };
}

function exportSLASummary(incident, caseStatus, state) {
  const payload = {
    generated_at: new Date().toISOString(),
    incident: {
      id: incident?.id,
      title: incident?.title,
      severity: incident?.severity,
      status: caseStatus,
      risk_score: incident?.risk_score,
      assigned_to: incident?.assigned_to,
    },
    sla_policy: state.policy,
    sla_state: {
      health: state.health,
      priority_score: state.priorityScore,
      workload_impact: state.workloadImpact,
      response_due_at: new Date(state.responseDueAt).toISOString(),
      containment_due_at: new Date(state.containmentDueAt).toISOString(),
      resolution_due_at: new Date(state.resolutionDueAt).toISOString(),
      escalation_due_at: new Date(state.escalationDueAt).toISOString(),
      response_breached: state.responseBreached,
      containment_breached: state.containmentBreached,
      resolution_breached: state.resolutionBreached,
      should_escalate: state.shouldEscalate,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident?.id || "incident"}-sla-summary.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function SLAMetric({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`sla-metric-card ${tone}`}>
      <Icon size={17} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function MilestoneRow({ title, dueAt, remaining, breached, complete, icon: Icon }) {
  return (
    <div
      className={`sla-milestone-row ${
        complete ? "complete" : breached ? "breached" : "active"
      }`}
    >
      <div className="sla-milestone-icon">
        {complete ? (
          <CheckCircle2 size={16} />
        ) : breached ? (
          <XCircle size={16} />
        ) : (
          <Icon size={16} />
        )}
      </div>

      <div>
        <div className="sla-milestone-title">
          <h3>{title}</h3>
          <span>{complete ? "Complete" : breached ? "Breached" : "Active"}</span>
        </div>

        <p>Due: {formatTime(dueAt)}</p>

        <div className="sla-milestone-meta">
          <span>{remaining < 0 ? "Overdue" : "Remaining"}</span>
          <b>{formatDuration(remaining)}</b>
        </div>
      </div>
    </div>
  );
}

export default function SLATrackingPanel({
  incident,
  caseStatus,
  onStatusChange,
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const state = useMemo(
    () => computeSLAState(incident, caseStatus, now),
    [incident, caseStatus, now]
  );

  const statusState = getStatusState(caseStatus);

  return (
    <div className="sla-tracking-panel">
      <div className="sla-tracking-header">
        <div>
          <span className="hero-chip">
            <Clock size={15} />
            SLA / Severity Tracking
          </span>

          <h2>Response SLA Control</h2>

          <p>
            Monitor severity-based response targets, breach risk, escalation
            state, calculated priority, analyst workload, and case timing.
          </p>
        </div>

        <div className="sla-tracking-actions">
          <button className="secondary-btn" onClick={() => setNow(Date.now())}>
            <RefreshCcw size={16} />
            Refresh Timer
          </button>

          <button
            className="primary-btn"
            onClick={() => exportSLASummary(incident, caseStatus, state)}
          >
            <Download size={16} />
            Export SLA Summary
          </button>
        </div>
      </div>

      <div className={`sla-health-banner ${severityClass(incident?.severity)}`}>
        <div>
          <ShieldAlert size={22} />
        </div>

        <div>
          <h3>{state.health}</h3>
          <p>
            {state.shouldEscalate
              ? "Escalation is required because this case has exceeded the configured escalation window."
              : state.resolutionBreached
                ? "Resolution SLA is breached. Immediate management review is recommended."
                : state.resolutionRemaining <= 1000 * 60 * 60
                  ? "This case is approaching SLA deadline and should be prioritized."
                  : "SLA state is currently healthy based on severity policy."}
          </p>
        </div>

        <strong>{formatDuration(state.resolutionRemaining)}</strong>
      </div>

      <div className="sla-metric-grid">
        <SLAMetric
          icon={Gauge}
          label="Priority Score"
          value={state.priorityScore}
          tone={state.priorityScore >= 80 ? "red" : "blue"}
        />

        <SLAMetric
          icon={Flame}
          label="Severity Policy"
          value={state.policy.severity}
          tone={state.policy.color}
        />

        <SLAMetric
          icon={BellRing}
          label="Escalation"
          value={state.shouldEscalate ? "Required" : "Normal"}
          tone={state.shouldEscalate ? "red" : "green"}
        />

        <SLAMetric
          icon={UserRound}
          label="Workload Impact"
          value={state.workloadImpact}
          tone={state.workloadImpact === "Very High" ? "red" : "yellow"}
        />

        <SLAMetric
          icon={Workflow}
          label="Priority Level"
          value={state.policy.priority}
          tone="green"
        />
      </div>

      <div className="sla-tracking-grid">
        <div className="sla-policy-card">
          <div className="sla-section-title">
            <h3>Severity-Based SLA Policy</h3>
            <span>{state.policy.priority}</span>
          </div>

          <div className="sla-policy-grid">
            <div>
              <span>Initial Response</span>
              <b>{state.policy.responseTargetMinutes}m</b>
            </div>

            <div>
              <span>Containment Target</span>
              <b>{state.policy.containmentTargetMinutes}m</b>
            </div>

            <div>
              <span>Resolution Target</span>
              <b>{state.policy.resolutionTargetMinutes}m</b>
            </div>

            <div>
              <span>Escalation After</span>
              <b>{state.policy.escalationAfterMinutes}m</b>
            </div>

            <div>
              <span>Recommended Owner</span>
              <b>{state.policy.owner}</b>
            </div>

            <div>
              <span>Current Owner</span>
              <b>{incident?.assigned_to || "Unassigned"}</b>
            </div>
          </div>

          <div className="sla-priority-box">
            <TrendingUp size={18} />

            <div>
              <b>Priority Calculation</b>
              <p>
                Risk score, severity weight, SLA breach state, and current case
                status are used to calculate the operational priority score.
              </p>
            </div>
          </div>
        </div>

        <div className="sla-status-card">
          <div className="sla-section-title">
            <h3>Case Status Control</h3>
            <span>{caseStatus}</span>
          </div>

          <div className="sla-status-actions">
            {["Open", "Investigating", "Contained", "Resolved", "Closed"].map(
              (status) => (
                <button
                  key={status}
                  className={caseStatus === status ? "active" : ""}
                  onClick={() => onStatusChange?.(status)}
                >
                  {status}
                </button>
              )
            )}
          </div>

          <div className="sla-state-note">
            <Activity size={16} />
            Current SLA status stage: <b>{statusState}</b>
          </div>
        </div>
      </div>

      <div className="sla-milestones-card">
        <div className="sla-section-title">
          <h3>SLA Milestones</h3>
          <span>Live countdown</span>
        </div>

        <div className="sla-milestone-list">
          <MilestoneRow
            title="Initial Response"
            dueAt={state.responseDueAt}
            remaining={state.responseRemaining}
            breached={state.responseBreached}
            complete={["investigating", "contained", "resolved"].includes(
              statusState
            )}
            icon={TimerReset}
          />

          <MilestoneRow
            title="Containment"
            dueAt={state.containmentDueAt}
            remaining={state.containmentRemaining}
            breached={state.containmentBreached}
            complete={["contained", "resolved"].includes(statusState)}
            icon={ShieldAlert}
          />

          <MilestoneRow
            title="Resolution"
            dueAt={state.resolutionDueAt}
            remaining={state.resolutionRemaining}
            breached={state.resolutionBreached}
            complete={statusState === "resolved"}
            icon={CheckCircle2}
          />

          <MilestoneRow
            title="Escalation Window"
            dueAt={state.escalationDueAt}
            remaining={state.escalationRemaining}
            breached={state.shouldEscalate}
            complete={["contained", "resolved"].includes(statusState)}
            icon={BellRing}
          />
        </div>
      </div>

      <div className="sla-escalation-card">
        <AlertTriangle size={18} />

        <div>
          <b>Escalation Recommendation</b>
          <p>
            {state.shouldEscalate
              ? "Escalate to incident commander and notify SOC lead. Update executive summary if business impact is confirmed."
              : state.priorityScore >= 80
                ? "Keep this case in the priority queue and review every 30 minutes."
                : "Normal analyst monitoring is sufficient based on current SLA state."}
          </p>
        </div>
      </div>
    </div>
  );
}