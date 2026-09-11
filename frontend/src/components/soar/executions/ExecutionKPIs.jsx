import { Download, Play, Radio, RefreshCcw, Square } from "lucide-react";

export default function ExecutionHero({ onRefresh }) {
  return (
    <section className="execution-hero spectra-glass-card">
      <div>
        <div className="hero-chip">
          <Radio size={15} />
          Live SOAR Operations
        </div>

        <h1>Enterprise Execution Center</h1>

        <p>
          Monitor automation runs, inspect workflow progress, review logs, and
          investigate failed playbook executions directly from the SOAR backend.
        </p>
      </div>

      <div className="hero-actions">
        <button className="primary-btn">
          <Play size={17} />
          Run Playbook
        </button>

        <button className="secondary-btn">
          <Square size={16} />
          Stop Execution
        </button>

        <button className="secondary-btn">
          <Download size={16} />
          Export Logs
        </button>

        <button className="secondary-btn" onClick={onRefresh}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>
    </section>
  );
}