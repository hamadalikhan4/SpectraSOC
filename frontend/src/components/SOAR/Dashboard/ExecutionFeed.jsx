import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlayCircle,
} from "lucide-react";

import { GlassCard, StatusBadge } from "../../ui";

export default function ExecutionFeed() {
  const feed = [
    {
      time: "Just now",
      title: "Malware Hash Enrichment",
      detail: "Execution started in simulation mode.",
      type: "running",
    },
    {
      time: "3 min ago",
      title: "Critical IOC Response",
      detail: "Completed successfully in 2.4 seconds.",
      type: "success",
    },
    {
      time: "9 min ago",
      title: "Phishing Email Triage",
      detail: "Waiting for SOC Lead approval.",
      type: "warning",
    },
    {
      time: "12 min ago",
      title: "Incident Report Automation",
      detail: "Failed at PDF generation step.",
      type: "danger",
    },
  ];

  return (
    <GlassCard className="soar-panel">
      <div className="soar-panel-head">
        <div>
          <h3>Live Execution Feed</h3>
          <p>Recent playbook activity and automation outcomes.</p>
        </div>

        <StatusBadge tone="info">Live</StatusBadge>
      </div>

      <div className="soar-feed-list">
        {feed.map((item, index) => {
          const Icon = getIcon(item.type);

          return (
            <div className="soar-feed-item" key={index}>
              <div className={`soar-feed-icon ${item.type}`}>
                <Icon size={17} />
              </div>

              <div className="soar-feed-body">
                <div>
                  <h4>{item.title}</h4>
                  <span>{item.time}</span>
                </div>

                <p>{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function getIcon(type) {
  if (type === "success") return CheckCircle2;
  if (type === "warning") return Clock;
  if (type === "danger") return AlertTriangle;
  return PlayCircle;
}