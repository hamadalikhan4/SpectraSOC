import { FileText, Terminal, X } from "lucide-react";

import ExecutionTimeline from "./ExecutionTimeline";

export default function ExecutionDetailsDrawer({ execution, onClose }) {
  return (
    <div className="execution-drawer-backdrop">
      <aside className="execution-drawer">
        <div className="drawer-header">
          <div>
            <span className={`execution-status ${execution.status.toLowerCase()}`}>
              {execution.status}
            </span>

            <h2>{execution.execution_id}</h2>

            <p>{execution.playbook}</p>
          </div>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-summary-grid">
          <div>
            <span>Severity</span>
            <b>{execution.severity}</b>
          </div>

          <div>
            <span>Duration</span>
            <b>{execution.duration}</b>
          </div>

          <div>
            <span>Incident</span>
            <b>{execution.incident}</b>
          </div>

          <div>
            <span>Progress</span>
            <b>{execution.progress}%</b>
          </div>
        </div>

        <div className="drawer-section">
          <div className="panel-title">
            <FileText size={18} />
            Execution Timeline
          </div>

          <ExecutionTimeline steps={execution.steps} />
        </div>

        <div className="drawer-section">
          <div className="panel-title">
            <Terminal size={18} />
            Raw Execution Logs
          </div>

          <div className="execution-log-terminal">
            {(execution.logs || []).map((log, index) => (
              <p key={`${log}-${index}`}>{log}</p>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}