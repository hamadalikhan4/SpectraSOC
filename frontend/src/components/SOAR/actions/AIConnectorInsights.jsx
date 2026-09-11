import { Bot, Sparkles } from "lucide-react";

import { aiConnectorInsights } from "./actionData";

export default function AIConnectorInsights() {
  return (
    <div className="spectra-glass-card ai-connector-insights">
      <div className="panel-title">
        <Bot size={18} />
        AI Connector Insights
      </div>

      <p className="ai-subtitle">
        SpectraAI evaluates connector health, security risk, and automation gaps.
      </p>

      <div className="insight-list">
        {aiConnectorInsights.map((insight) => (
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
        Generate Connector Plan
      </button>
    </div>
  );
}