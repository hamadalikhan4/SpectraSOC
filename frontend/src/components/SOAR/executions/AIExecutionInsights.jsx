import { Bot, Sparkles } from "lucide-react";

export default function AIExecutionInsights() {
  const insights = [
    {
      title: "Backend Execution Tracking Active",
      detail:
        "SOAR execution records are now loaded from FastAPI and PostgreSQL.",
    },
    {
      title: "Worker Simulation Available",
      detail:
        "Use the Sim button in the execution table to update execution progress.",
    },
    {
      title: "Next Enterprise Upgrade",
      detail:
        "Later we will add WebSocket live updates and a real async worker engine.",
    },
  ];

  return (
    <div className="spectra-glass-card ai-execution-insights">
      <div className="panel-title">
        <Bot size={18} />
        AI Execution Insights
      </div>

      <p className="ai-subtitle">
        SpectraAI analyzes execution performance, failure patterns, and SOAR
        automation readiness.
      </p>

      <div className="insight-list">
        {insights.map((insight) => (
          <div className="insight-card" key={insight.title}>
            <div>
              <Sparkles size={16} />
              <h4>{insight.title}</h4>
            </div>

            <p>{insight.detail}</p>
          </div>
        ))}
      </div>

      <button className="secondary-btn full-width-btn">
        Generate Optimization Report
      </button>
    </div>
  );
}