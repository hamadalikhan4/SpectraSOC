import { Cpu, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";

import { workerConfig } from "./settingsData";

export default function WorkerSettings({ settings, saving, onChange }) {
  const increaseWorkers = () => {
    onChange({
      max_parallel_executions: Number(settings.max_parallel_executions || 1) + 1,
    });
  };

  const decreaseWorkers = () => {
    onChange({
      max_parallel_executions: Math.max(
        1,
        Number(settings.max_parallel_executions || 1) - 1
      ),
    });
  };

  return (
    <div className="spectra-glass-card worker-settings">
      <div className="settings-panel-header">
        <div>
          <h2>Automation Worker Configuration</h2>
          <p>
            Manage execution workers, load, queue assignment, failover nodes, and
            backend execution capacity.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() =>
            onChange({
              workers_enabled: !settings.workers_enabled,
            })
          }
          disabled={saving}
        >
          <RotateCcw size={16} />
          {settings.workers_enabled ? "Disable Workers" : "Enable Workers"}
        </button>
      </div>

      <div className="backend-policy-card">
        <div>
          <span>Backend Worker State</span>
          <h3>{settings.workers_enabled ? "Enabled" : "Disabled"}</h3>
        </div>

        <div>
          <span>Max Parallel Executions</span>
          <h3>{settings.max_parallel_executions}</h3>
        </div>

        <div className="worker-policy-actions">
          <button onClick={decreaseWorkers} disabled={saving}>-</button>
          <button onClick={increaseWorkers} disabled={saving}>+</button>
        </div>
      </div>

      <div className="worker-grid">
        {workerConfig.map((worker) => (
          <div className="worker-card" key={worker.name}>
            <div className="worker-top">
              <div className="worker-icon">
                <Cpu size={20} />
              </div>

              <span className={`worker-status ${worker.status.toLowerCase()}`}>
                {worker.status}
              </span>
            </div>

            <h3>{worker.name}</h3>

            <div className="worker-meta">
              <div>
                <span>Load</span>
                <b>{worker.load}</b>
              </div>

              <div>
                <span>Queue</span>
                <b>{worker.queue}</b>
              </div>

              <div>
                <span>Region</span>
                <b>{worker.region}</b>
              </div>
            </div>

            <div className="worker-load-bar">
              <span style={{ width: worker.load }} />
            </div>

            <div className="worker-actions">
              <button>
                <PlayCircle size={15} />
                Start
              </button>

              <button>
                <PauseCircle size={15} />
                Pause
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}