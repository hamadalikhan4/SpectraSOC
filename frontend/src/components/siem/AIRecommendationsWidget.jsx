import { Brain, CheckCircle2 } from "lucide-react";

export default function AIRecommendationsWidget({ logs = [] }) {
  const topIp = logs[0]?.source_ip || "185.220.101.44";

  const recommendations = [
    `Block or monitor ${topIp}`,
    "Review failed login patterns",
    "Check related MITRE techniques",
    "Create incident for high-risk activity",
    "Collect host evidence if compromise is suspected",
  ];

  return (
    <div className="siem-card overview-widget">
      <div className="siem-card-head">
        <div>
          <h3>SpectraSOC Recommendations</h3>
          <p className="subtitle">Prioritized analyst actions.</p>
        </div>
        <Brain size={22} className="purple-icon" />
      </div>

      <div className="ai-rec-list">
        {recommendations.map((rec, index) => (
          <div className="ai-rec-row" key={index}>
            <CheckCircle2 size={18} />
            <span>{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}