import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Workflow,
} from "lucide-react";

import COPILOT_API from "../../../api/copilotApi";
import {
  buildIncidentCopilotContext,
  saveCopilotContext,
} from "../../../utils/copilotContextBridge";

function severityScore(severity = "") {
  const value = String(severity).toLowerCase();

  if (value === "critical") return 100;
  if (value === "high") return 80;
  if (value === "medium") return 55;
  return 30;
}

function categoryPlaybook(category = "", title = "") {
  const text = `${category} ${title}`.toLowerCase();

  if (text.includes("ransomware")) {
    return {
      name: "Ransomware Containment & Evidence Preservation",
      category: "Malware / Ransomware",
      confidence: 96,
      actions: [
        "Enrich indicators and affected host context",
        "Preserve endpoint and file-system evidence",
        "Request analyst approval for isolation",
        "Isolate confirmed affected assets",
        "Trigger recovery and hardening checklist",
      ],
      approvals: ["Host isolation", "Account disablement", "Firewall block"],
      connectors: ["SIEM", "EDR", "Threat Intel", "Ticketing"],
      mitre: ["T1486", "T1059", "T1027", "T1078"],
    };
  }

  if (text.includes("brute") || text.includes("login")) {
    return {
      name: "Brute Force Response & Account Protection",
      category: "Identity / Authentication",
      confidence: 91,
      actions: [
        "Correlate failed login activity",
        "Check source IP reputation",
        "Review affected account history",
        "Request approval for temporary account lock",
        "Create hardening recommendation",
      ],
      approvals: ["Account lock", "IP block"],
      connectors: ["SIEM", "IAM", "Threat Intel", "Firewall"],
      mitre: ["T1110", "T1078", "T1090"],
    };
  }

  if (text.includes("phishing") || text.includes("email")) {
    return {
      name: "Phishing Triage & Mailbox Containment",
      category: "Email Security",
      confidence: 89,
      actions: [
        "Extract URLs, sender, headers, and attachments",
        "Enrich URLs and sender infrastructure",
        "Search mailbox exposure",
        "Request approval for quarantine",
        "Notify affected users",
      ],
      approvals: ["Mailbox purge", "Domain block"],
      connectors: ["Email Security", "Threat Intel", "SIEM", "Ticketing"],
      mitre: ["T1566", "T1204", "T1589"],
    };
  }

  if (text.includes("ip") || text.includes("ioc") || text.includes("threat")) {
    return {
      name: "IOC Enrichment & Risk-Based Blocking",
      category: "Threat Intelligence",
      confidence: 87,
      actions: [
        "Parse and normalize IOC",
        "Run multi-source enrichment",
        "Correlate IOC with SIEM history",
        "Request approval for blocking if malicious",
        "Attach enrichment output to evidence",
      ],
      approvals: ["Firewall block", "Proxy block"],
      connectors: ["VirusTotal", "AbuseIPDB", "GeoIP", "SIEM", "Firewall"],
      mitre: ["T1071", "T1105", "T1595"],
    };
  }

  return {
    name: "Generic Incident Enrichment & Analyst Approval",
    category: "General Incident Response",
    confidence: 82,
    actions: [
      "Collect incident context",
      "Enrich available indicators",
      "Correlate with SIEM telemetry",
      "Request approval before response actions",
      "Update case timeline and report",
    ],
    approvals: ["Containment action", "Blocking action"],
    connectors: ["SIEM", "Threat Intel", "Ticketing"],
    mitre: ["T1059", "T1078", "T1082"],
  };
}

function buildRecommendation(incident = {}) {
  const base = categoryPlaybook(incident.category, incident.title);
  const risk = Number(incident.risk_score || 0);
  const sevScore = severityScore(incident.severity);

  const finalConfidence = Math.min(
    99,
    Math.round(base.confidence + risk / 20 + sevScore / 25)
  );

  const priority =
    sevScore >= 100 || risk >= 90
      ? "P0 Critical"
      : sevScore >= 80 || risk >= 70
        ? "P1 High"
        : sevScore >= 55 || risk >= 50
          ? "P2 Medium"
          : "P3 Low";

  return {
    ...base,
    confidence: finalConfidence,
    priority,
    risk_score: risk,
    severity: incident.severity || "Medium",
    linked_execution: incident.linked_soar_execution || "",
    reasons: [
      `Severity is ${incident.severity || "Medium"}`,
      `Risk score is ${risk}`,
      `Category matched as ${base.category}`,
      incident.linked_soar_execution
        ? `Existing SOAR execution linked: ${incident.linked_soar_execution}`
        : "No SOAR execution linked yet",
    ],
  };
}

function downloadRecommendation(incident, recommendation, aiDraft) {
  const payload = {
    generated_at: new Date().toISOString(),
    incident_id: incident?.id,
    incident_title: incident?.title,
    recommendation,
    ai_draft: aiDraft,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident?.id || "incident"}-ai-soar-recommendation.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function AIPlaybookRecommendationEngine({
  incident,
  caseStatus,
  timeline = [],
  evidence = [],
  notes = [],
  aiInsights = [],
}) {
  const safeIncident = incident || {};
  const [aiDraft, setAiDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  const recommendation = useMemo(
    () => buildRecommendation(safeIncident),
    [safeIncident]
  );

  const context = useMemo(
    () =>
      buildIncidentCopilotContext({
        incident: safeIncident,
        caseStatus,
        timeline,
        evidence,
        notes,
        aiInsights,
      }),
    [safeIncident, caseStatus, timeline, evidence, notes, aiInsights]
  );

  const generateAIGuidance = async () => {
    setLoading(true);

    try {
      const response = await COPILOT_API.ask({
        prompt:
          "Generate an AI SOAR playbook recommendation engine output for this incident. Include playbook choice, approval gates, response actions, connectors, MITRE mapping, and safety controls.",
        context,
      });

      setAiDraft(response);
    } catch (error) {
      console.error(error);
      setAiDraft({
        category: "AI SOAR Recommendation Error",
        confidence: 0,
        answer:
          "AI SOAR recommendation failed. Check copilotApi.js or frontend mock mode.",
        recommendations: ["Restart frontend", "Verify COPILOT_API.ask"],
        next_steps: ["Retry AI guidance"],
      });
    } finally {
      setLoading(false);
    }
  };

  const sendToCopilot = () => {
    saveCopilotContext({
      ...context,
      ai_soar_recommendation: recommendation,
    });

    alert(
      "AI SOAR recommendation context sent to AI SOC Copilot. Open AI Assistant from the sidebar."
    );
  };

  return (
    <div className="ai-playbook-engine">
      <div className="ai-playbook-header">
        <div>
          <span className="hero-chip">
            <Brain size={15} />
            AI SOAR Recommendation Engine
          </span>

          <h2>Recommended Playbook</h2>

          <p>
            AI-assisted SOAR playbook selection based on severity, category,
            risk score, SLA state, evidence, timeline, and linked automation.
          </p>
        </div>

        <div className="ai-playbook-actions">
          <button
            className="secondary-btn"
            onClick={generateAIGuidance}
            disabled={loading}
          >
            {loading ? <Loader2 size={15} /> : <Sparkles size={15} />}
            Generate AI Guidance
          </button>

          <button className="secondary-btn" onClick={sendToCopilot}>
            <Brain size={15} />
            Send to Copilot
          </button>

          <button
            className="primary-btn"
            onClick={() =>
              downloadRecommendation(safeIncident, recommendation, aiDraft)
            }
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="ai-playbook-main-grid">
        <div className="ai-playbook-card primary-recommendation">
          <div className="ai-playbook-title-row">
            <Workflow size={22} />

            <div>
              <h3>{recommendation.name}</h3>
              <span>{recommendation.category}</span>
            </div>
          </div>

          <div className="ai-playbook-score-grid">
            <div>
              <span>Confidence</span>
              <b>{recommendation.confidence}%</b>
            </div>

            <div>
              <span>Priority</span>
              <b>{recommendation.priority}</b>
            </div>

            <div>
              <span>Severity</span>
              <b>{recommendation.severity}</b>
            </div>

            <div>
              <span>Risk</span>
              <b>{recommendation.risk_score}</b>
            </div>
          </div>

          <div className="ai-playbook-reasons">
            {recommendation.reasons.map((reason) => (
              <div key={reason}>
                <CheckCircle2 size={14} />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-playbook-card safety-card">
          <div className="ai-playbook-small-head">
            <AlertTriangle size={18} />
            <h3>Safety Controls</h3>
          </div>

          <p>
            Destructive actions must use approval gates. This keeps the platform
            enterprise-safe and analyst-in-the-loop.
          </p>

          <div className="ai-playbook-pill-list">
            {recommendation.approvals.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="ai-playbook-details-grid">
        <div className="ai-playbook-card">
          <div className="ai-playbook-small-head">
            <PlayCircle size={18} />
            <h3>Recommended Workflow</h3>
          </div>

          <div className="ai-playbook-step-list">
            {recommendation.actions.map((action, index) => (
              <div key={action}>
                <b>{index + 1}</b>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-playbook-card">
          <div className="ai-playbook-small-head">
            <ShieldAlert size={18} />
            <h3>Connectors</h3>
          </div>

          <div className="ai-playbook-pill-list">
            {recommendation.connectors.map((connector) => (
              <span key={connector}>{connector}</span>
            ))}
          </div>
        </div>

        <div className="ai-playbook-card">
          <div className="ai-playbook-small-head">
            <FileText size={18} />
            <h3>MITRE Mapping</h3>
          </div>

          <div className="ai-playbook-pill-list">
            {recommendation.mitre.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="ai-playbook-card">
          <div className="ai-playbook-small-head">
            <Clock size={18} />
            <h3>Execution Readiness</h3>
          </div>

          <p>
            {recommendation.linked_execution
              ? `Existing execution linked: ${recommendation.linked_execution}. Review output before launching a new playbook.`
              : "No execution is linked. This recommendation can be used to start a controlled SOAR workflow."}
          </p>
        </div>
      </div>

      {aiDraft && (
        <div className="ai-playbook-card ai-guidance-card">
          <div className="ai-playbook-small-head">
            <Sparkles size={18} />
            <h3>{aiDraft.category || "AI SOAR Guidance"}</h3>
          </div>

          <p>{aiDraft.answer}</p>

          {aiDraft.recommendations?.length > 0 && (
            <div className="ai-playbook-reasons">
              {aiDraft.recommendations.map((item) => (
                <div key={item}>
                  <CheckCircle2 size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}