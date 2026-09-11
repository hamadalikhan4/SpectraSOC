import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  PlayCircle,
  Radar,
  ShieldAlert,
  UserCheck,
  Workflow,
  X,
} from "lucide-react";

import SOAROverviewDashboard from "../components/soar/dashboard/SOAROverviewDashboard";
import PlaybookManagement from "../components/soar/playbooks/PlaybookManagement";
import ExecutionDashboard from "../components/soar/executions/ExecutionDashboard";
import ActionLibrary from "../components/soar/actions/ActionLibrary";
import AIBuilder from "../components/soar/ai/AIBuilder";
import SOARSettings from "../components/soar/settings/SOARSettings";
import SOARDemoMode from "../components/soar/demo/SOARDemoMode";

const SIEM_HANDOFF_KEY = "spectrasoc_siem_soar_handoff";
const SOAR_HANDOFF_EXECUTIONS_KEY = "spectrasoc_soar_handoff_executions_v1";

function readHandoff() {
  try {
    const raw = localStorage.getItem(SIEM_HANDOFF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readQueuedExecutions() {
  try {
    const raw = localStorage.getItem(SOAR_HANDOFF_EXECUTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueuedExecutions(executions) {
  localStorage.setItem(SOAR_HANDOFF_EXECUTIONS_KEY, JSON.stringify(executions));
}

function createQueuedExecution(handoff) {
  const execution = {
    id: `SOAR-SIEM-${Date.now()}`,
    execution_id: `SOAR-SIEM-${Date.now()}`,
    source: "SIEM",
    status: "Queued",
    progress: 0,
    playbook_name: handoff.recommended_playbook || "SIEM Alert Triage",
    severity: handoff.severity || "Medium",
    risk_score: handoff.risk_score || 0,
    approval_required: true,
    trigger_source: "SIEM Alert Triage Drawer",
    alert_title: handoff.alert_title,
    source_log_id: handoff.source_log_id,
    target_ip: handoff.alert?.ip,
    target_host: handoff.alert?.host,
    target_user: handoff.alert?.user,
    mitre: handoff.mitre,
    suggested_actions: handoff.suggested_actions || [],
    connector_plan: handoff.connector_plan || [],
    created_at: new Date().toISOString(),
  };

  const existing = readQueuedExecutions();
  writeQueuedExecutions([execution, ...existing]);

  return execution;
}

function HandoffMetric({ icon: Icon, label, value }) {
  return (
    <div className="soar-handoff-metric">
      <Icon size={17} />
      <span>{label}</span>
      <b>{value || "N/A"}</b>
    </div>
  );
}

function SIEMSOARHandoffBanner({
  handoff,
  notice,
  onQueueExecution,
  onOpenPlaybooks,
  onOpenExecutions,
  onClear,
}) {
  if (!handoff) return null;

  const alert = handoff.alert || {};

  return (
    <div className="spectra-glass-card soar-siem-handoff-card">
      <div className="soar-handoff-main">
        <div>
          <span className="hero-chip">
            <ShieldAlert size={15} />
            SIEM → SOAR Handoff
          </span>

          <h2>{handoff.alert_title || alert.title || "SIEM Alert Handoff"}</h2>

          <p>
            A SIEM alert has been transferred into SOAR for analyst-approved
            response automation. Review the recommended playbook, connector
            plan, target asset, MITRE mapping, and approval requirement before
            execution.
          </p>
        </div>

        <button className="soar-handoff-close" onClick={onClear}>
          <X size={18} />
        </button>
      </div>

      {notice && (
        <div className="soar-handoff-notice">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      <div className="soar-handoff-grid">
        <HandoffMetric
          icon={Workflow}
          label="Recommended Playbook"
          value={handoff.recommended_playbook}
        />

        <HandoffMetric
          icon={AlertTriangle}
          label="Severity"
          value={handoff.severity}
        />

        <HandoffMetric
          icon={Radar}
          label="MITRE Technique"
          value={handoff.mitre?.technique || alert.technique}
        />

        <HandoffMetric
          icon={Database}
          label="Target IOC"
          value={alert.ip}
        />

        <HandoffMetric
          icon={UserCheck}
          label="User"
          value={alert.user}
        />

        <HandoffMetric
          icon={ShieldAlert}
          label="Risk Score"
          value={`${handoff.risk_score || alert.risk || 0}/100`}
        />
      </div>

      <div className="soar-handoff-content-grid">
        <div>
          <h3>Suggested SOAR Actions</h3>

          <div className="soar-handoff-action-list">
            {(handoff.suggested_actions || []).map((action) => (
              <div key={action}>
                <CheckCircle2 size={15} />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>Connector Plan</h3>

          <div className="soar-handoff-connector-list">
            {(handoff.connector_plan || []).map((item) => (
              <div key={`${item.connector}-${item.action}`}>
                <section>
                  <b>{item.connector}</b>
                  <span>{item.action}</span>
                </section>

                <small>{item.risk}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="soar-handoff-warning">
        <AlertTriangle size={16} />
        <span>
          Approval is required before running destructive actions such as IP
          blocking, host isolation, account disabling, or firewall changes.
        </span>
      </div>

      <div className="soar-handoff-actions">
        <button onClick={onQueueExecution}>
          <PlayCircle size={15} />
          Queue SOAR Execution
        </button>

        <button onClick={onOpenPlaybooks}>
          <Workflow size={15} />
          Open Playbooks
        </button>

        <button onClick={onOpenExecutions}>
          <Database size={15} />
          Open Executions
        </button>
      </div>
    </div>
  );
}

export default function SOAR() {
  const [section, setSection] = useState("dashboard");
  const [siemHandoff, setSiemHandoff] = useState(null);
  const [handoffNotice, setHandoffNotice] = useState("");

  useEffect(() => {
    const handoff = readHandoff();

    if (handoff) {
      setSiemHandoff(handoff);
      setSection("executions");
    }
  }, []);

  const queueHandoffExecution = () => {
    if (!siemHandoff) return;

    const execution = createQueuedExecution(siemHandoff);

    setHandoffNotice(
      `SOAR execution ${execution.execution_id} queued from SIEM alert. Analyst approval is required before action execution.`
    );

    setSection("executions");
  };

  const clearHandoff = () => {
    localStorage.removeItem(SIEM_HANDOFF_KEY);
    localStorage.removeItem("spectrasoc_siem_soar_draft");

    setSiemHandoff(null);
    setHandoffNotice("");
  };

  return (
    <div className="soar-command-center">
      {siemHandoff && (
        <SIEMSOARHandoffBanner
          handoff={siemHandoff}
          notice={handoffNotice}
          onQueueExecution={queueHandoffExecution}
          onOpenPlaybooks={() => setSection("playbooks")}
          onOpenExecutions={() => setSection("executions")}
          onClear={clearHandoff}
        />
      )}

      <div className="soar-section-tabs">
        {[
          "dashboard",
          "playbooks",
          "executions",
          "actions",
          "ai",
          "settings",
          "demo",
        ].map((item) => (
          <button
            key={item}
            className={section === item ? "active" : ""}
            onClick={() => setSection(item)}
          >
            {label(item)}
          </button>
        ))}
      </div>

      {section === "dashboard" && (
        <SOAROverviewDashboard setSection={setSection} />
      )}

      {section === "playbooks" && <PlaybookManagement />}
      {section === "executions" && <ExecutionDashboard />}
      {section === "actions" && <ActionLibrary />}
      {section === "ai" && <AIBuilder setSection={setSection} />}
      {section === "settings" && <SOARSettings />}
      {section === "demo" && <SOARDemoMode setSection={setSection} />}
    </div>
  );
}

function label(value) {
  return {
    dashboard: "Dashboard",
    playbooks: "Playbooks",
    executions: "Executions",
    actions: "Action Library",
    ai: "AI Builder",
    settings: "Settings",
    demo: "Demo Mode",
  }[value];
}