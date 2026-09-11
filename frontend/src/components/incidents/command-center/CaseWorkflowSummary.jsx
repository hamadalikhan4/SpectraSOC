import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  ShieldAlert,
  Sparkles,
  Workflow,
} from "lucide-react";

function getReadinessScore(incident, caseStatus) {
  let score = 20;

  if (incident?.severity) score += 10;
  if (incident?.risk_score) score += 10;
  if (incident?.tags?.length) score += 10;
  if (incident?.linked_soar_execution) score += 15;
  if (caseStatus && caseStatus !== "Open") score += 10;
  if (incident?.sla_due_at) score += 10;
  if (incident?.assigned_to && incident.assigned_to !== "Unassigned") score += 10;
  if (incident?.description) score += 5;

  return Math.min(score, 100);
}

function readinessLabel(score) {
  if (score >= 85) return "FYP Demo Ready";
  if (score >= 70) return "Strong Case Record";
  if (score >= 50) return "Needs Review";
  return "Incomplete Case";
}

export default function CaseWorkflowSummary({ incident, caseStatus }) {
  const readiness = getReadinessScore(incident, caseStatus);

  const workflow = [
    {
      title: "Threat Intel",
      desc: "IOC and detection context",
      icon: ShieldAlert,
      done: true,
    },
    {
      title: "Incident",
      desc: "Case registered",
      icon: Activity,
      done: true,
    },
    {
      title: "Evidence",
      desc: "Evidence vault active",
      icon: Database,
      done: true,
    },
    {
      title: "Timeline",
      desc: "Investigation events",
      icon: Clock,
      done: true,
    },
    {
      title: "SOAR",
      desc: incident?.linked_soar_execution ? "Execution linked" : "Optional link",
      icon: Workflow,
      done: Boolean(incident?.linked_soar_execution),
    },
    {
      title: "Report",
      desc: "Final report ready",
      icon: FileText,
      done: true,
    },
  ];

  return (
    <div className="case-workflow-summary spectra-glass-card">
      <div className="case-workflow-head">
        <div>
          <span className="hero-chip">
            <Sparkles size={15} />
            Final Case Polish
          </span>

          <h2>Case Management Workflow</h2>

          <p>
            End-to-end SOC case lifecycle showing investigation readiness,
            automation linkage, evidence handling, SLA tracking, and report
            completion.
          </p>
        </div>

        <div className="case-readiness-score">
          <span>Readiness</span>
          <b>{readiness}%</b>
          <small>{readinessLabel(readiness)}</small>
        </div>
      </div>

      <div className="case-readiness-bar">
        <i style={{ width: `${readiness}%` }} />
      </div>

      <div className="case-workflow-steps">
        {workflow.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`case-workflow-step ${item.done ? "done" : "pending"}`}
            >
              <div>
                {item.done ? <CheckCircle2 size={17} /> : <Icon size={17} />}
              </div>

              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="case-demo-checklist">
        <div>
          <CheckCircle2 size={15} />
          <span>Incident dashboard connected</span>
        </div>

        <div>
          <CheckCircle2 size={15} />
          <span>Advanced workspace ready</span>
        </div>

        <div>
          <CheckCircle2 size={15} />
          <span>Evidence and timeline modules active</span>
        </div>

        <div>
          <CheckCircle2 size={15} />
          <span>SLA and final reporting available</span>
        </div>
      </div>
    </div>
  );
}