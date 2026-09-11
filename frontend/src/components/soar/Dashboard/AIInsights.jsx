import {
  Brain,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { GlassCard, StatusBadge } from "../../ui";

export default function AIInsights() {
  const insights = [
    {
      icon: ShieldAlert,
      title: "Critical IOC Coverage",
      text: "Three critical IOC incidents were handled manually. Consider enabling the Critical IOC Response playbook.",
    },
    {
      icon: Lightbulb,
      title: "Optimization Opportunity",
      text: "PDF report generation is the slowest step in recent executions. Add retry and fallback handling.",
    },
  ];

  return (
    <GlassCard className="soar-panel">
      <div className="soar-panel-head">
        <div>
          <h3>AI Automation Insights</h3>
          <p>Context-aware recommendations for improving response workflows.</p>
        </div>

        <StatusBadge tone="info">AI Ready</StatusBadge>
      </div>

      <div className="soar-ai-hero">
        <div className="soar-ai-icon">
          <Brain size={24} />
        </div>

        <div>
          <h4>SOAR Copilot</h4>
          <p>
            AI can suggest playbooks, explain execution failures, optimize
            workflows, and generate response automation from natural language.
          </p>
        </div>
      </div>

      <div className="soar-insight-list">
        {insights.map((item) => {
          const Icon = item.icon;

          return (
            <div className="soar-insight-item" key={item.title}>
              <Sparkles size={16} />
              <div>
                <b>{item.title}</b>
                <p>{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}