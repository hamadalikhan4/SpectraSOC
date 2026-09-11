import { useMemo } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock,
  Database,
  Download,
  FileText,
  Printer,
  ShieldAlert,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

import AIReportDraftActions from "./AIReportDraftActions";

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function timeUntil(value) {
  if (!value) return "No SLA";

  const diff = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.floor(abs / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  const text =
    hours > 0 ? `${hours}h ${minutes % 60}m` : `${Math.max(minutes, 0)}m`;

  return diff < 0 ? `Breached ${text} ago` : `${text} left`;
}

function severityClass(value = "") {
  const severity = String(value).toLowerCase();

  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function getSlaHealth(incident = {}, caseStatus = "Open") {
  const status = String(caseStatus).toLowerCase();

  if (status.includes("resolved") || status.includes("closed")) {
    return "Completed";
  }

  const due = new Date(incident.sla_due_at || Date.now()).getTime();
  const remaining = due - Date.now();

  if (remaining < 0) return "Breached";
  if (remaining <= 1000 * 60 * 60) return "At Risk";

  return "Healthy";
}

function buildExecutiveSummary(incident = {}, caseStatus = "Open") {
  const severity = incident.severity || "Medium";
  const risk = Number(incident.risk_score || 0);
  const sla = getSlaHealth(incident, caseStatus);

  if (severity === "Critical" || risk >= 90) {
    return `This incident requires immediate executive visibility due to ${severity.toLowerCase()} severity and a risk score of ${risk}. The current case status is ${caseStatus}, with SLA state marked as ${sla}. Priority should remain focused on containment, evidence preservation, SOAR validation, and management escalation.`;
  }

  if (severity === "High" || risk >= 70) {
    return `This incident represents a high-priority security case with a risk score of ${risk}. The case is currently ${caseStatus}, and SLA state is ${sla}. Recommended focus areas include IOC validation, timeline review, SOAR output verification, and controlled containment actions.`;
  }

  return `This incident is currently assessed as ${severity} severity with a risk score of ${risk}. The case status is ${caseStatus}, and SLA state is ${sla}. Continued monitoring, evidence review, and final validation are recommended before closure.`;
}

function buildTechnicalFindings(incident = {}) {
  return [
    {
      title: "Incident Source",
      detail: `${
        incident.source || "SOC Platform"
      } generated or registered this incident.`,
    },
    {
      title: "Detection Category",
      detail: `The case is categorized under ${
        incident.category || "Security Incident"
      }.`,
    },
    {
      title: "Risk Score",
      detail: `Current risk score is ${
        incident.risk_score || 0
      }, derived from severity, indicators, enrichment context, and case activity.`,
    },
    {
      title: "Linked Automation",
      detail: incident.linked_soar_execution
        ? `SOAR execution ${incident.linked_soar_execution} is linked with this incident.`
        : "No SOAR execution is currently linked.",
    },
  ];
}

function buildReportPayload({
  incident = {},
  caseStatus,
  notes,
  timeline,
  evidence,
  aiInsights,
}) {
  return {
    generated_at: new Date().toISOString(),
    platform: "SpectraSOC / SpectraSOC",
    report_type: "Final Incident Report",
    incident: {
      id: incident.id,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      priority: incident.priority,
      status: caseStatus,
      category: incident.category,
      source: incident.source,
      assigned_to: incident.assigned_to,
      risk_score: incident.risk_score,
      created_at: incident.created_at,
      updated_at: incident.updated_at,
      sla_due_at: incident.sla_due_at,
      linked_soar_execution: incident.linked_soar_execution || "",
      tags: incident.tags || [],
    },
    executive_summary: buildExecutiveSummary(incident, caseStatus),
    technical_findings: buildTechnicalFindings(incident),
    sla_summary: {
      health: getSlaHealth(incident, caseStatus),
      due_at: incident.sla_due_at,
      remaining: timeUntil(incident.sla_due_at),
    },
    timeline: timeline || [],
    evidence: evidence || [],
    linked_soar: {
      execution_id: incident.linked_soar_execution || "",
      status: incident.linked_soar_execution ? "Linked" : "Not Linked",
    },
    ai_recommendations: aiInsights || [],
    analyst_notes: notes || [],
  };
}

function downloadJson(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${report.incident.id || "incident"}-final-report.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function buildTextReport(report) {
  return `
SPECTRASOC / SpectraSOC
FINAL INCIDENT REPORT

Generated At: ${formatTime(report.generated_at)}
Report Type: ${report.report_type}

==============================
1. INCIDENT OVERVIEW
==============================
Incident ID: ${report.incident.id}
Title: ${report.incident.title}
Severity: ${report.incident.severity}
Priority: ${report.incident.priority}
Status: ${report.incident.status}
Category: ${report.incident.category}
Source: ${report.incident.source}
Assigned To: ${report.incident.assigned_to}
Risk Score: ${report.incident.risk_score}
Created At: ${formatTime(report.incident.created_at)}
Updated At: ${formatTime(report.incident.updated_at)}
SLA Due At: ${formatTime(report.incident.sla_due_at)}
Linked SOAR Execution: ${report.incident.linked_soar_execution || "None"}

Description:
${report.incident.description}

==============================
2. EXECUTIVE SUMMARY
==============================
${report.executive_summary}

==============================
3. TECHNICAL FINDINGS
==============================
${report.technical_findings
  .map((item, index) => `${index + 1}. ${item.title}: ${item.detail}`)
  .join("\n")}

==============================
4. SLA SUMMARY
==============================
SLA Health: ${report.sla_summary.health}
SLA Due: ${formatTime(report.sla_summary.due_at)}
SLA Remaining: ${report.sla_summary.remaining}

==============================
5. TIMELINE SUMMARY
==============================
${report.timeline
  .map(
    (item, index) =>
      `${index + 1}. [${item.type || "Event"}] ${item.title} — ${
        item.status
      } — ${formatTime(item.time)}`
  )
  .join("\n")}

==============================
6. EVIDENCE SUMMARY
==============================
${report.evidence
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} | ${item.type} | ${item.integrity} | ${
        item.source
      }`
  )
  .join("\n")}

==============================
7. AI RECOMMENDATIONS
==============================
${report.ai_recommendations
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

==============================
8. ANALYST NOTES
==============================
${report.analyst_notes
  .map(
    (item, index) =>
      `${index + 1}. ${item.author} at ${formatTime(item.time)}: ${item.text}`
  )
  .join("\n")}

==============================
END OF REPORT
==============================
`.trim();
}

function downloadText(report) {
  const text = buildTextReport(report);

  const blob = new Blob([text], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${report.incident.id || "incident"}-analyst-report.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function printReport(report) {
  const html = `
<!doctype html>
<html>
<head>
  <title>${report.incident.id} Final Incident Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #111827;
      padding: 32px;
      line-height: 1.55;
    }

    h1, h2, h3 {
      color: #0f172a;
    }

    h1 {
      border-bottom: 3px solid #0ea5e9;
      padding-bottom: 12px;
    }

    section {
      margin-top: 28px;
      page-break-inside: avoid;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 16px;
    }

    .box {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px;
      background: #f8fafc;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px;
      text-align: left;
      font-size: 13px;
    }

    th {
      background: #f1f5f9;
    }
  </style>
</head>
<body>
  <h1>SpectraSOC Final Incident Report</h1>

  <p><b>Generated:</b> ${formatTime(report.generated_at)}</p>

  <section>
    <h2>1. Incident Overview</h2>

    <div class="meta">
      <div class="box"><b>Incident ID:</b> ${report.incident.id}</div>
      <div class="box"><b>Title:</b> ${report.incident.title}</div>
      <div class="box"><b>Severity:</b> ${report.incident.severity}</div>
      <div class="box"><b>Status:</b> ${report.incident.status}</div>
      <div class="box"><b>Priority:</b> ${report.incident.priority}</div>
      <div class="box"><b>Risk Score:</b> ${report.incident.risk_score}</div>
      <div class="box"><b>Assigned To:</b> ${
        report.incident.assigned_to
      }</div>
      <div class="box"><b>SLA:</b> ${report.sla_summary.health}</div>
    </div>

    <p>${report.incident.description}</p>
  </section>

  <section>
    <h2>2. Executive Summary</h2>
    <p>${report.executive_summary}</p>
  </section>

  <section>
    <h2>3. Technical Findings</h2>
    <ul>
      ${report.technical_findings
        .map((item) => `<li><b>${item.title}:</b> ${item.detail}</li>`)
        .join("")}
    </ul>
  </section>

  <section>
    <h2>4. SLA Summary</h2>
    <p><b>SLA Health:</b> ${report.sla_summary.health}</p>
    <p><b>SLA Due:</b> ${formatTime(report.sla_summary.due_at)}</p>
    <p><b>Remaining:</b> ${report.sla_summary.remaining}</p>
  </section>

  <section>
    <h2>5. Timeline</h2>

    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Status</th>
          <th>Event</th>
        </tr>
      </thead>

      <tbody>
        ${report.timeline
          .map(
            (item) => `
            <tr>
              <td>${formatTime(item.time)}</td>
              <td>${item.type || ""}</td>
              <td>${item.status || ""}</td>
              <td>${item.title || ""}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  </section>

  <section>
    <h2>6. Evidence Summary</h2>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Source</th>
          <th>Integrity</th>
        </tr>
      </thead>

      <tbody>
        ${report.evidence
          .map(
            (item) => `
            <tr>
              <td>${item.name || ""}</td>
              <td>${item.type || ""}</td>
              <td>${item.source || ""}</td>
              <td>${item.integrity || ""}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  </section>

  <section>
    <h2>7. SOAR Execution Summary</h2>
    <p><b>Status:</b> ${report.linked_soar.status}</p>
    <p><b>Execution ID:</b> ${report.linked_soar.execution_id || "None"}</p>
  </section>

  <section>
    <h2>8. AI Recommendations</h2>
    <ul>
      ${report.ai_recommendations.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </section>

  <section>
    <h2>9. Analyst Notes</h2>
    <ul>
      ${report.analyst_notes
        .map(
          (item) =>
            `<li><b>${item.author}</b> — ${formatTime(item.time)}: ${
              item.text
            }</li>`
        )
        .join("")}
    </ul>
  </section>

  <script>
    window.print();
  </script>
</body>
</html>
`;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Print window blocked. Please allow popups for this site.");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
}

function ReportMetric({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`report-studio-metric ${tone}`}>
      <Icon size={17} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function IncidentReportStudio({
  incident,
  caseStatus,
  notes = [],
  timeline = [],
  evidence = [],
  aiInsights = [],
}) {
  const safeIncident = incident || {};

  const report = useMemo(
    () =>
      buildReportPayload({
        incident: safeIncident,
        caseStatus,
        notes,
        timeline,
        evidence,
        aiInsights,
      }),
    [safeIncident, caseStatus, notes, timeline, evidence, aiInsights]
  );

  const slaHealth = getSlaHealth(safeIncident, caseStatus);

  return (
    <div className="incident-report-studio">
      <div className="report-studio-header">
        <div>
          <span className="hero-chip">
            <FileText size={15} />
            Final Incident Report Generator
          </span>

          <h2>Report Studio</h2>

          <p>
            Generate executive, technical, analyst, SLA, evidence, SOAR, and
            investigation-ready reports from the complete incident case record.
          </p>
        </div>

        <div className="report-studio-actions">
          <button className="secondary-btn" onClick={() => downloadJson(report)}>
            <Download size={16} />
            Export JSON
          </button>

          <button className="secondary-btn" onClick={() => downloadText(report)}>
            <ClipboardList size={16} />
            Export TXT
          </button>

          <button className="primary-btn" onClick={() => printReport(report)}>
            <Printer size={16} />
            Print Preview
          </button>
        </div>
      </div>

      <AIReportDraftActions
        incident={safeIncident}
        caseStatus={caseStatus}
        notes={notes}
        timeline={timeline}
        evidence={evidence}
        aiInsights={aiInsights}
      />

      <div className="report-studio-metrics">
        <ReportMetric
          icon={ShieldAlert}
          label="Severity"
          value={safeIncident.severity || "Unknown"}
          tone={severityClass(safeIncident.severity)}
        />

        <ReportMetric
          icon={Clock}
          label="SLA State"
          value={slaHealth}
          tone={slaHealth === "Breached" ? "red" : "green"}
        />

        <ReportMetric
          icon={Database}
          label="Evidence"
          value={evidence.length}
          tone="blue"
        />

        <ReportMetric
          icon={Workflow}
          label="SOAR"
          value={safeIncident.linked_soar_execution ? "Linked" : "None"}
          tone="green"
        />

        <ReportMetric
          icon={Brain}
          label="AI Insights"
          value={aiInsights.length}
          tone="yellow"
        />
      </div>

      <div className="report-preview-shell">
        <div className="report-preview-header">
          <div>
            <h1>SpectraSOC Final Incident Report</h1>
            <p>
              Generated by SpectraSOC / SpectraSOC Incident Command Center
            </p>
          </div>

          <div>
            <span>{report.incident.id}</span>
            <b>{report.incident.severity}</b>
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <FileText size={18} />
            <h3>1. Incident Overview</h3>
          </div>

          <div className="report-overview-grid">
            <div>
              <span>Incident ID</span>
              <b>{report.incident.id}</b>
            </div>

            <div>
              <span>Title</span>
              <b>{report.incident.title}</b>
            </div>

            <div>
              <span>Status</span>
              <b>{report.incident.status}</b>
            </div>

            <div>
              <span>Severity</span>
              <b>{report.incident.severity}</b>
            </div>

            <div>
              <span>Risk Score</span>
              <b>{report.incident.risk_score}</b>
            </div>

            <div>
              <span>Assigned To</span>
              <b>{report.incident.assigned_to}</b>
            </div>
          </div>

          <p>{report.incident.description}</p>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <UserRound size={18} />
            <h3>2. Executive Summary</h3>
          </div>

          <p>{report.executive_summary}</p>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <AlertTriangle size={18} />
            <h3>3. Technical Findings</h3>
          </div>

          <div className="report-finding-list">
            {report.technical_findings.map((item) => (
              <div key={item.title}>
                <CheckCircle2 size={15} />
                <span>
                  <b>{item.title}:</b> {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <Clock size={18} />
            <h3>4. SLA Summary</h3>
          </div>

          <div className="report-overview-grid">
            <div>
              <span>SLA Health</span>
              <b>{report.sla_summary.health}</b>
            </div>

            <div>
              <span>SLA Due</span>
              <b>{formatTime(report.sla_summary.due_at)}</b>
            </div>

            <div>
              <span>Remaining</span>
              <b>{report.sla_summary.remaining}</b>
            </div>
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <Database size={18} />
            <h3>5. Evidence Summary</h3>
          </div>

          <div className="report-table">
            <div className="report-table-head">
              <span>Name</span>
              <span>Type</span>
              <span>Source</span>
              <span>Integrity</span>
            </div>

            {report.evidence.map((item) => (
              <div className="report-table-row" key={item.id || item.name}>
                <span>{item.name}</span>
                <span>{item.type}</span>
                <span>{item.source}</span>
                <span>{item.integrity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <Workflow size={18} />
            <h3>6. SOAR Execution Summary</h3>
          </div>

          <div className="report-soar-box">
            <Workflow size={20} />

            <div>
              <b>
                {report.linked_soar.execution_id ||
                  "No SOAR execution linked"}
              </b>

              <p>
                SOAR binding status: {report.linked_soar.status}. Detailed step
                output is available in the Linked SOAR tab.
              </p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <Sparkles size={18} />
            <h3>7. AI Recommendations</h3>
          </div>

          <div className="report-ai-list">
            {report.ai_recommendations.map((item) => (
              <div key={item}>
                <Sparkles size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <ClipboardList size={18} />
            <h3>8. Analyst Notes</h3>
          </div>

          <div className="report-note-list">
            {report.analyst_notes.map((note) => (
              <div key={note.id}>
                <b>{note.author}</b>
                <p>{note.text}</p>
                <span>{formatTime(note.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}