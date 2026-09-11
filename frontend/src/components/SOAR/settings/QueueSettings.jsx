import { ListChecks, TimerReset } from "lucide-react";

import { queueConfig } from "./settingsData";

export default function QueueSettings({ settings, saving, onChange }) {
  const updateTimeout = (value) => {
    onChange({
      default_timeout_seconds: Math.max(30, Number(value)),
    });
  };

  const updateRetries = (value) => {
    onChange({
      default_retry_count: Math.max(0, Number(value)),
    });
  };

  return (
    <div className="spectra-glass-card queue-settings">
      <div className="settings-panel-header">
        <div>
          <h2>Queue & Retry Policies</h2>
          <p>
            Define execution priorities, retries, timeout limits, and worker
            routing connected to backend SOAR settings.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() =>
            onChange({
              default_timeout_seconds: 120,
              default_retry_count: 2,
            })
          }
          disabled={saving}
        >
          <TimerReset size={16} />
          Reset Policy
        </button>
      </div>

      <div className="backend-policy-card">
        <div>
          <span>Default Timeout</span>
          <h3>{settings.default_timeout_seconds}s</h3>
        </div>

        <div>
          <span>Default Retry Count</span>
          <h3>{settings.default_retry_count}</h3>
        </div>

        <div className="policy-inputs">
          <label>
            Timeout
            <input
              type="number"
              value={settings.default_timeout_seconds}
              onChange={(e) => updateTimeout(e.target.value)}
              disabled={saving}
            />
          </label>

          <label>
            Retries
            <input
              type="number"
              value={settings.default_retry_count}
              onChange={(e) => updateRetries(e.target.value)}
              disabled={saving}
            />
          </label>
        </div>
      </div>

      <div className="queue-list">
        {queueConfig.map((queue) => (
          <div className="queue-card" key={queue.name}>
            <div className="queue-icon">
              <ListChecks size={18} />
            </div>

            <div>
              <h3>{queue.name}</h3>
              <p>{queue.description}</p>

              <div className="queue-meta">
                <span>{queue.workers} workers</span>
                <span>{queue.maxRetries} retries</span>
                <span>{queue.timeout} timeout</span>
              </div>
            </div>

            <button className="queue-edit-btn">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}