import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LockKeyhole,
  ShieldAlert,
  UserCheck,
  XCircle,
} from "lucide-react";

function stepRequiresApproval(step = {}) {
  const text = `${step.name || ""} ${step.action_key || ""} ${
    step.connector_name || ""
  }`.toLowerCase();

  const dangerousKeywords = [
    "isolate",
    "bulk_isolate",
    "block",
    "disable",
    "contain",
    "quarantine",
    "firewall",
    "account.disable",
    "host.isolate",
    "ransomware",
    "dlp",
  ];

  return (
    step.config?.require_approval === true ||
    dangerousKeywords.some((keyword) => text.includes(keyword))
  );
}

function formatTime(value) {
  if (!value) return "Not reviewed";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ApprovalWorkflowPanel({ playbook, onChange, onAudit }) {
  const [approvals, setApprovals] = useState({});
  const [notes, setNotes] = useState({});

  const requiredSteps = useMemo(() => {
    return (playbook?.steps || []).filter(stepRequiresApproval);
  }, [playbook]);

  useEffect(() => {
    setApprovals({});
    setNotes({});
  }, [playbook?.id]);

  const summary = useMemo(() => {
    const total = requiredSteps.length;

    const approved = requiredSteps.filter(
      (step) => approvals[step.step_order]?.status === "Approved"
    ).length;

    const rejected = requiredSteps.filter(
      (step) => approvals[step.step_order]?.status === "Rejected"
    ).length;

    const pending = total - approved - rejected;

    return {
      total,
      approved,
      rejected,
      pending,
      isBlocked: total > 0 && (pending > 0 || rejected > 0),
    };
  }, [requiredSteps, approvals]);

  useEffect(() => {
    if (onChange) {
      onChange({
        approvals,
        total: summary.total,
        approved: summary.approved,
        rejected: summary.rejected,
        pending: summary.pending,
        isBlocked: summary.isBlocked,
      });
    }
  }, [
    approvals,
    summary.total,
    summary.approved,
    summary.rejected,
    summary.pending,
    summary.isBlocked,
    onChange,
  ]);

  const approveStep = (step) => {
    const approvalNote =
      notes[step.step_order] || "Approved for execution.";

    setApprovals((prev) => ({
      ...prev,
      [step.step_order]: {
        status: "Approved",
        reviewed_by: "SOC Lead",
        reviewed_at: new Date().toISOString(),
        note: approvalNote,
      },
    }));

    if (onAudit) {
      onAudit({
        action: "Approval Granted",
        status: "Success",
        severity: "High",
        details: {
          step_order: step.step_order,
          step_name: step.name,
          action_key: step.action_key,
          connector_name: step.connector_name,
          note: approvalNote,
        },
      });
    }
  };

  const rejectStep = (step) => {
    const rejectionNote =
      notes[step.step_order] ||
      "Rejected due to risk or missing context.";

    setApprovals((prev) => ({
      ...prev,
      [step.step_order]: {
        status: "Rejected",
        reviewed_by: "SOC Lead",
        reviewed_at: new Date().toISOString(),
        note: rejectionNote,
      },
    }));

    if (onAudit) {
      onAudit({
        action: "Approval Rejected",
        status: "Rejected",
        severity: "High",
        details: {
          step_order: step.step_order,
          step_name: step.name,
          action_key: step.action_key,
          connector_name: step.connector_name,
          note: rejectionNote,
        },
      });
    }
  };

  return (
    <div className="approval-workflow-panel spectra-glass-card">
      <div className="approval-header">
        <div>
          <span className="hero-chip">
            <LockKeyhole size={15} />
            Approval Workflow
          </span>

          <h2>Manual Approval Gate</h2>

          <p>
            Review high-risk automation actions before execution. Dangerous
            actions like endpoint isolation, account disable, firewall block,
            and ransomware containment require approval.
          </p>
        </div>

        <div
          className={`approval-status-badge ${
            summary.isBlocked ? "blocked" : "clear"
          }`}
        >
          {summary.isBlocked ? (
            <AlertTriangle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          {summary.isBlocked ? "Approval Required" : "Approval Clear"}
        </div>
      </div>

      <div className="approval-metrics-grid">
        <div>
          <ShieldAlert size={16} />
          <span>Total Approval Steps</span>
          <b>{summary.total}</b>
        </div>

        <div>
          <Clock size={16} />
          <span>Pending</span>
          <b>{summary.pending}</b>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>Approved</span>
          <b>{summary.approved}</b>
        </div>

        <div>
          <XCircle size={16} />
          <span>Rejected</span>
          <b>{summary.rejected}</b>
        </div>
      </div>

      {requiredSteps.length === 0 ? (
        <div className="approval-empty">
          <CheckCircle2 size={18} />

          <div>
            <b>No approval required</b>
            <p>
              This playbook does not contain high-risk automation actions.
            </p>
          </div>
        </div>
      ) : (
        <div className="approval-step-list">
          {requiredSteps.map((step) => {
            const approval = approvals[step.step_order];
            const status = approval?.status || "Pending";

            return (
              <div
                className={`approval-step-row ${status.toLowerCase()}`}
                key={step.step_order}
              >
                <div className="approval-step-main">
                  <div className="approval-step-icon">
                    <LockKeyhole size={16} />
                  </div>

                  <div>
                    <div className="approval-step-title">
                      <h3>{step.name}</h3>
                      <span>{status}</span>
                    </div>

                    <p>{step.action_key}</p>

                    <div className="approval-step-meta">
                      <span>Step {step.step_order}</span>
                      <span>{step.connector_name || "SOAR Engine"}</span>
                      <span>{step.step_type || "Action"}</span>
                    </div>

                    <textarea
                      value={notes[step.step_order] || ""}
                      onChange={(event) =>
                        setNotes((prev) => ({
                          ...prev,
                          [step.step_order]: event.target.value,
                        }))
                      }
                      placeholder="Approval note, reason, or analyst comment..."
                    />

                    {approval && (
                      <div className="approval-review-info">
                        <UserCheck size={13} />
                        Reviewed by {approval.reviewed_by} ·{" "}
                        {formatTime(approval.reviewed_at)} · {approval.note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="approval-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => rejectStep(step)}
                  >
                    <XCircle size={15} />
                    Reject
                  </button>

                  <button
                    className="primary-btn"
                    onClick={() => approveStep(step)}
                  >
                    <CheckCircle2 size={15} />
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {summary.isBlocked && (
        <div className="approval-warning">
          <AlertTriangle size={16} />
          Playbook execution is blocked until all required actions are approved.
        </div>
      )}
    </div>
  );
}