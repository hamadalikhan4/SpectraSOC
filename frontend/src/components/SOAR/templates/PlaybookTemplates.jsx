import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  CopyPlus,
  Eye,
  Filter,
  Gauge,
  Loader2,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  X,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";
import {
  PLAYBOOK_TEMPLATES,
  templateToPlaybookPayload,
} from "./playbookTemplates";

function riskClass(score) {
  if (score >= 90) return "critical";
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

export default function PlaybookTemplates({ onClose, onCreated }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState(
    PLAYBOOK_TEMPLATES.find((item) => item.recommendedDemo) ||
      PLAYBOOK_TEMPLATES[0]
  );
  const [creatingId, setCreatingId] = useState("");
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    return ["All", ...new Set(PLAYBOOK_TEMPLATES.map((item) => item.category))];
  }, []);

  const recommendedTemplates = useMemo(() => {
    return PLAYBOOK_TEMPLATES.filter((item) => item.recommendedDemo);
  }, []);

  const filteredTemplates = useMemo(() => {
    const query = search.toLowerCase();

    return PLAYBOOK_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.join(" ").toLowerCase().includes(query) ||
        template.mitre?.some(
          (item) =>
            item.id.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query)
        );

      const matchesCategory =
        category === "All" || template.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const createFromTemplate = async (template) => {
    try {
      setCreatingId(template.id);
      setError("");

      const payload = templateToPlaybookPayload(template);
      const created = await SOAR_API.createPlaybook(payload);

      if (onCreated) {
        await onCreated(created, template);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create playbook from template.");
    } finally {
      setCreatingId("");
    }
  };

  return (
    <div className="template-library-shell">
      <div className="template-library-header spectra-glass-card">
        <div>
          <span className="hero-chip">
            <Sparkles size={15} />
            Enterprise Templates
          </span>

          <h1>SOAR Playbook Templates Library</h1>

          <p>
            Deploy ready-made security automation workflows with MITRE mapping,
            risk scoring, approval indicators, maturity labels, and FYP demo
            recommendations.
          </p>
        </div>

        <button className="secondary-btn" onClick={onClose}>
          <X size={16} />
          Close Library
        </button>
      </div>

      {error && (
        <div className="spectra-glass-card template-error">
          <X size={16} />
          {error}
        </div>
      )}

      <div className="recommended-template-strip spectra-glass-card">
        <div className="recommended-strip-header">
          <div>
            <h2>
              <Star size={18} />
              Recommended for FYP Demo
            </h2>
            <p>
              These templates are easiest to present and show strong enterprise
              SOC value.
            </p>
          </div>

          <span>{recommendedTemplates.length} recommended</span>
        </div>

        <div className="recommended-template-grid">
          {recommendedTemplates.map((template) => (
            <button
              key={template.id}
              className={`recommended-template-card ${
                selectedTemplate?.id === template.id ? "active" : ""
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <b>{template.name}</b>
              <span>{template.category}</span>
              <small>Risk {template.riskScore}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="template-toolbar spectra-glass-card">
        <div className="template-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates, MITRE IDs, tags..."
          />
        </div>

        <div className="template-filter">
          <Filter size={16} />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="template-library-grid">
        <div className="template-list">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              className={`template-card spectra-glass-card ${
                selectedTemplate?.id === template.id ? "active" : ""
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="template-card-top">
                <div className="template-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <h3>{template.name}</h3>
                  <p>{template.category}</p>
                </div>
              </div>

              <p className="template-description">{template.description}</p>

              <div className="template-quality-row">
                <span className={`risk-pill ${riskClass(template.riskScore)}`}>
                  <Gauge size={12} />
                  Risk {template.riskScore}
                </span>

                <span className="maturity-pill">
                  <Award size={12} />
                  {template.maturity}
                </span>

                {template.approvalRequired && (
                  <span className="approval-pill">
                    <LockKeyhole size={12} />
                    Approval
                  </span>
                )}

                {template.recommendedDemo && (
                  <span className="demo-pill">
                    <Star size={12} />
                    FYP Demo
                  </span>
                )}
              </div>

              <div className="template-meta">
                <span>{template.severity}</span>
                <span>{template.steps.length} steps</span>
                <span>{template.estimatedTime}</span>
              </div>

              <div className="template-tags">
                {template.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="template-preview spectra-glass-card">
          {selectedTemplate ? (
            <>
              <div className="template-preview-header">
                <div>
                  <span className="preview-label">
                    {selectedTemplate.category}
                  </span>

                  <h2>{selectedTemplate.name}</h2>

                  <p>{selectedTemplate.description}</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => createFromTemplate(selectedTemplate)}
                  disabled={creatingId === selectedTemplate.id}
                >
                  {creatingId === selectedTemplate.id ? (
                    <Loader2 size={16} />
                  ) : (
                    <CopyPlus size={16} />
                  )}

                  {creatingId === selectedTemplate.id
                    ? "Creating..."
                    : "Create & Open"}
                </button>
              </div>

              <div className="template-autoopen-note">
                <CheckCircle2 size={15} />
                After creation, this playbook will automatically open in the
                Playbook Builder.
              </div>

              <div className="template-preview-stats upgraded">
                <div>
                  <Gauge size={16} />
                  <span>Risk Score</span>
                  <b>{selectedTemplate.riskScore}/100</b>
                </div>

                <div>
                  <Award size={16} />
                  <span>Maturity</span>
                  <b>{selectedTemplate.maturity}</b>
                </div>

                <div>
                  <LockKeyhole size={16} />
                  <span>Approval</span>
                  <b>
                    {selectedTemplate.approvalRequired
                      ? "Required"
                      : "Not Required"}
                  </b>
                </div>

                <div>
                  <Star size={16} />
                  <span>FYP Demo</span>
                  <b>
                    {selectedTemplate.recommendedDemo
                      ? "Recommended"
                      : "Optional"}
                  </b>
                </div>
              </div>

              <div className="template-section">
                <h3>Quality Highlights</h3>

                <div className="template-quality-list">
                  {selectedTemplate.quality.map((item) => (
                    <span key={item}>
                      <CheckCircle2 size={13} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="template-section">
                <h3>MITRE ATT&CK Mapping</h3>

                <div className="template-mitre-grid">
                  {selectedTemplate.mitre.map((technique) => (
                    <div className="mitre-card" key={technique.id}>
                      <Target size={15} />

                      <div>
                        <b>{technique.id}</b>
                        <span>{technique.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="template-section">
                <h3>Required Connectors</h3>

                <div className="template-connectors">
                  {selectedTemplate.connectors.map((connector) => (
                    <span key={connector}>
                      <CheckCircle2 size={13} />
                      {connector}
                    </span>
                  ))}
                </div>
              </div>

              <div className="template-section">
                <h3>Workflow Steps</h3>

                <div className="template-step-list">
                  {selectedTemplate.steps.map((step) => (
                    <div className="template-step-row" key={step.step_order}>
                      <div className="step-number">{step.step_order}</div>

                      <div>
                        <div className="template-step-top">
                          <h4>{step.name}</h4>
                          <span>{step.step_type}</span>
                        </div>

                        <p>{step.action_key}</p>

                        <div className="template-step-meta">
                          <span>{step.connector_name}</span>

                          {step.config?.require_approval && (
                            <span>Approval Required</span>
                          )}

                          {step.condition?.field && (
                            <span>
                              {step.condition.field} {step.condition.operator}{" "}
                              {step.condition.value}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="template-actions">
                <button
                  className="secondary-btn"
                  onClick={() => createFromTemplate(selectedTemplate)}
                  disabled={creatingId === selectedTemplate.id}
                >
                  <Eye size={16} />
                  Use This Template
                </button>
              </div>
            </>
          ) : (
            <div className="template-empty">
              <Sparkles size={22} />
              <p>Select a template to preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}