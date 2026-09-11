import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  GitBranch,
  Layers,
  Play,
  PlugZap,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

function safeNumber(value) {
  return Number(value || 0);
}

export default function SOAROverviewDashboard({ setSection }) {
  const [overview, setOverview] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewData, executionData, connectorData, playbookData] =
        await Promise.all([
          SOAR_API.getOverview(),
          SOAR_API.getExecutions({ limit: 5 }),
          SOAR_API.getConnectors({ limit: 6 }),
          SOAR_API.getPlaybooks({ limit: 6 }),
        ]);

      setOverview(overviewData);
      setExecutions(executionData || []);
      setConnectors(connectorData || []);
      setPlaybooks(playbookData || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load SOAR dashboard from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const playbookStats = overview?.playbooks || {};
    const executionStats = overview?.executions || {};
    const connectorStats = overview?.connectors || {};

    return [
      {
        label: "Total Playbooks",
        value: String(safeNumber(playbookStats.total)),
        trend: `${safeNumber(playbookStats.active)} active`,
        icon: GitBranch,
        tone: "success",
      },
      {
        label: "Running Executions",
        value: String(safeNumber(executionStats.running)),
        trend: `${safeNumber(executionStats.queued)} queued`,
        icon: Activity,
        tone: "info",
      },
      {
        label: "Success Rate",
        value: `${safeNumber(executionStats.success_rate)}%`,
        trend: `${safeNumber(executionStats.completed)} completed`,
        icon: CheckCircle2,
        tone: "success",
      },
      {
        label: "Failed Runs",
        value: String(safeNumber(executionStats.failed)),
        trend: "Backend tracked",
        icon: AlertTriangle,
        tone: "danger",
      },
      {
        label: "Connectors",
        value: String(safeNumber(connectorStats.total)),
        trend: `${safeNumber(connectorStats.connected)} connected`,
        icon: PlugZap,
        tone: "success",
      },
      {
        label: "AI Recommendations",
        value: overview?.settings?.ai_recommendations ? "On" : "Off",
        trend: "SpectraAI",
        icon: Bot,
        tone: "info",
      },
    ];
  }, [overview]);

  return (
    <div className="soar-overview-dashboard">
      <section className="soar-overview-hero spectra-glass-card">
        <div>
          <div className="hero-chip">
            <Sparkles size={15} />
            SpectraSOC SOAR Control Center
          </div>

          <h1>Enterprise SOAR Automation Dashboard</h1>

          <p>
            Monitor playbooks, executions, connectors, workers, AI recommendations,
            and automation readiness directly from FastAPI and PostgreSQL.
          </p>
        </div>

        <div className="hero-actions">
          <button className="primary-btn" onClick={() => setSection("playbooks")}>
            <Zap size={17} />
            Build Playbook
          </button>

          <button className="secondary-btn" onClick={() => setSection("executions")}>
            <Play size={17} />
            View Executions
          </button>

          <button className="secondary-btn" onClick={loadDashboard} disabled={loading}>
            <RefreshCcw size={17} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </section>

      {error && (
        <div className="spectra-glass-card" style={{ padding: "16px", color: "#ff5c7a" }}>
          {error}
        </div>
      )}

      <div className="soar-overview-kpi-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              className={`spectra-glass-card soar-overview-kpi ${metric.tone}`}
              key={metric.label}
            >
              <Icon size={22} />

              <div>
                <p>{metric.label}</p>
                <h2>{metric.value}</h2>
                <span>{metric.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="soar-overview-layout">
        <main className="soar-overview-main">
          <div className="spectra-glass-card soar-overview-panel">
            <div className="soar-panel-header">
              <div>
                <h2>Automation Operations Health</h2>
                <p>Backend SOAR engine readiness and platform controls</p>
              </div>

              <button className="details-btn" onClick={() => setSection("settings")}>
                <Settings size={15} />
                Settings
              </button>
            </div>

            <div className="operations-health-grid">
              <HealthItem
                icon={ShieldCheck}
                title="Worker Engine"
                value={overview?.settings?.workers_enabled ? "Enabled" : "Disabled"}
                detail={`${overview?.settings?.max_parallel_executions || 0} max parallel executions`}
                good={overview?.settings?.workers_enabled}
              />

              <HealthItem
                icon={Layers}
                title="Audit Logging"
                value={overview?.settings?.audit_logging ? "Enabled" : "Disabled"}
                detail="Compliance event visibility"
                good={overview?.settings?.audit_logging}
              />

              <HealthItem
                icon={Bot}
                title="AI Recommendations"
                value={overview?.settings?.ai_recommendations ? "Enabled" : "Disabled"}
                detail="Optimization and builder support"
                good={overview?.settings?.ai_recommendations}
              />
            </div>
          </div>

          <div className="spectra-glass-card soar-overview-panel">
            <div className="soar-panel-header">
              <div>
                <h2>Recent Executions</h2>
                <p>Latest SOAR automation runs from backend</p>
              </div>

              <button className="details-btn" onClick={() => setSection("executions")}>
                View All
              </button>
            </div>

            <div className="overview-execution-list">
              {executions.length === 0 ? (
                <p className="subtitle">No executions yet. Run a playbook first.</p>
              ) : (
                executions.map((execution) => (
                  <div className="overview-execution-row" key={execution.id}>
                    <div>
                      <b>{execution.execution_id}</b>
                      <span>{execution.playbook_name || "Unknown Playbook"}</span>
                    </div>

                    <span className={`execution-status ${String(execution.status).toLowerCase()}`}>
                      {execution.status}
                    </span>

                    <p>{execution.progress || 0}%</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <aside className="soar-overview-side">
          <div className="spectra-glass-card soar-overview-panel">
            <div className="soar-panel-header">
              <div>
                <h2>Connector Readiness</h2>
                <p>Action providers available to automation workflows</p>
              </div>

              <button className="details-btn" onClick={() => setSection("actions")}>
                Manage
              </button>
            </div>

            <div className="overview-connector-list">
              {connectors.length === 0 ? (
                <p className="subtitle">No connectors seeded yet.</p>
              ) : (
                connectors.map((connector) => (
                  <div className="overview-connector-row" key={connector.id}>
                    <span />
                    <div>
                      <b>{connector.name}</b>
                      <p>{connector.category || "Connector"}</p>
                    </div>

                    <em>{connector.status}</em>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="spectra-glass-card soar-overview-panel">
            <div className="soar-panel-header">
              <div>
                <h2>Playbook Inventory</h2>
                <p>Recently updated automations</p>
              </div>

              <button className="details-btn" onClick={() => setSection("playbooks")}>
                Open
              </button>
            </div>

            <div className="overview-playbook-list">
              {playbooks.length === 0 ? (
                <p className="subtitle">No playbooks created yet.</p>
              ) : (
                playbooks.map((playbook) => (
                  <div className="overview-playbook-row" key={playbook.id}>
                    <div>
                      <b>{playbook.name}</b>
                      <p>{playbook.category || "SOAR"}</p>
                    </div>

                    <span className={`playbook-status ${String(playbook.status).toLowerCase()}`}>
                      {playbook.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HealthItem({ icon: Icon, title, value, detail, good }) {
  return (
    <div className="operation-health-item">
      <div className={good ? "operation-health-icon good" : "operation-health-icon warning"}>
        <Icon size={20} />
      </div>

      <div>
        <h3>{title}</h3>
        <b>{value}</b>
        <p>{detail}</p>
      </div>
    </div>
  );
}