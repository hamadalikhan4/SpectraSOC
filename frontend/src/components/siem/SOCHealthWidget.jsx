import { CheckCircle2 } from "lucide-react";

export default function SOCHealthWidget() {
  const services = [
    "SIEM Engine",
    "Log Collector",
    "Threat Intel",
    "VirusTotal",
    "AbuseIPDB",
    "AI Engine",
    "Database",
    "Correlation Engine",
  ];

  return (
    <div className="siem-card overview-widget">
      <div className="siem-card-head">
        <div>
          <h3>SOC Health</h3>
          <p className="subtitle">Platform integration status.</p>
        </div>
        <span className="live-indicator">HEALTHY</span>
      </div>

      <div className="soc-health-list">
        {services.map((service) => (
          <div className="soc-health-row" key={service}>
            <span>{service}</span>
            <b>
              <CheckCircle2 size={15} />
              Operational
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}