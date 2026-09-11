import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  PlugZap,
} from "lucide-react";

const icons = [PlugZap, CheckCircle2, Activity, AlertTriangle];

export default function ActionKPIs({ metrics = [] }) {
  return (
    <div className="action-kpi-grid">
      {metrics.map((metric, index) => {
        const Icon = icons[index] || PlugZap;

        return (
          <div
            className={`spectra-glass-card action-kpi ${metric.tone}`}
            key={metric.label}
          >
            <Icon size={22} />

            <div>
              <p>{metric.label}</p>
              <h2>{metric.value}</h2>
              <span>{metric.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}