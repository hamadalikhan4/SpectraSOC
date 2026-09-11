import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  PlusCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";
import KPI from "./KPI";
import PlaybookCard from "./PlaybookCard";
import PlaybookBuilder from "./PlaybookBuilder";
import PlaybookTemplates from "../templates/PlaybookTemplates.jsx";

function formatDate(value) {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "Recently";
  }
}

function normalizePlaybook(item) {
  return {
    id: item.id,
    name: item.name || "Untitled Playbook",
    description: item.description || "No description available.",
    category: item.category || "General",
    status: item.status || "Draft",
    severity: item.severity || "Medium",
    trigger: item.trigger_source || item.trigger_type || "Manual",
    trigger_type: item.trigger_type || "Manual",
    trigger_source: item.trigger_source || "SOAR Engine",
    version: item.version || "1.0",
    success: item.success_rate ?? item.success ?? 0,
    executions: item.execution_count ?? item.executions_count ?? item.executions ?? 0,
    updated: formatDate(item.updated_at || item.created_at),
    updated_at: item.updated_at,
    created_at: item.created_at,
    is_active: item.is_active ?? true,
    tags: item.tags || [],
    steps: item.steps || [],
    raw: item,
  };
}

function buildDemoPlaybookPayload() {
  return {
    name: "Suspicious Email IOC Triage",
    description:
      "Automated phishing investigation workflow for suspicious email alerts, IOC extraction, enrichment, analyst notification, and reporting.",
    category: "Email Security",
    status: "Draft",
    severity: "High",
    trigger_type: "Email Alert",
    trigger_source: "Email Gateway",
    is_active: true,
    version: "1.0",
    tags: ["phishing", "email", "ioc", "triage"],
    steps: [
      {
        step_order: 1,
        step_type: "Trigger",
        name: "Suspicious Email Alert",
        action_key: "email.trigger",
        connector_name: "Email Gateway",
        config: {
          source: "reported_email",
          priority: "high",
        },
        condition: {},
      },
      {
        step_order: 2,
        step_type: "Action",
        name: "Extract Indicators",
        action_key: "email.extract_indicators",
        connector_name: "SOAR Engine",
        config: {
          extract_urls: true,
          extract_ips: true,
          extract_hashes: true,
        },
        condition: {},
      },
      {
        step_order: 3,
        step_type: "Action",
        name: "Enrich IOCs",
        action_key: "threatintel.enrich_iocs",
        connector_name: "VirusTotal",
        config: {
          include_reputation: true,
          include_votes: true,
        },
        condition: {},
      },
      {
        step_order: 4,
        step_type: "Decision",
        name: "Malicious IOC Found?",
        action_key: "decision.malicious_ioc",
        connector_name: "SOAR Engine",
        config: {},
        condition: {
          field: "risk_score",
          operator: ">=",
          value: 70,
        },
      },
      {
        step_order: 5,
        step_type: "Action",
        name: "Create Investigation Summary",
        action_key: "incident.create_summary",
        connector_name: "SOAR Engine",
        config: {
          include_iocs: true,
          include_recommendations: true,
        },
        condition: {},
      },
      {
        step_order: 6,
        step_type: "Action",
        name: "Notify SOC Analyst",
        action_key: "notification.soc_analyst",
        connector_name: "Webhook",
        config: {
          priority: "high",
        },
        condition: {},
      },
    ],
  };
}

export default function PlaybookManagement() {
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPlaybooks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await SOAR_API.getPlaybooks({ limit: 100 });
      const normalized = Array.isArray(data) ? data.map(normalizePlaybook) : [];

      setPlaybooks(normalized);
    } catch (err) {
      console.error(err);
      setError("Failed to load SOAR playbooks from backend.");
    } finally {
      setLoading(false);
    }
  };

  const createDemoPlaybook = async () => {
    try {
      setCreating(true);
      setError("");
      setSuccessMessage("");

      const created = await SOAR_API.createPlaybook(buildDemoPlaybookPayload());
      const normalized = normalizePlaybook(created);

      await loadPlaybooks();

      setSuccessMessage(`Playbook "${normalized.name}" created successfully.`);
      setSelectedPlaybook(normalized);
    } catch (err) {
      console.error(err);
      setError("Failed to create demo SOAR playbook.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(playbooks.map((item) => item.category).filter(Boolean)),
    ];
  }, [playbooks]);

  const filteredPlaybooks = useMemo(() => {
    const query = search.toLowerCase();

    return playbooks.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.trigger.toLowerCase().includes(query) ||
        item.tags.join(" ").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [playbooks, search, statusFilter, categoryFilter]);

  const metrics = useMemo(() => {
    const total = playbooks.length;
    const active = playbooks.filter((item) => item.is_active).length;
    const drafts = playbooks.filter((item) => item.status === "Draft").length;

    const totalSteps = playbooks.reduce(
      (sum, item) => sum + (item.steps?.length || 0),
      0
    );

    const totalExecutions = playbooks.reduce(
      (sum, item) => sum + Number(item.executions || 0),
      0
    );

    return {
      total,
      active,
      drafts,
      totalSteps,
      totalExecutions,
    };
  }, [playbooks]);

  const handleTemplateCreated = async (createdPlaybook, template) => {
    const normalized = normalizePlaybook(createdPlaybook);

    setShowTemplates(false);
    setSuccessMessage(
      `Template "${
        template?.name || normalized.name
      }" created successfully and opened in Playbook Builder.`
    );

    await loadPlaybooks();
    setSelectedPlaybook(normalized);
  };

  if (showTemplates) {
    return (
      <PlaybookTemplates
        onClose={() => setShowTemplates(false)}
        onCreated={handleTemplateCreated}
      />
    );
  }

  if (selectedPlaybook) {
    return (
      <PlaybookBuilder
        playbook={selectedPlaybook.raw || selectedPlaybook}
        successMessage={successMessage}
        onBack={() => {
          setSelectedPlaybook(null);
          loadPlaybooks();
        }}
        onSaved={() => {
          setSelectedPlaybook(null);
          loadPlaybooks();
          setSuccessMessage("Playbook workflow saved successfully.");
        }}
      />
    );
  }

  return (
    <div className="playbook-management">
      <div className="playbook-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <Workflow size={15} />
            SOAR Automation Studio
          </span>

          <h1>Enterprise Playbook Management</h1>

          <p>
            Build, manage, test, and launch security automation workflows with
            backend-connected playbooks, visual workflow design, templates, and
            execution tracking.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="secondary-btn"
            onClick={() => {
              setSuccessMessage("");
              setShowTemplates(true);
            }}
          >
            <Sparkles size={16} />
            Templates Library
          </button>

          <button
            className="secondary-btn"
            onClick={loadPlaybooks}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
            Refresh
          </button>

          <button
            className="primary-btn"
            onClick={createDemoPlaybook}
            disabled={creating}
          >
            {creating ? <Loader2 size={16} /> : <PlusCircle size={16} />}
            Create Playbook
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="spectra-glass-card playbook-success-banner">
          <CheckCircle2 size={17} />
          <span>{successMessage}</span>

          <button onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="spectra-glass-card playbook-error-banner">
          <AlertTriangle size={17} />
          {error}
        </div>
      )}

      <div className="playbook-kpi-grid">
        <KPI label="Total Playbooks" value={metrics.total} trend="Backend synced" />
        <KPI label="Active Workflows" value={metrics.active} trend="Ready to run" />
        <KPI label="Drafts" value={metrics.drafts} trend="Under design" />
        <KPI label="Workflow Steps" value={metrics.totalSteps} trend="Automation blocks" />
        <KPI label="Executions" value={metrics.totalExecutions} trend="Total runs" />
      </div>

      <div className="spectra-glass-card playbook-control-card">
        <div className="playbook-control-left">
          <h2>Playbook Inventory</h2>
          <p>
            Browse backend-connected playbooks or create enterprise-ready
            workflows from the templates library.
          </p>
        </div>

        <div className="playbook-control-actions">
          <div className="playbook-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search playbooks..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Draft</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Published</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spectra-glass-card playbook-empty-state">
          <Loader2 size={22} />
          <h3>Loading SOAR playbooks...</h3>
          <p>Fetching playbooks directly from the backend.</p>
        </div>
      ) : filteredPlaybooks.length === 0 ? (
        <div className="spectra-glass-card playbook-empty-state">
          <Bot size={24} />
          <h3>No playbooks found</h3>
          <p>
            Create a playbook manually or use the enterprise templates library
            to generate a ready-made workflow.
          </p>

          <div className="empty-actions">
            <button
              className="secondary-btn"
              onClick={() => {
                setSuccessMessage("");
                setShowTemplates(true);
              }}
            >
              <Sparkles size={16} />
              Open Templates
            </button>

            <button
              className="primary-btn"
              onClick={createDemoPlaybook}
              disabled={creating}
            >
              {creating ? <Loader2 size={16} /> : <PlusCircle size={16} />}
              Create Demo Playbook
            </button>
          </div>
        </div>
      ) : (
        <div className="playbook-grid">
          {filteredPlaybooks.map((item) => (
            <PlaybookCard
              key={item.id}
              item={item}
              onOpen={() => {
                setSuccessMessage("");
                setSelectedPlaybook(item);
              }}
            />
          ))}
        </div>
      )}

      <div className="spectra-glass-card playbook-footer-note">
        <ShieldCheck size={18} />

        <div>
          <b>Enterprise SOAR status</b>
          <p>
            Playbooks are persisted in PostgreSQL and can be opened in the visual
            builder, executed from the playbook workspace, and monitored from the
            Execution Center.
          </p>
        </div>
      </div>
    </div>
  );
}