import { Brain, Biohazard, Activity } from "lucide-react";

export default function ZeroDayWidget({ count = 0 }) {
  const behaviorScore = count > 0 ? 78 : 22;
  const confidence = count > 0 ? 91 : 36;

  return (
    <div className="siem-card overview-widget">
      <div className="siem-card-head">
        <div>
          <h3>Zero-Day Watch</h3>
          <p className="subtitle">Behavior-based unknown threat scoring.</p>
        </div>
        <Biohazard size={22} className="purple-icon" />
      </div>

      <div className="zero-meter">
        <div style={{ width: `${behaviorScore}%` }}></div>
      </div>

      <div className="zero-grid">
        <Mini label="Behavior Score" value={behaviorScore} icon={<Activity size={18} />} />
        <Mini label="AI Confidence" value={`${confidence}%`} icon={<Brain size={18} />} />
        <Mini label="Suspicious Events" value={count} icon={<Biohazard size={18} />} />
      </div>

      <p className="subtitle">
        Unknown IOC + abnormal behavior increases zero-day suspicion.
      </p>
    </div>
  );
}

function Mini({ label, value, icon }) {
  return (
    <div className="zero-mini">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}