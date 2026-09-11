import { useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Wrench,
} from "lucide-react";

import COPILOT_API from "../../../api/copilotApi";
import {
  buildIncidentCopilotContext,
  saveCopilotContext,
} from "../../../utils/copilotContextBridge";

const DRAFT_ACTIONS = [
  {
    id: "executive",
    title: "Generate Executive Summary",
    type: "Executive Summary",
    icon: FileText,
    prompt:
      "Generate an executive summary for this incident report using severity, risk score, SLA state, evidence, SOAR, and analyst notes.",
  },
  {
    id: "technical",
    title: "Generate Technical Findings",
    type: "Technical Findings",
    icon: ClipboardList,
    prompt:
      "Generate technical findings for this incident report using timeline, evidence, detection source, category, SOAR context, and risk score.",
  },
  {
    id: "remediation",
    title: "Generate Remediation Plan",
    type: "Remediation Plan",
    icon: Wrench,
    prompt:
      "Generate a remediation and prevention plan for this incident with containment, eradication, recovery, and hardening recommendations.",
  },
  {
    id: "conclusion",
    title: "Generate Analyst Conclusion",
    type: "Analyst Conclusion",
    icon: CheckCircle2,
    prompt:
      "Generate an analyst conclusion for this final incident report including case status, evidence confidence, SLA state, and closure guidance.",
  },
];

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildContext({
  incident,
  caseStatus,
  notes,
  timeline,
  evidence,
  aiInsights,
}) {
  return buildIncidentCopilotContext({
    incident,
    caseStatus,
    notes,
    timeline,
    evidence,
    aiInsights,
  });
}

function downloadDrafts(incident, drafts) {
  const content = drafts
    .map(
      (draft) =>
        `${draft.type.toUpperCase()}\nGenerated: ${formatTime(
          draft.generated_at
        )}\n\n${draft.content}\n\nRecommendations:\n${draft.recommendations
          .map((item, index) => `${index + 1}. ${item}`)
          .join("\n")}`
    )
    .join("\n\n==============================\n\n");

  const blob = new Blob([content], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${incident?.id || "incident"}-ai-report-drafts.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Draft copied to clipboard.");
  } catch {
    alert("Clipboard copy failed. Select and copy the draft manually.");
  }
}

export default function AIReportDraftActions({
  incident,
  caseStatus,
  notes = [],
  timeline = [],
  evidence = [],
  aiInsights = [],
}) {
  const [drafts, setDrafts] = useState([]);
  const [loadingAction, setLoadingAction] = useState("");

  const context = useMemo(
    () =>
      buildContext({
        incident,
        caseStatus,
        notes,
        timeline,
        evidence,
        aiInsights,
      }),
    [incident, caseStatus, notes, timeline, evidence, aiInsights]
  );

  const generateDraft = async (action) => {
    setLoadingAction(action.id);

    try {
      const response = await COPILOT_API.ask({
        prompt: action.prompt,
        context,
      });

      const draft = {
        id: `${action.id}-${Date.now()}`,
        type: action.type,
        generated_at: new Date().toISOString(),
        content: response.answer,
        confidence: response.confidence || 0,
        recommendations: response.recommendations || [],
        next_steps: response.next_steps || [],
      };

      setDrafts((prev) => [draft, ...prev]);
    } catch (error) {
      console.error(error);

      setDrafts((prev) => [
        {
          id: `error-${Date.now()}`,
          type: "AI Draft Error",
          generated_at: new Date().toISOString(),
          content:
            "AI report drafting failed. Check the Copilot API or mock response configuration.",
          confidence: 0,
          recommendations: ["Verify copilotApi.js", "Restart frontend"],
          next_steps: ["Retry generation"],
        },
        ...prev,
      ]);
    } finally {
      setLoadingAction("");
    }
  };

  const sendReportContextToCopilot = () => {
    saveCopilotContext(context);

    alert(
      "Report context sent to AI SOC Copilot. Open AI Assistant from the sidebar."
    );
  };

  return (
    <div className="ai-report-draft-actions">
      <div className="ai-report-draft-header">
        <div>
          <span className="hero-chip">
            <Brain size={15} />
            AI Report Drafting
          </span>

          <h3>AI Report Draft Actions</h3>

          <p>
            Generate executive summary, technical findings, remediation plan, and
            analyst conclusion using the current incident, evidence, timeline,
            SLA, SOAR, and analyst notes.
          </p>
        </div>

        <div className="ai-report-draft-controls">
          <button className="secondary-btn" onClick={sendReportContextToCopilot}>
            <Sparkles size={15} />
            Send to Copilot
          </button>

          <button
            className="secondary-btn"
            disabled={drafts.length === 0}
            onClick={() => downloadDrafts(incident, drafts)}
          >
            <Download size={15} />
            Export Drafts
          </button>
        </div>
      </div>

      <div className="ai-report-action-grid">
        {DRAFT_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isLoading = loadingAction === action.id;

          return (
            <button
              key={action.id}
              onClick={() => generateDraft(action)}
              disabled={Boolean(loadingAction)}
            >
              {isLoading ? <Loader2 size={18} /> : <Icon size={18} />}

              <div>
                <b>{action.title}</b>
                <span>{action.type}</span>
              </div>
            </button>
          );
        })}
      </div>

      {drafts.length > 0 && (
        <div className="ai-report-draft-list">
          {drafts.map((draft) => (
            <div key={draft.id} className="ai-report-draft-card">
              <div className="ai-report-draft-card-head">
                <div>
                  <h4>{draft.type}</h4>
                  <span>
                    {formatTime(draft.generated_at)} · {draft.confidence}%
                    confidence
                  </span>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() => copyText(draft.content)}
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>

              <p>{draft.content}</p>

              {draft.recommendations.length > 0 && (
                <div className="ai-report-recommendations">
                  {draft.recommendations.map((item) => (
                    <div key={item}>
                      <CheckCircle2 size={14} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}