import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  Workflow,
} from "lucide-react";

import COPILOT_API from "../../api/copilotApi";
import {
  clearCopilotContext,
  readCopilotContext,
} from "../../utils/copilotContextBridge";

const QUICK_ACTIONS = [
  {
    id: "incident-summary",
    title: "Summarize Incident",
    description: "Generate incident summary and investigation direction.",
    icon: ShieldAlert,
    prompt: "Summarize this incident and recommend investigation actions.",
  },
  {
    id: "soar-playbook",
    title: "Recommend SOAR",
    description: "Suggest automation steps and approval gates.",
    icon: Workflow,
    prompt: "Recommend a SOAR playbook for this incident.",
  },
  {
    id: "evidence-plan",
    title: "Evidence Plan",
    description: "Suggest evidence items, custody, and hash handling.",
    icon: Database,
    prompt: "Explain what evidence should be collected for this case.",
  },
  {
    id: "sla-risk",
    title: "SLA Risk",
    description: "Explain priority, escalation, and SLA risk.",
    icon: Clock,
    prompt: "Explain SLA risk and priority for this incident.",
  },
  {
    id: "report-summary",
    title: "Report Draft",
    description: "Create final report structure and executive summary.",
    icon: FileText,
    prompt: "Draft a final incident report executive summary.",
  },
  {
    id: "threat-hunt",
    title: "Threat Hunt",
    description: "Generate threat hunting checks and investigation checks.",
    icon: Activity,
    prompt: "Suggest threat hunting checks for this security incident.",
  },
];

const DEMO_CONTEXT = {
  incident_id: "INC-2026-0002",
  title: "Ransomware Behavior Detected",
  severity: "Critical",
  risk_score: 96,
  status: "Investigating",
  source: "SOAR Demo Mode",
  linked_soar_execution: "SOAR-EXEC-002",
  sla_state: "At Risk",
  category: "Malware / Ransomware",
  assigned_to: "SOC Analyst",
  evidence: [],
  timeline: [],
  notes: [],
};

function formatTime(value) {
  if (!value) return "Not available";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildInitialMessages() {
  return [
    {
      id: "msg-welcome",
      role: "assistant",
      title: "AI SOC Copilot ready",
      content:
        "I can help investigate incidents, explain evidence, recommend SOAR playbooks, analyze SLA risk, draft reports, and guide analysts through safe SOC workflows.",
      category: "SOC Copilot",
      confidence: 100,
      recommendations: [
        "Choose a quick action.",
        "Ask about incident response steps.",
        "Ask for report, evidence, SOAR, or SLA guidance.",
      ],
      next_steps: ["Select a prompt", "Review context", "Generate guidance"],
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeContextForCopilot(context = {}) {
  return {
    incident_id: context.incident_id || context.id || "INC-DEMO",
    title: context.title || "Demo Incident",
    severity: context.severity || "Medium",
    risk_score: context.risk_score || 50,
    status: context.status || "Open",
    source: context.detection_source || context.source || "SOC Platform",
    linked_soar_execution: context.linked_soar_execution || "",
    sla_state: context.sla_state || "Unknown",
    category: context.category || "Security Incident",
    assigned_to: context.assigned_to || "Unassigned",
    description: context.description || "",
    tags: context.tags || [],
    timeline: context.timeline || [],
    evidence: context.evidence || [],
    notes: context.notes || [],
    ai_insights: context.ai_insights || [],
    sent_at: context.sent_at || "",
    raw: context,
  };
}

function buildConversationExport(messages = [], context = {}) {
  return {
    generated_at: new Date().toISOString(),
    platform: "SpectraSOC / SpectraSOC",
    module: "AI SOC Copilot",
    context,
    conversation: messages.map((message) => ({
      role: message.role,
      title: message.title || "",
      category: message.category || "",
      confidence: message.confidence || "",
      content: message.content || "",
      recommendations: message.recommendations || [],
      next_steps: message.next_steps || [],
      created_at: message.created_at || "",
    })),
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function downloadConversation(messages, context) {
  const payload = buildConversationExport(messages, context);

  downloadJson(
    `${context.incident_id || "copilot"}-ai-copilot-conversation.json`,
    payload
  );
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard.");
  } catch {
    alert("Clipboard copy failed. Select the text and copy manually.");
  }
}

function MessageCard({ message, onCopy }) {
  const isUser = message.role === "user";

  return (
    <div className={`copilot-message ${isUser ? "user" : "assistant"}`}>
      <div className="copilot-message-icon">
        {isUser ? <MessageSquare size={16} /> : <Bot size={16} />}
      </div>

      <div className="copilot-message-body">
        <div className="copilot-message-head">
          <div>
            <h3>{isUser ? "Analyst" : message.title || "SOC Copilot"}</h3>

            {message.created_at && (
              <small>{formatTime(message.created_at)}</small>
            )}
          </div>

          {!isUser && (
            <div className="copilot-message-tools">
              <span>
                {message.confidence ? `${message.confidence}% confidence` : "AI"}
              </span>

              <button onClick={() => onCopy(message.content)}>
                <Copy size={13} />
              </button>
            </div>
          )}
        </div>

        <p>{message.content}</p>

        {!isUser && message.recommendations?.length > 0 && (
          <div className="copilot-response-section">
            <b>Recommendations</b>

            {message.recommendations.map((item) => (
              <div key={item}>
                <CheckCircle2 size={14} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {!isUser && message.next_steps?.length > 0 && (
          <div className="copilot-next-steps">
            {message.next_steps.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CopilotMetric({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`copilot-metric-card ${tone}`}>
      <Icon size={18} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function ContextSnapshot({ context, hasIncidentContext }) {
  const items = [
    ["Incident", context.incident_id],
    ["Status", context.status],
    ["Severity", context.severity],
    ["Risk", context.risk_score],
    ["Category", context.category],
    ["SOAR", context.linked_soar_execution || "Not linked"],
    ["Evidence", context.evidence?.length || 0],
    ["Timeline", context.timeline?.length || 0],
  ];

  return (
    <div className="copilot-context-snapshot">
      <div className="copilot-panel-header compact">
        <div>
          <h2>Context Snapshot</h2>
          <p>
            {hasIncidentContext
              ? "Live case context received from Incident Command Center."
              : "Demo context used for AI SOC Copilot testing."}
          </p>
        </div>
      </div>

      <div className="copilot-context-snapshot-grid">
        {items.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoReadinessPanel({ hasIncidentContext, messages }) {
  const checks = [
    {
      label: "Copilot UI ready",
      done: true,
    },
    {
      label: "Quick actions available",
      done: true,
    },
    {
      label: "Incident context bridge",
      done: hasIncidentContext,
    },
    {
      label: "Conversation export",
      done: true,
    },
    {
      label: "AI responses generated",
      done: messages.some((message) => message.role === "assistant"),
    },
  ];

  const score = Math.round(
    (checks.filter((item) => item.done).length / checks.length) * 100
  );

  return (
    <div className="spectra-glass-card copilot-demo-readiness">
      <div>
        <span>Demo Readiness</span>
        <b>{score}%</b>
      </div>

      <div className="copilot-demo-checks">
        {checks.map((item) => (
          <div key={item.label} className={item.done ? "done" : "pending"}>
            <CheckCircle2 size={14} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SOCCopilot() {
  const messageEndRef = useRef(null);

  const [messages, setMessages] = useState(buildInitialMessages);
  const [input, setInput] = useState("");
  const [context, setContext] = useState(() => {
    const pending = readCopilotContext();
    return pending ? normalizeContextForCopilot(pending) : DEMO_CONTEXT;
  });
  const [hasIncidentContext, setHasIncidentContext] = useState(() =>
    Boolean(readCopilotContext())
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pending = readCopilotContext();

    if (pending) {
      const normalized = normalizeContextForCopilot(pending);

      setContext(normalized);
      setHasIncidentContext(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-context-${Date.now()}`,
          role: "assistant",
          title: "Incident context loaded",
          content: `Loaded incident context for ${normalized.incident_id}: ${normalized.title}. You can now ask for investigation summary, SOAR recommendation, evidence plan, SLA risk, threat hunting, or final report draft.`,
          confidence: 100,
          recommendations: [
            "Summarize this incident.",
            "Recommend SOAR response actions.",
            "Explain SLA and escalation risk.",
            "Draft final report summary.",
          ],
          next_steps: [
            "Use quick actions",
            "Review case context",
            "Ask for investigation guidance",
          ],
          created_at: new Date().toISOString(),
        },
      ]);
    }

    const handleContext = (event) => {
      const normalized = normalizeContextForCopilot(event.detail || {});

      setContext(normalized);
      setHasIncidentContext(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-context-live-${Date.now()}`,
          role: "assistant",
          title: "New incident context received",
          content: `Connected to ${normalized.incident_id}: ${normalized.title}. The AI Copilot will use this case context for all new responses.`,
          confidence: 100,
          recommendations: [
            "Run incident summary.",
            "Generate SOAR recommendation.",
            "Draft report sections.",
          ],
          next_steps: ["Choose quick action", "Ask custom question"],
          created_at: new Date().toISOString(),
        },
      ]);
    };

    window.addEventListener("spectrasoc:copilot-context", handleContext);

    return () => {
      window.removeEventListener("spectrasoc:copilot-context", handleContext);
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const metrics = useMemo(() => {
    const assistantMessages = messages.filter((msg) => msg.role === "assistant");

    return {
      total: messages.length,
      ai: assistantMessages.length,
      confidence:
        assistantMessages.length === 0
          ? 0
          : Math.round(
              assistantMessages.reduce(
                (sum, item) => sum + Number(item.confidence || 0),
                0
              ) / assistantMessages.length
            ),
    };
  }, [messages]);

  const askCopilot = async (prompt) => {
    const cleanedPrompt = String(prompt || input || "").trim();

    if (!cleanedPrompt) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cleanedPrompt,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await COPILOT_API.ask({
        prompt: cleanedPrompt,
        context,
      });

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        title: response.category || "SOC Copilot Analysis",
        content: response.answer,
        confidence: response.confidence,
        recommendations: response.recommendations || [],
        next_steps: response.next_steps || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          title: "Copilot Error",
          content:
            "The AI Copilot could not process the request. Check backend API or use mock mode.",
          confidence: 0,
          recommendations: ["Check API route", "Verify backend is running"],
          next_steps: ["Retry request"],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateContextField = (field, value) => {
    setContext((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearContext = () => {
    clearCopilotContext();
    setContext(DEMO_CONTEXT);
    setHasIncidentContext(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-clear-context-${Date.now()}`,
        role: "assistant",
        title: "Context cleared",
        content:
          "Incident-linked context has been cleared. The copilot is now using demo context.",
        confidence: 100,
        recommendations: ["Send a new incident from the case workspace."],
        next_steps: ["Open Incident Management", "Open Case", "Ask AI Copilot"],
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const clearChat = () => {
    setMessages(buildInitialMessages());
  };

  return (
    <div className="soc-copilot-page">
      <div className="soc-copilot-hero spectra-glass-card">
        <div>
          <span className="hero-chip">
            <Brain size={15} />
            Phase 8.6
          </span>

          <h1>AI SOC Copilot</h1>

          <p>
            Finalized enterprise investigation assistant for incident response,
            evidence review, SOAR guidance, SLA explanation, threat hunting,
            report drafting, and demo-ready SOC workflows.
          </p>
        </div>

        <div className="copilot-hero-badge">
          <Sparkles size={22} />
          <span>Mode</span>
          <b>{hasIncidentContext ? "Incident Context" : "Mock AI Ready"}</b>
        </div>
      </div>

      {hasIncidentContext && (
        <div className="spectra-glass-card copilot-context-banner">
          <div>
            <ShieldAlert size={18} />

            <div>
              <h3>Incident context connected</h3>
              <p>
                {context.incident_id} — {context.title} | Severity:{" "}
                {context.severity} | Risk: {context.risk_score} | Status:{" "}
                {context.status}
              </p>
            </div>
          </div>

          <button className="secondary-btn danger-btn" onClick={clearContext}>
            <Trash2 size={15} />
            Clear Context
          </button>
        </div>
      )}

      <div className="copilot-metric-grid">
        <CopilotMetric
          icon={MessageSquare}
          label="Conversation Items"
          value={metrics.total}
          tone="blue"
        />

        <CopilotMetric
          icon={Bot}
          label="AI Responses"
          value={metrics.ai}
          tone="green"
        />

        <CopilotMetric
          icon={Brain}
          label="Avg Confidence"
          value={`${metrics.confidence}%`}
          tone="yellow"
        />

        <CopilotMetric
          icon={ShieldAlert}
          label="Current Severity"
          value={context.severity}
          tone="red"
        />
      </div>

      <DemoReadinessPanel
        hasIncidentContext={hasIncidentContext}
        messages={messages}
      />

      <div className="soc-copilot-grid">
        <div className="copilot-chat-shell spectra-glass-card">
          <div className="copilot-panel-header">
            <div>
              <h2>Investigation Chat</h2>
              <p>
                Ask for investigation guidance, response actions, SOAR playbooks,
                evidence plans, SLA analysis, report summaries, or threat hunting
                support.
              </p>
            </div>

            <div className="copilot-chat-actions">
              <button
                className="secondary-btn"
                onClick={() => downloadConversation(messages, context)}
              >
                <Download size={15} />
                Export Chat
              </button>

              <button className="secondary-btn" onClick={clearChat}>
                <RotateCcw size={15} />
                Clear Chat
              </button>

              {loading && (
                <span className="copilot-loading-pill">
                  <Loader2 size={14} />
                  Thinking
                </span>
              )}
            </div>
          </div>

          <div className="copilot-message-list">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onCopy={copyText}
              />
            ))}

            {loading && (
              <div className="copilot-message assistant">
                <div className="copilot-message-icon">
                  <Bot size={16} />
                </div>

                <div className="copilot-message-body copilot-thinking-card">
                  <Loader2 size={16} />
                  <span>AI SOC Copilot is analyzing the case context...</span>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <div className="copilot-input-box">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the SOC Copilot: summarize this incident, recommend SOAR actions, explain SLA risk..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  askCopilot();
                }
              }}
            />

            <button
              className="primary-btn"
              onClick={() => askCopilot()}
              disabled={loading || !input.trim()}
            >
              {loading ? <Loader2 size={16} /> : <Send size={16} />}
              Send
            </button>
          </div>
        </div>

        <div className="copilot-side-stack">
          <div className="spectra-glass-card copilot-context-card">
            <ContextSnapshot
              context={context}
              hasIncidentContext={hasIncidentContext}
            />

            <div className="copilot-context-grid">
              <label>
                Incident ID
                <input
                  value={context.incident_id}
                  onChange={(event) =>
                    updateContextField("incident_id", event.target.value)
                  }
                />
              </label>

              <label>
                Title
                <input
                  value={context.title}
                  onChange={(event) =>
                    updateContextField("title", event.target.value)
                  }
                />
              </label>

              <label>
                Severity
                <select
                  value={context.severity}
                  onChange={(event) =>
                    updateContextField("severity", event.target.value)
                  }
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={context.status}
                  onChange={(event) =>
                    updateContextField("status", event.target.value)
                  }
                >
                  <option>Open</option>
                  <option>Investigating</option>
                  <option>Contained</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </label>

              <label>
                Risk Score
                <input
                  type="number"
                  value={context.risk_score}
                  onChange={(event) =>
                    updateContextField("risk_score", event.target.value)
                  }
                />
              </label>

              <label>
                SLA State
                <input
                  value={context.sla_state}
                  onChange={(event) =>
                    updateContextField("sla_state", event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <div className="spectra-glass-card quick-actions-card">
            <div className="copilot-panel-header compact">
              <div>
                <h2>Quick Actions</h2>
                <p>One-click SOC prompts.</p>
              </div>
            </div>

            <div className="copilot-quick-actions">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.id}
                    onClick={() => askCopilot(action.prompt)}
                    disabled={loading}
                  >
                    <Icon size={17} />

                    <div>
                      <b>{action.title}</b>
                      <span>{action.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="spectra-glass-card copilot-warning-card">
            <AlertTriangle size={18} />

            <div>
              <b>Analyst-in-the-loop</b>
              <p>
                Copilot recommendations are decision-support only. Destructive
                or containment actions should still use approval gates and human
                validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}