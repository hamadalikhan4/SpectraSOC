import {
  KeyRound,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

export default function SettingsHero({ loading, saving, onRefresh, onSave }) {
  return (
    <section className="settings-hero spectra-glass-card">
      <div>
        <div className="hero-chip">
          <Settings size={15} />
          SOAR Control Plane
        </div>

        <h1>Enterprise SOAR Settings</h1>

        <p>
          Configure backend-connected automation workers, queue policies, retry
          behavior, secret handling, RBAC controls, audit logging, and production
          safety settings.
        </p>
      </div>

      <div className="hero-actions">
        <button className="primary-btn" onClick={onSave} disabled={saving}>
          <Save size={17} />
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <button className="secondary-btn">
          <ShieldCheck size={17} />
          Validate
        </button>

        <button className="secondary-btn">
          <KeyRound size={17} />
          Rotate Secrets
        </button>

        <button className="secondary-btn">
          <SlidersHorizontal size={17} />
          Advanced
        </button>

        <button className="secondary-btn" onClick={onRefresh} disabled={loading}>
          <RefreshCcw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
    </section>
  );
}