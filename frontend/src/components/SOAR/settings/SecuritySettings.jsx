import { Bot, KeyRound, Lock, ShieldAlert, ShieldCheck } from "lucide-react";

export default function SecuritySettings({ settings, saving, onChange }) {
  return (
    <div className="spectra-glass-card security-settings">
      <div className="panel-title">
        <ShieldCheck size={18} />
        Security Controls
      </div>

      <p className="settings-subtitle">
        Production-grade SOAR requires strict RBAC, secret handling, action
        approval, AI safety, and audit visibility.
      </p>

      <div className="security-control-list">
        <SecurityControl
          icon={Lock}
          title="Require Approval for Destructive Actions"
          detail="Endpoint isolation, account lockout, and delete operations require analyst approval."
          enabled={settings.require_approval_for_destructive_actions}
          disabled={saving}
          onClick={() =>
            onChange({
              require_approval_for_destructive_actions:
                !settings.require_approval_for_destructive_actions,
            })
          }
        />

        <SecurityControl
          icon={KeyRound}
          title="Encrypted Secret Storage"
          detail="API keys and connector credentials will be stored using encrypted backend vaulting."
          enabled
          disabled
        />

        <SecurityControl
          icon={ShieldAlert}
          title="Audit Logging"
          detail="Every playbook execution, connector call, and configuration change should be audit tracked."
          enabled={settings.enable_audit_logging}
          disabled={saving}
          onClick={() =>
            onChange({
              enable_audit_logging: !settings.enable_audit_logging,
            })
          }
        />

        <SecurityControl
          icon={Bot}
          title="AI Recommendations"
          detail="Allow SpectraAI to generate optimization, validation, and playbook improvement suggestions."
          enabled={settings.enable_ai_recommendations}
          disabled={saving}
          onClick={() =>
            onChange({
              enable_ai_recommendations: !settings.enable_ai_recommendations,
            })
          }
        />

        <SecurityControl
          icon={ShieldCheck}
          title="RBAC Enforcement"
          detail="Only Admin and Analyst roles can execute or modify SOAR playbooks."
          enabled
          disabled
        />
      </div>
    </div>
  );
}

function SecurityControl({ icon: Icon, title, detail, enabled, disabled, onClick }) {
  return (
    <div className="security-control">
      <div className="security-control-icon">
        <Icon size={16} />
      </div>

      <div>
        <h4>{title}</h4>
        <p>{detail}</p>
      </div>

      <button
        className={enabled ? "toggle enabled" : "toggle"}
        onClick={onClick}
        disabled={disabled}
        type="button"
      >
        <i />
      </button>
    </div>
  );
}