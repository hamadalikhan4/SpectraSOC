import { Bot, BrainCircuit, Sparkles, WandSparkles } from "lucide-react";

export default function AIBuilderHero() {
  return (
    <section className="ai-builder-hero spectra-glass-card">
      <div>
        <div className="hero-chip">
          <BrainCircuit size={15} />
          SpectraAI Automation Builder
        </div>

        <h1>Enterprise AI Playbook Builder</h1>

        <p>
          Convert natural language incident response requirements into structured
          SOAR playbooks with workflow steps, connector requirements, MITRE
          mapping, and safety validation.
        </p>
      </div>

      <div className="hero-actions">
        <button className="primary-btn">
          <WandSparkles size={17} />
          Generate Workflow
        </button>

        <button className="secondary-btn">
          <Bot size={17} />
          Ask SpectraAI
        </button>

        <button className="secondary-btn">
          <Sparkles size={17} />
          Optimize
        </button>
      </div>
    </section>
  );
}