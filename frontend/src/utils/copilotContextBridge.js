const COPILOT_CONTEXT_KEY = "spectrasoc_pending_copilot_context_v1";

export function buildIncidentCopilotContext({
  incident,
  caseStatus,
  timeline = [],
  evidence = [],
  notes = [],
  aiInsights = [],
}) {
  return {
    source: "Incident Command Center",
    sent_at: new Date().toISOString(),
    incident_id: incident?.id || "",
    title: incident?.title || "",
    severity: incident?.severity || "Medium",
    priority: incident?.priority || "P2",
    status: caseStatus || incident?.status || "Open",
    category: incident?.category || "Security Incident",
    detection_source: incident?.source || "SOC Platform",
    assigned_to: incident?.assigned_to || "Unassigned",
    risk_score: incident?.risk_score || 0,
    sla_due_at: incident?.sla_due_at || "",
    linked_soar_execution: incident?.linked_soar_execution || "",
    tags: incident?.tags || [],
    description: incident?.description || "",
    timeline,
    evidence,
    notes,
    ai_insights: aiInsights,
  };
}

export function saveCopilotContext(context) {
  localStorage.setItem(COPILOT_CONTEXT_KEY, JSON.stringify(context));

  window.dispatchEvent(
    new CustomEvent("spectrasoc:copilot-context", {
      detail: context,
    })
  );

  return context;
}

export function readCopilotContext() {
  try {
    const raw = localStorage.getItem(COPILOT_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCopilotContext() {
  localStorage.removeItem(COPILOT_CONTEXT_KEY);
}