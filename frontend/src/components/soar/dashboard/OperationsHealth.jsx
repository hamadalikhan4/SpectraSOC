import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Timer,
} from "lucide-react";

import { GlassCard, StatusBadge } from "../../ui";

export default function OperationsHealth() {
  const health = [
    { label: "Execution Engine", value: "Healthy", tone: "success", icon: Cpu },
    { label: "Approval Queue", value: "2 Pending", tone: "warning", icon: Timer },
    { label: "Action Plugins", value: "16 Ready", tone: "info", icon: Activity },
    { label: "Failed Steps", value: "2 Review", tone: "danger", icon: AlertTriangle },
  ];

  return (
    <GlassCard className="soar-panel">
      <div className="soar-panel-head">
        <div>
          <h3>Automation Health</h3>
          <p>Runtime engine, approvals, plugins, and failure status.</p>
        </div>

        <StatusBadge tone="success">Healthy</StatusBadge>
      </div>

      <div className="soar-health-grid">
        {health.map((item) => {
          const Icon = item.icon;

          return (
            <div className={`soar-health-tile ${item.tone}`} key={item.label}>
              <div>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>

              <b>{item.value}</b>
            </div>
          );
        })}
      </div>

      <div className="soar-engine-card">
        <div className="soar-engine-icon">
          <ShieldCheck size={24} />
        </div>

        <div>
          <h4>SOAR Engine Ready</h4>
          <p>
            Playbook execution, simulation, approval checks, and logging
            services are prepared for backend integration.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}