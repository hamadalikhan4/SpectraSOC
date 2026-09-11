import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  FileText,
  GitBranch,
  Globe2,
  Layers,
  Lock,
  Network,
  Radar,
  Server,
  ShieldAlert,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const workflow = [
  {
    title: "React Frontend",
    subtitle: "SOC Dashboard",
    icon: Network,
  },
  {
    title: "Auth + RBAC",
    subtitle: "Admin / Employee / Viewer",
    icon: Lock,
  },
  {
    title: "FastAPI Backend",
    subtitle: "REST APIs + Services",
    icon: Server,
  },
  {
    title: "Threat Intelligence",
    subtitle: "VT + AbuseIPDB + GeoIP",
    icon: Globe2,
  },
  {
    title: "Incident + SOAR",
    subtitle: "Cases + Playbooks",
    icon: Workflow,
  },
  {
    title: "AI SOC Copilot",
    subtitle: "Explain + Recommend",
    icon: Brain,
  },
  {
    title: "PostgreSQL",
    subtitle: "Incidents + Cache + Logs",
    icon: Database,
  },
];

const layers = [
  {
    layer: "Presentation Layer",
    technology: "React + Vite",
    purpose: "Professional SOC interface, dashboards, workspaces, and module navigation",
    status: "Active",
  },
  {
    layer: "Access Control Layer",
    technology: "JWT Auth + RBAC",
    purpose: "Role-based access for Admin, Employee, and Viewer users",
    status: "Enforced",
  },
  {
    layer: "API Layer",
    technology: "FastAPI",
    purpose: "REST endpoints for threat intelligence, incidents, SOAR, reports, and users",
    status: "Operational",
  },
  {
    layer: "Business Logic Layer",
    technology: "Service Layer",
    purpose: "Threat scoring, incident creation, SOAR execution, AI workflows, and reporting logic",
    status: "Operational",
  },
  {
    layer: "Data Access Layer",
    technology: "Repository Pattern",
    purpose: "Clean separation between services and database queries",
    status: "Operational",
  },
  {
    layer: "Database Layer",
    technology: "PostgreSQL + SQLAlchemy",
    purpose: "Stores users, incidents, evidence, timelines, SOAR data, cache, and audit logs",
    status: "Operational",
  },
  {
    layer: "Threat Intelligence Layer",
    technology: "VirusTotal, AbuseIPDB, GeoIP",
    purpose: "Enriches IPs, domains, URLs, and file hashes",
    status: "Integrated",
  },
  {
    layer: "AI Assistance Layer",
    technology: "AI SOC Copilot",
    purpose: "Generates investigation summaries, recommendations, reports, and response guidance",
    status: "Ready",
  },
];

const modules = [
  {
    title: "Threat Intelligence",
    desc: "Analyzes IOCs, enriches indicators, calculates risk scores, and creates incident context.",
    icon: Radar,
  },
  {
    title: "Incident Command Center",
    desc: "Tracks case status, evidence, timeline, SLA, assignment, comments, and final reporting.",
    icon: ShieldAlert,
  },
  {
    title: "SOAR Automation",
    desc: "Manages playbooks, executions, connectors, approvals, retries, and automation reports.",
    icon: Workflow,
  },
  {
    title: "AI SOC Copilot",
    desc: "Provides investigation summaries, evidence plans, SOAR recommendations, and report drafts.",
    icon: Brain,
  },
  {
    title: "RBAC Security",
    desc: "Controls platform access based on Admin, Employee, and Viewer roles.",
    icon: Lock,
  },
  {
    title: "Reporting Engine",
    desc: "Exports executive and technical reports for incidents, SOAR, and investigations.",
    icon: FileText,
  },
];

const dataFlow = [
  "Security alert or IOC enters SpectraSOC",
  "Threat intelligence engine enriches the indicator",
  "Threat score and severity are calculated",
  "Incident case is created or updated",
  "Evidence and timeline are collected",
  "SOAR playbook is recommended or executed",
  "AI Copilot assists analyst investigation",
  "Final report is generated for review",
];

const securityControls = [
  "JWT-based authentication",
  "Frontend role-based module access",
  "Admin-only architecture access",
  "Analyst-controlled investigation workflow",
  "Approval gates for sensitive SOAR actions",
  "Audit visibility for critical actions",
];

function WorkflowNode({ item, isLast }) {
  const Icon = item.icon;

  return (
    <>
      <div className="arch-v2-flow-node">
        <div>
          <Icon size={19} />
        </div>

        <b>{item.title}</b>
        <span>{item.subtitle}</span>
      </div>

      {!isLast && (
        <div className="arch-v2-flow-arrow">
          <ArrowRight size={18} />
        </div>
      )}
    </>
  );
}

function ModuleCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="arch-v2-module-card">
      <div>
        <Icon size={20} />
      </div>

      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </div>
  );
}

export default function Architecture() {
  return (
    <div className="architecture-v2-page">
      <section className="arch-v2-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <Layers size={15} />
            System Design
          </span>

          <h1>SpectraSOC System Architecture</h1>

          <p>
            End-to-end architecture for an enterprise AI-powered Security
            Operations Center platform, covering frontend, backend, RBAC,
            threat intelligence, incident response, SOAR automation, AI Copilot,
            reporting, and PostgreSQL persistence.
          </p>
        </div>

        <div className="arch-v2-status-card">
          <Cloud size={24} />
          <span>Architecture Status</span>
          <b>Production-Ready Design</b>
          <small>Modular, scalable, and FYP demo-ready</small>
        </div>
      </section>

      <section className="spectra-glass-card arch-v2-panel">
        <div className="arch-v2-panel-head">
          <div>
            <h2>SpectraSOC End-to-End Workflow</h2>
            <p>
              High-level flow from user interface to backend services,
              intelligence engines, automation, AI assistance, and database.
            </p>
          </div>

          <span>Enterprise SOC Flow</span>
        </div>

        <div className="arch-v2-flow">
          {workflow.map((item, index) => (
            <WorkflowNode
              key={item.title}
              item={item}
              isLast={index === workflow.length - 1}
            />
          ))}
        </div>
      </section>

      <section className="arch-v2-module-grid">
        {modules.map((item) => (
          <ModuleCard key={item.title} item={item} />
        ))}
      </section>

      <section className="arch-v2-main-grid">
        <div className="spectra-glass-card arch-v2-panel">
          <div className="arch-v2-panel-head">
            <div>
              <h2>Architecture Layers</h2>
              <p>
                Layered engineering design used to keep the platform scalable,
                maintainable, and enterprise-ready.
              </p>
            </div>

            <span>{layers.length} layers</span>
          </div>

          <div className="arch-v2-table-wrap">
            <table className="arch-v2-table">
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Technology</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {layers.map((item) => (
                  <tr key={item.layer}>
                    <td>{item.layer}</td>
                    <td>{item.technology}</td>
                    <td>{item.purpose}</td>
                    <td>
                      <span className="arch-v2-status-pill">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="spectra-glass-card arch-v2-panel">
          <div className="arch-v2-panel-head">
            <div>
              <h2>Core Backend Services</h2>
              <p>Primary service responsibilities inside the backend.</p>
            </div>
          </div>

          <div className="arch-v2-service-list">
            <div>
              <Server size={17} />
              <span>Threat Analysis Service</span>
            </div>

            <div>
              <Activity size={17} />
              <span>Threat Scoring Engine</span>
            </div>

            <div>
              <ShieldCheck size={17} />
              <span>Incident Service</span>
            </div>

            <div>
              <Workflow size={17} />
              <span>SOAR Execution Service</span>
            </div>

            <div>
              <Brain size={17} />
              <span>AI Copilot Context Engine</span>
            </div>

            <div>
              <FileText size={17} />
              <span>Report Generation Service</span>
            </div>

            <div>
              <Database size={17} />
              <span>Repository + Persistence Layer</span>
            </div>
          </div>
        </div>
      </section>

      <section className="arch-v2-bottom-grid">
        <div className="spectra-glass-card arch-v2-panel">
          <div className="arch-v2-panel-head">
            <div>
              <h2>Investigation Data Flow</h2>
              <p>
                How data moves through the SOC lifecycle inside SpectraSOC.
              </p>
            </div>

            <GitBranch size={19} />
          </div>

          <div className="arch-v2-data-flow">
            {dataFlow.map((item, index) => (
              <div key={item}>
                <b>{index + 1}</b>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="spectra-glass-card arch-v2-panel">
          <div className="arch-v2-panel-head">
            <div>
              <h2>Security Controls</h2>
              <p>
                Access and operational security controls included in the design.
              </p>
            </div>

            <Lock size={19} />
          </div>

          <div className="arch-v2-controls-list">
            {securityControls.map((item) => (
              <div key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="arch-v2-warning">
            <AlertTriangle size={17} />
            <span>
              Frontend RBAC improves user experience, but backend RBAC
              enforcement should also be applied to protect APIs in production.
            </span>
          </div>
        </div>
      </section>

      <section className="spectra-glass-card arch-v2-panel">
        <div className="arch-v2-panel-head">
          <div>
            <h2>Final FYP Architecture Summary</h2>
            <p>
              SpectraSOC follows a modular SOC architecture where the React
              frontend communicates with FastAPI services. The backend applies
              business logic through service and repository layers, integrates
              external threat intelligence providers, stores operational data in
              PostgreSQL, supports SOAR automation, and provides AI-assisted
              investigation and reporting.
            </p>
          </div>

          <Cpu size={22} />
        </div>
      </section>
    </div>
  );
}