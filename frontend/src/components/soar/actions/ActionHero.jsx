import { Bot, PlugZap, RefreshCcw, ShieldCheck, Store } from "lucide-react";

export default function ActionHero({ onRefresh, onSeed, seeding }) {
  return (
    <section className="action-hero spectra-glass-card">
      <div>
        <div className="hero-chip">
          <Store size={15} />
          SOAR Connector Marketplace
        </div>

        <h1>Enterprise Action Library</h1>

        <p>
          Manage backend-connected integrations, response actions, enrichment
          providers, notification channels, and custom automation connectors.
        </p>
      </div>

      <div className="hero-actions">
        <button className="primary-btn" onClick={onSeed} disabled={seeding}>
          <PlugZap size={17} />
          {seeding ? "Seeding..." : "Seed Defaults"}
        </button>

        <button className="secondary-btn">
          <Bot size={17} />
          AI Suggest
        </button>

        <button className="secondary-btn">
          <ShieldCheck size={17} />
          Validate
        </button>

        <button className="secondary-btn" onClick={onRefresh}>
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>
    </section>
  );
}