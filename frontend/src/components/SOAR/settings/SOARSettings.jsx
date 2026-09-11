import { useEffect, useMemo, useState } from "react";

import SOAR_API from "../../../api/soarApi";

import SettingsHero from "./SettingsHero";
import SettingsKPIs from "./SettingsKPIs";
import WorkerSettings from "./WorkerSettings";
import QueueSettings from "./QueueSettings";
import SecuritySettings from "./SecuritySettings";
import AuditSettings from "./AuditSettings";

const defaultSettings = {
  workers_enabled: true,
  max_parallel_executions: 5,
  default_timeout_seconds: 120,
  default_retry_count: 2,
  require_approval_for_destructive_actions: true,
  enable_audit_logging: true,
  enable_ai_recommendations: true,
  queue_config: {},
  security_config: {},
  notification_config: {},
};

export default function SOARSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await SOAR_API.getSettings();
      setSettings({ ...defaultSettings, ...data });
    } catch (err) {
      console.error(err);
      setError("Unable to load SOAR settings from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (patch) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const nextSettings = {
        ...settings,
        ...patch,
      };

      const updated = await SOAR_API.updateSettings(nextSettings);

      setSettings({ ...defaultSettings, ...updated });
      setMessage("SOAR settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to update SOAR settings. Check backend logs.");
    } finally {
      setSaving(false);
    }
  };

  const metrics = useMemo(() => {
    return [
      {
        label: "Automation Workers",
        value: settings.workers_enabled ? "Enabled" : "Disabled",
        trend: `${settings.max_parallel_executions} parallel executions`,
        tone: settings.workers_enabled ? "success" : "warning",
      },
      {
        label: "Default Timeout",
        value: `${settings.default_timeout_seconds}s`,
        trend: "Execution limit",
        tone: "info",
      },
      {
        label: "Retry Count",
        value: String(settings.default_retry_count),
        trend: "Failure recovery",
        tone: "success",
      },
      {
        label: "Audit Logging",
        value: settings.enable_audit_logging ? "On" : "Off",
        trend: "Compliance control",
        tone: settings.enable_audit_logging ? "success" : "warning",
      },
    ];
  }, [settings]);

  return (
    <div className="soar-settings">
      <SettingsHero
        loading={loading}
        saving={saving}
        onRefresh={loadSettings}
        onSave={() => updateSettings(settings)}
      />

      {error && (
        <div className="spectra-glass-card" style={{ padding: "16px", color: "#ff5c7a" }}>
          {error}
        </div>
      )}

      {message && (
        <div className="spectra-glass-card" style={{ padding: "16px", color: "#00ffaa" }}>
          {message}
        </div>
      )}

      <SettingsKPIs metrics={metrics} />

      <div className="settings-layout">
        <main className="settings-main">
          <WorkerSettings
            settings={settings}
            saving={saving}
            onChange={updateSettings}
          />

          <QueueSettings
            settings={settings}
            saving={saving}
            onChange={updateSettings}
          />
        </main>

        <aside className="settings-side">
          <SecuritySettings
            settings={settings}
            saving={saving}
            onChange={updateSettings}
          />

          <AuditSettings />
        </aside>
      </div>
    </div>
  );
}