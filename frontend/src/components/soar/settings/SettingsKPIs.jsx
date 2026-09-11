import {
  Activity,
  DatabaseZap,
  KeyRound,
  ListChecks,
} from "lucide-react";

const icons = [DatabaseZap, Activity, KeyRound, ListChecks];

export default function SettingsKPIs({ metrics = [] }) {
  return (
    <div className="settings-kpi-grid">
      {metrics.map((metric, index) => {
        const Icon = icons[index] || Activity;

        return (
          <div
            className={`spectra-glass-card settings-kpi ${metric.tone}`}
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