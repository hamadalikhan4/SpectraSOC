import {
  CheckCircle2,
  Clock3,
  PlayCircle,
  Workflow,
  XCircle,
} from "lucide-react";

import { MetricCard } from "../../ui";

export default function MetricsGrid() {
  const metrics = [
    {
      label: "Active Playbooks",
      value: "18",
      subtext: "+3 added this week",
      icon: <Workflow size={22} />,
      tone: "info",
    },
    {
      label: "Executions Today",
      value: "54",
      subtext: "3 currently running",
      icon: <PlayCircle size={22} />,
      tone: "success",
    },
    {
      label: "Success Rate",
      value: "98.4%",
      subtext: "Last 24 hours",
      icon: <CheckCircle2 size={22} />,
      tone: "success",
    },
    {
      label: "Avg Runtime",
      value: "1.8s",
      subtext: "Across all playbooks",
      icon: <Clock3 size={22} />,
      tone: "info",
    },
    {
      label: "Failed Actions",
      value: "2",
      subtext: "Needs analyst review",
      icon: <XCircle size={22} />,
      tone: "danger",
    },
  ];

  return (
    <div className="soar-metrics-row">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          subtext={metric.subtext}
          tone={metric.tone}
        />
      ))}
    </div>
  );
}