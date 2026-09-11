import { useEffect, useMemo, useState } from "react";
import { Filter, RefreshCcw, Search } from "lucide-react";

import SOAR_API from "../../../api/soarApi";

import ActionHero from "./ActionHero";
import ActionKPIs from "./ActionKPIs";
import ConnectorGrid from "./ConnectorGrid";
import ActionDetailsDrawer from "./ActionDetailsDrawer";
import AIConnectorInsights from "./AIConnectorInsights";

function normalizeConnector(connector) {
  return {
    ...connector,
    name: connector.name,
    category: connector.category || "Custom Automation",
    status: connector.status || "Available",
    health: connector.health || "Ready",
    description: connector.description || "SOAR connector for automation actions.",
    auth: connector.auth_type || "Not configured",
    actions: connector.actions_count || 0,
    executions: connector.executions_count || 0,
    lastUsed: connector.last_used_at
      ? new Date(connector.last_used_at).toLocaleString()
      : "Never",
    capabilities: connector.capabilities || [],
    risk: connector.risk_level || "Low",
  };
}

export default function ActionLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [connectors, setConnectors] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const loadConnectors = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await SOAR_API.getConnectors();
      setConnectors(data.map(normalizeConnector));
    } catch (err) {
      console.error(err);
      setError("Unable to load SOAR connectors from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnectors();
  }, []);

  const seedConnectors = async () => {
    try {
      setSeeding(true);
      setError("");

      await SOAR_API.seedConnectors();
      await loadConnectors();
    } catch (err) {
      console.error(err);
      setError("Failed to seed default connectors. Check backend logs.");
    } finally {
      setSeeding(false);
    }
  };

  const categories = useMemo(() => {
    return ["All", ...new Set(connectors.map((item) => item.category))];
  }, [connectors]);

  const filteredConnectors = useMemo(() => {
    return connectors.filter((connector) => {
      const matchesSearch =
        connector.name?.toLowerCase().includes(query.toLowerCase()) ||
        connector.category?.toLowerCase().includes(query.toLowerCase()) ||
        connector.description?.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        category === "All" || connector.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [query, category, connectors]);

  const metrics = useMemo(() => {
    const total = connectors.length;
    const connected = connectors.filter((item) => item.status === "Connected").length;
    const actions = connectors.reduce(
      (sum, item) => sum + Number(item.actions || 0),
      0
    );
    const failed = connectors.filter(
      (item) =>
        item.health === "Error" ||
        item.health === "Failed" ||
        item.status === "Disconnected"
    ).length;

    return [
      {
        label: "Total Connectors",
        value: String(total),
        trend: "Backend connected",
        tone: "success",
      },
      {
        label: "Connected",
        value: String(connected),
        trend: `${total ? Math.round((connected / total) * 100) : 0}% active`,
        tone: "success",
      },
      {
        label: "Available Actions",
        value: String(actions),
        trend: "Across providers",
        tone: "info",
      },
      {
        label: "Failed Actions",
        value: String(failed),
        trend: "Health monitored",
        tone: "danger",
      },
    ];
  }, [connectors]);

  return (
    <div className="action-library">
      <ActionHero
        onRefresh={loadConnectors}
        onSeed={seedConnectors}
        seeding={seeding}
      />

      {error && (
        <div className="spectra-glass-card" style={{ padding: "16px", color: "#ff5c7a" }}>
          {error}
        </div>
      )}

      <ActionKPIs metrics={metrics} />

      <div className="action-layout">
        <main className="action-main">
          <div className="spectra-glass-card action-toolbar">
            <div className="search-wrap">
              <Search size={18} />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search backend connectors, actions, integrations..."
              />
            </div>

            <div className="filter-wrap">
              <Filter size={17} />

              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}

              <button onClick={loadConnectors}>
                <RefreshCcw size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="spectra-glass-card" style={{ padding: "24px" }}>
              Loading SOAR connectors...
            </div>
          ) : filteredConnectors.length === 0 ? (
            <div className="spectra-glass-card" style={{ padding: "24px" }}>
              <h2>No connectors found</h2>
              <p className="subtitle">
                Click Seed Defaults to add VirusTotal, AbuseIPDB, Microsoft Defender,
                and Webhook connectors from the backend.
              </p>
            </div>
          ) : (
            <ConnectorGrid
              connectors={filteredConnectors}
              onOpen={setSelectedConnector}
            />
          )}
        </main>

        <aside className="action-side">
          <AIConnectorInsights />
        </aside>
      </div>

      {selectedConnector && (
        <ActionDetailsDrawer
          connector={selectedConnector}
          onClose={() => setSelectedConnector(null)}
          onRefresh={loadConnectors}
        />
      )}
    </div>
  );
}