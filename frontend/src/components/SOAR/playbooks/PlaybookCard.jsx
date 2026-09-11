import { GitBranch, Play, ShieldAlert } from "lucide-react";

export default function PlaybookCard({ item, onOpen }) {
  return (
    <div className="spectra-glass-card playbook-card">
      <div className="playbook-card-top">
        <div>
          <span className="category">{item.category}</span>
          <h3>{item.name}</h3>
        </div>

        <span className={`playbook-status ${item.status.toLowerCase()}`}>
          {item.status}
        </span>
      </div>

      <div className="playbook-meta">
        <p>
          <ShieldAlert size={15} />
          Trigger: {item.trigger}
        </p>

        <p>
          <GitBranch size={15} />
          Version: {item.version}
        </p>
      </div>

      <div className="success-block">
        <div>
          <span>Success Rate</span>
          <b>{item.success}%</b>
        </div>

        <div className="success-bar">
          <span style={{ width: `${item.success}%` }} />
        </div>
      </div>

      <div className="playbook-footer">
        <span>{item.executions} executions</span>
        <span>Updated {item.updated}</span>
      </div>

      <button className="run-btn" onClick={onOpen}>
        <Play size={15} />
        Open Playbook
      </button>
    </div>
  );
}