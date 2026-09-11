import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

import BuilderLaunchPanel from "./BuilderLaunchPanel";
import ApprovalWorkflowPanel from "./ApprovalWorkflowPanel";
import ExecutionRunPanel from "./ExecutionRunPanel";
import VersionHistoryPanel from "./VersionHistoryPanel";
import ConnectorExecutionLayer from "../connectors/ConnectorExecutionLayer";
import AuditLogPanel from "../audit/AuditLogPanel";
import PlaybookFlowDesigner from "../designer/PlaybookFlowDesigner";

import { logSoarAudit } from "../audit/soarAuditLog";

function sanitizeSteps(steps = []) {
  return [...steps]
    .sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))
    .map((step, index) => ({
      step_order: Number(step.step_order || index + 1),
      step_type: step.step_type || "Action",
      name: step.name || `Step ${index + 1}`,
      action_key: step.action_key || "automation.step",
      connector_name: step.connector_name || "SOAR Engine",
      config: step.config || {},
      condition: step.condition || {},
    }));
}

function normalizePlaybook(playbook = {}) {
  return {
    ...playbook,
    steps: Array.isArray(playbook.steps) ? playbook.steps : [],
    tags: Array.isArray(playbook.tags) ? playbook.tags : [],
  };
}

function formatDate(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

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

export default function PlaybookBuilder({
  playbook,
  onBack,
  successMessage = "",
}) {
  const [localPlaybook, setLocalPlaybook] = useState(
    normalizePlaybook(playbook)
  );

  const [workingSteps, setWorkingSteps] = useState(
    sanitizeSteps(playbook?.steps || [])
  );

  const [lastExecution, setLastExecution] = useState(null);

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [refreshingExecution, setRefreshingExecution] = useState(false);
  const [simulatingExecution, setSimulatingExecution] = useState(false);

  const [auditRefreshKey, setAuditRefreshKey] = useState(0);

  const [approvalState, setApprovalState] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    isBlocked: false,
    approvals: {},
  });

  const [builderMessage, setBuilderMessage] = useState(successMessage || "");
  const [builderError, setBuilderError] = useState("");

  useEffect(() => {
    const normalized = normalizePlaybook(playbook);

    setLocalPlaybook(normalized);
    setWorkingSteps(sanitizeSteps(normalized.steps || []));
    setBuilderMessage(successMessage || "");
    setBuilderError("");
    setLastExecution(null);
    setApprovalState({
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      isBlocked: false,
      approvals: {},
    });
  }, [playbook, successMessage]);

  const builderPlaybook = useMemo(() => {
    return {
      ...localPlaybook,
      steps: workingSteps,
    };
  }, [localPlaybook, workingSteps]);

  const requiredApprovalSteps = useMemo(() => {
    return workingSteps.filter(stepRequiresApproval);
  }, [workingSteps]);

  const isApprovalBlocked =
    requiredApprovalSteps.length > 0 &&
    (approvalState.approved < requiredApprovalSteps.length ||
      approvalState.rejected > 0);

  const writeAudit = ({
    action,
    status = "Info",
    severity = localPlaybook.severity || "Medium",
    entityId = localPlaybook.id,
    entityName = localPlaybook.name,
    entityVersion = localPlaybook.version || "1.0",
    source = "Playbook Builder",
    details = {},
  }) => {
    logSoarAudit({
      action,
      status,
      severity,
      entity_type: "SOAR Playbook",
      entity_id: entityId,
      entity_name: entityName,
      source,
      actor: "SOC Analyst",
      details: {
        playbook_id: entityId,
        playbook_name: entityName,
        version: entityVersion,
        ...details,
      },
    });

    setAuditRefreshKey((prev) => prev + 1);
  };

  const handleSaveWorkflow = async (stepsFromDesigner = null) => {
    try {
      setSaving(true);
      setBuilderError("");
      setBuilderMessage("");

      const stepsToSave = sanitizeSteps(stepsFromDesigner || workingSteps);

      const updated = await SOAR_API.replacePlaybookSteps(
        localPlaybook.id,
        stepsToSave
      );

      const normalized = normalizePlaybook(updated);

      setLocalPlaybook(normalized);
      setWorkingSteps(sanitizeSteps(normalized.steps || stepsToSave));
      setBuilderMessage("Workflow saved successfully.");

      writeAudit({
        action: "Workflow Saved",
        status: "Success",
        details: {
          steps_saved: stepsToSave.length,
        },
      });

      return normalized;
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to save workflow steps.");

      writeAudit({
        action: "Workflow Save Failed",
        status: "Failed",
        severity: "High",
        details: {
          error: err?.message || "Unknown error",
        },
      });

      throw err;
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setBuilderMessage("");
      setBuilderError("");

      const updated = await SOAR_API.updatePlaybook(localPlaybook.id, {
        status: "Draft",
        is_active: true,
      });

      const normalized = normalizePlaybook({
        ...localPlaybook,
        ...updated,
        steps: updated.steps || localPlaybook.steps || workingSteps,
      });

      setLocalPlaybook(normalized);
      setBuilderMessage("Playbook draft saved successfully.");

      writeAudit({
        action: "Draft Saved",
        status: "Success",
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to save playbook draft.");

      writeAudit({
        action: "Draft Save Failed",
        status: "Failed",
        severity: "High",
        details: {
          error: err?.message || "Unknown error",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const clonePlaybook = async () => {
    try {
      setCloning(true);
      setBuilderMessage("");
      setBuilderError("");

      const clonedPayload = {
        name: `${localPlaybook.name || "Untitled Playbook"} - Clone`,
        description: localPlaybook.description || "",
        category: localPlaybook.category || "General",
        status: "Draft",
        severity: localPlaybook.severity || "Medium",
        trigger_type: localPlaybook.trigger_type || "Manual",
        trigger_source: localPlaybook.trigger_source || "SOAR Engine",
        is_active: true,
        version: "1.0",
        tags: [...(localPlaybook.tags || []), "cloned"],
        steps: sanitizeSteps(workingSteps || localPlaybook.steps || []),
      };

      const cloned = await SOAR_API.createPlaybook(clonedPayload);

      setBuilderMessage(`Cloned playbook created: ${cloned.name}`);

      writeAudit({
        action: "Playbook Cloned",
        status: "Success",
        details: {
          cloned_playbook_id: cloned.id,
          cloned_playbook_name: cloned.name,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to clone playbook.");

      writeAudit({
        action: "Playbook Clone Failed",
        status: "Failed",
        severity: "High",
        details: {
          error: err?.message || "Unknown error",
        },
      });
    } finally {
      setCloning(false);
    }
  };

  const runPlaybookFromPanel = async () => {
    if (isApprovalBlocked) {
      setBuilderError(
        "Execution blocked. Approve all required high-risk actions before running this playbook."
      );

      writeAudit({
        action: "Execution Blocked by Approval Gate",
        status: "Blocked",
        severity: "High",
        details: {
          required_approval_steps: requiredApprovalSteps.length,
          approved_steps: approvalState.approved,
          rejected_steps: approvalState.rejected,
        },
      });

      return;
    }

    try {
      setRunning(true);
      setBuilderMessage("");
      setBuilderError("");

      const execution = await SOAR_API.startPlaybook(localPlaybook.id, {
        trigger_payload: {
          source: "builder_launch_panel",
          playbook_name: localPlaybook.name,
          approval_state: approvalState,
        },
        trigger_source: "Builder Launch Panel",
        started_by: "SOC Analyst",
      });

      const freshExecution = await SOAR_API.getExecution(execution.id);

      setLastExecution(freshExecution);
      setBuilderMessage("Playbook execution started successfully.");

      writeAudit({
        action: "Execution Started",
        status: "Success",
        details: {
          execution_id: freshExecution.id,
          trigger_source: "Builder Launch Panel",
          execution_status: freshExecution.status,
          execution_progress: freshExecution.progress,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to run playbook.");

      writeAudit({
        action: "Execution Start Failed",
        status: "Failed",
        severity: "High",
        details: {
          error: err?.message || "Unknown error",
        },
      });
    } finally {
      setRunning(false);
    }
  };

  const saveAndRunPlaybook = async () => {
    if (isApprovalBlocked) {
      setBuilderError(
        "Save & Run blocked. Approve all required high-risk actions before execution."
      );

      writeAudit({
        action: "Save & Run Blocked by Approval Gate",
        status: "Blocked",
        severity: "High",
        details: {
          required_approval_steps: requiredApprovalSteps.length,
          approved_steps: approvalState.approved,
          rejected_steps: approvalState.rejected,
        },
      });

      return;
    }

    try {
      setSaving(true);
      setRunning(true);
      setBuilderMessage("");
      setBuilderError("");

      const stepsToSave = sanitizeSteps(workingSteps);

      const updated = await SOAR_API.replacePlaybookSteps(
        localPlaybook.id,
        stepsToSave
      );

      const activated = await SOAR_API.updatePlaybook(localPlaybook.id, {
        status: "Active",
        is_active: true,
      });

      const normalized = normalizePlaybook({
        ...updated,
        ...activated,
        status: "Active",
        is_active: true,
        steps: updated.steps || stepsToSave,
      });

      setLocalPlaybook(normalized);
      setWorkingSteps(sanitizeSteps(normalized.steps || stepsToSave));

      const execution = await SOAR_API.startPlaybook(localPlaybook.id, {
        trigger_payload: {
          source: "save_and_run",
          playbook_name: localPlaybook.name,
          approval_state: approvalState,
        },
        trigger_source: "Save & Run",
        started_by: "SOC Analyst",
      });

      const freshExecution = await SOAR_API.getExecution(execution.id);

      setLastExecution(freshExecution);
      setBuilderMessage("Playbook saved and execution started.");

      writeAudit({
        action: "Playbook Saved and Execution Started",
        status: "Success",
        details: {
          execution_id: freshExecution.id,
          trigger_source: "Save & Run",
          steps_saved: stepsToSave.length,
          execution_status: freshExecution.status,
          execution_progress: freshExecution.progress,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to save and run playbook.");

      writeAudit({
        action: "Save & Run Failed",
        status: "Failed",
        severity: "High",
        details: {
          error: err?.message || "Unknown error",
        },
      });
    } finally {
      setSaving(false);
      setRunning(false);
    }
  };

  const openVersion = async (versionPlaybook) => {
    try {
      setBuilderError("");
      setBuilderMessage("");

      const fullVersion = await SOAR_API.getPlaybook(versionPlaybook.id);
      const normalized = normalizePlaybook(fullVersion);

      setLocalPlaybook(normalized);
      setWorkingSteps(sanitizeSteps(normalized.steps || []));
      setLastExecution(null);

      setApprovalState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        isBlocked: false,
        approvals: {},
      });

      setBuilderMessage(
        `Opened version v${normalized.version || "1.0"} successfully.`
      );

      writeAudit({
        action: "Version Opened",
        status: "Info",
        entityId: normalized.id,
        entityName: normalized.name,
        entityVersion: normalized.version || "1.0",
        details: {
          opened_version: normalized.version || "1.0",
          opened_playbook_id: normalized.id,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to open selected version.");

      writeAudit({
        action: "Version Open Failed",
        status: "Failed",
        severity: "High",
        details: {
          target_playbook_id: versionPlaybook?.id,
          error: err?.message || "Unknown error",
        },
      });
    }
  };

  const handleVersionCreated = async (createdVersion) => {
    try {
      const fullVersion = await SOAR_API.getPlaybook(createdVersion.id);
      const normalized = normalizePlaybook(fullVersion);

      setLocalPlaybook(normalized);
      setWorkingSteps(sanitizeSteps(normalized.steps || []));
      setLastExecution(null);

      setApprovalState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        isBlocked: false,
        approvals: {},
      });

      setBuilderMessage(
        `New version v${normalized.version || "1.0"} created and opened.`
      );

      writeAudit({
        action: "New Version Created",
        status: "Success",
        entityId: normalized.id,
        entityName: normalized.name,
        entityVersion: normalized.version || "1.0",
        details: {
          version: normalized.version || "1.0",
          version_playbook_id: normalized.id,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderMessage(
        `New version v${createdVersion.version || "1.0"} created successfully.`
      );

      writeAudit({
        action: "New Version Created",
        status: "Success",
        details: {
          version: createdVersion.version || "1.0",
          version_playbook_id: createdVersion.id,
          warning: "Version was created but could not be opened automatically.",
        },
      });
    }
  };

  const refreshExecution = async () => {
    if (!lastExecution?.id) return;

    try {
      setRefreshingExecution(true);
      setBuilderError("");

      const freshExecution = await SOAR_API.getExecution(lastExecution.id);

      setLastExecution(freshExecution);

      writeAudit({
        action: "Execution Refreshed",
        status: "Info",
        details: {
          execution_id: freshExecution.id,
          execution_status: freshExecution.status,
          execution_progress: freshExecution.progress,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to refresh execution.");

      writeAudit({
        action: "Execution Refresh Failed",
        status: "Failed",
        severity: "Medium",
        details: {
          execution_id: lastExecution?.id,
          error: err?.message || "Unknown error",
        },
      });
    } finally {
      setRefreshingExecution(false);
    }
  };

  const simulateProgress = async () => {
    if (!lastExecution?.id) return;

    try {
      setSimulatingExecution(true);
      setBuilderError("");

      const updated = await SOAR_API.simulateExecutionProgress(lastExecution.id);
      const freshExecution = await SOAR_API.getExecution(updated.id);

      setLastExecution(freshExecution);
      setBuilderMessage("Execution progress simulated.");

      writeAudit({
        action: "Execution Progress Simulated",
        status: "Success",
        details: {
          execution_id: freshExecution.id,
          execution_status: freshExecution.status,
          execution_progress: freshExecution.progress,
        },
      });
    } catch (err) {
      console.error(err);

      setBuilderError("Failed to simulate execution progress.");

      writeAudit({
        action: "Execution Simulation Failed",
        status: "Failed",
        severity: "Medium",
        details: {
          execution_id: lastExecution?.id,
          error: err?.message || "Unknown error",
        },
      });
    } finally {
      setSimulatingExecution(false);
    }
  };

  return (
    <div className="playbook-builder-page">
      <div className="playbook-builder-header spectra-glass-card">
        <button className="secondary-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="builder-title-block">
          <span className="hero-chip">
            <GitBranch size={15} />
            Visual Playbook Builder
          </span>

          <h1>{localPlaybook.name || "Untitled Playbook"}</h1>

          <p>
            Design, validate, save, clone, version, approve, audit, test
            connectors, and launch this SOAR automation workflow from one
            enterprise workspace.
          </p>
        </div>

        <div className="builder-header-meta">
          <span>{localPlaybook.category || "General"}</span>
          <span>{localPlaybook.severity || "Medium"}</span>
          <span>v{localPlaybook.version || "1.0"}</span>
        </div>
      </div>

      {builderMessage && (
        <div className="spectra-glass-card builder-message">
          <CheckCircle2 size={17} />
          <span>{builderMessage}</span>
        </div>
      )}

      {builderError && (
        <div className="spectra-glass-card builder-error-message">
          <XCircle size={17} />
          <span>{builderError}</span>
        </div>
      )}

      <BuilderLaunchPanel
        playbook={builderPlaybook}
        saving={saving}
        running={running}
        cloning={cloning}
        onSaveDraft={saveDraft}
        onRun={runPlaybookFromPanel}
        onSaveAndRun={saveAndRunPlaybook}
        onClone={clonePlaybook}
      />

      <ApprovalWorkflowPanel
        playbook={builderPlaybook}
        onChange={setApprovalState}
        onAudit={writeAudit}
      />

      <ConnectorExecutionLayer
        playbook={builderPlaybook}
        approvalState={approvalState}
        onAudit={writeAudit}
        onResult={(result) => {
          setBuilderMessage(
            `Connector ${result.mode} execution completed: ${result.completed} completed, ${result.blocked} blocked, ${result.skipped} skipped.`
          );
        }}
      />

      <VersionHistoryPanel
        playbook={builderPlaybook}
        onOpenVersion={openVersion}
        onVersionCreated={handleVersionCreated}
      />

      <AuditLogPanel
        playbookId={builderPlaybook.id}
        playbookName={builderPlaybook.name}
        refreshKey={auditRefreshKey}
      />

      <ExecutionRunPanel
        execution={lastExecution}
        running={running}
        simulating={simulatingExecution}
        refreshing={refreshingExecution}
        onRun={runPlaybookFromPanel}
        onSimulate={simulateProgress}
        onRefresh={refreshExecution}
      />

      <div className="spectra-glass-card builder-workflow-card">
        <div className="builder-workflow-header">
          <div>
            <span className="hero-chip">
              <Sparkles size={15} />
              Workflow Designer
            </span>

            <h2>Automation Flow</h2>

            <p>
              Modify nodes, validate workflow logic, save backend steps, and run
              the playbook from the launch panel.
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={() => handleSaveWorkflow()}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
            Save Workflow
          </button>
        </div>

        <PlaybookFlowDesigner
          playbook={builderPlaybook}
          steps={workingSteps}
          saving={saving}
          onStepsChange={setWorkingSteps}
          onSave={handleSaveWorkflow}
          onSaved={handleSaveWorkflow}
        />
      </div>

      <div className="spectra-glass-card builder-footer-note">
        <ShieldAlert size={18} />

        <div>
          <b>Builder status</b>
          <p>
            Last updated: {formatDate(localPlaybook.updated_at)}. Workflow steps
            are stored in PostgreSQL, connector tests can run in safe mock mode,
            and execution is controlled by approval gates and audit logging.
          </p>
        </div>
      </div>
    </div>
  );
}