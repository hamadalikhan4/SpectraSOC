import API from "./api";

const USE_MOCK_COPILOT = true;

function getContext(payload = {}) {
  return payload.context || payload.incident || payload.alert || payload || {};
}

function getPrompt(payload = {}) {
  return String(payload.prompt || payload.message || payload.question || "");
}

function hasText(value, words = []) {
  const text = String(value || "").toLowerCase();
  return words.some((word) => text.includes(word));
}

function contextSummary(context = {}) {
  const siemAlert = context.siem_alert || context.alert || {};

  return {
    source: context.source || "SpectraSOC",
    id: context.incident_id || context.id || siemAlert.id || "N/A",
    title: context.title || siemAlert.title || "Security Event",
    severity: context.severity || siemAlert.severity || "Medium",
    status: context.status || siemAlert.status || "Open",
    category: context.category || siemAlert.category || "Security",
    risk_score: context.risk_score || siemAlert.risk || 0,
    confidence: context.confidence || siemAlert.confidence || 0,
    detection_source:
      context.detection_source || siemAlert.source || "SOC Telemetry",
    host: siemAlert.host || context.host || "N/A",
    user: siemAlert.user || context.user || "N/A",
    ip: siemAlert.ip || context.ip || "N/A",
    tactic: siemAlert.tactic || context.tactic || "N/A",
    technique: siemAlert.technique || context.technique || "N/A",
    rule: siemAlert.rule || context.description || "N/A",
    raw: siemAlert.raw || context.raw || "",
    evidence_count: Array.isArray(context.evidence)
      ? context.evidence.length
      : 0,
    timeline_count: Array.isArray(context.timeline)
      ? context.timeline.length
      : 0,
    notes_count: Array.isArray(context.notes) ? context.notes.length : 0,
    ai_insights_count: Array.isArray(context.ai_insights)
      ? context.ai_insights.length
      : 0,
  };
}

function buildSIEMAlertAnalysis(context = {}) {
  const summary = contextSummary(context);

  const shouldEscalate =
    String(summary.severity).toLowerCase().includes("critical") ||
    Number(summary.risk_score) >= 85;

  return `### AI SIEM Analyst Assessment

**Alert:** ${summary.title}  
**Severity:** ${summary.severity}  
**Risk Score:** ${summary.risk_score}/100  
**Confidence:** ${summary.confidence}%  
**Source:** ${summary.detection_source}

### What this alert means

This SIEM alert indicates suspicious activity involving **${summary.host}**, user **${summary.user}**, and IOC/source IP **${summary.ip}**. The detection rule matched: **${summary.rule}**.

### MITRE ATT&CK Mapping

- **Tactic:** ${summary.tactic}
- **Technique:** ${summary.technique}

This behavior should be reviewed as a potential attacker activity chain, especially if the event is linked with unusual login activity, command execution, brute-force behavior, exfiltration patterns, or suspicious outbound communication.

### Investigation Steps

1. Validate the source IP / IOC with threat intelligence.
2. Review related events from host **${summary.host}**.
3. Check recent activity for user **${summary.user}**.
4. Search for the same MITRE technique **${summary.technique}** across other assets.
5. Compare the raw log with baseline behavior.
6. Attach the raw SIEM event as evidence.
7. Create an incident if the behavior is confirmed suspicious.

### Evidence to Collect

- Raw SIEM event.
- Authentication logs.
- Endpoint process tree.
- Network connection logs.
- Firewall allow/deny logs.
- User activity timeline.
- Any related alerts within the last 24 hours.

### Containment Recommendation

${
  shouldEscalate
    ? "Because the risk is high, create an incident and prepare a SOAR playbook. Destructive actions such as blocking IPs, disabling accounts, or isolating hosts should require analyst approval."
    : "Continue triage first. Create an incident only if additional related activity is found."
}

### Decision

**Recommended action:** ${
    shouldEscalate
      ? "Create incident and prepare SOAR handoff."
      : "Continue monitoring and collect more evidence."
  }`;
}

function buildSOARRecommendation(context = {}) {
  const summary = contextSummary(context);

  const playbook =
    Number(summary.risk_score) >= 90 ||
    String(summary.severity).toLowerCase().includes("critical")
      ? "Critical Alert Containment"
      : "Standard SIEM Alert Triage";

  return `### SOAR Playbook Recommendation

**Recommended Playbook:** ${playbook}

### Trigger Context

- Alert: ${summary.title}
- Severity: ${summary.severity}
- Risk: ${summary.risk_score}/100
- IOC: ${summary.ip}
- Host: ${summary.host}
- User: ${summary.user}
- MITRE: ${summary.technique}

### Suggested Workflow

1. Enrich IOC with threat intelligence.
2. Search related SIEM events.
3. Pull endpoint telemetry for the affected host.
4. Validate user activity.
5. Create incident if confirmed malicious.
6. Require approval before blocking IP, isolating host, or disabling account.

### Approval Gate

Approval should be required before any destructive action.`;
}

function buildEvidenceAnalysis(context = {}) {
  const summary = contextSummary(context);

  return `### Evidence Collection Plan

For **${summary.title}**, collect and preserve:

1. Raw SIEM log event.
2. Host logs from **${summary.host}**.
3. User activity for **${summary.user}**.
4. Network telemetry involving **${summary.ip}**.
5. Endpoint process tree.
6. Firewall logs.
7. Any correlated events mapped to **${summary.technique}**.

Maintain chain of custody and attach all artifacts to the incident workspace.`;
}

function buildSLAAnalysis(context = {}) {
  const summary = contextSummary(context);

  const priority =
    Number(summary.risk_score) >= 90
      ? "P0"
      : Number(summary.risk_score) >= 75
        ? "P1"
        : "P2";

  return `### SLA / Priority Assessment

**Alert:** ${summary.title}  
**Severity:** ${summary.severity}  
**Risk:** ${summary.risk_score}/100  
**Recommended Priority:** ${priority}

### Recommendation

${
  priority === "P0"
    ? "Immediate escalation is recommended. Assign to IR lead and begin containment planning."
    : priority === "P1"
      ? "Prioritize analyst triage and create an incident if supporting evidence confirms malicious behavior."
      : "Monitor and enrich before escalation."
}`;
}

function buildReportDraft(context = {}) {
  const summary = contextSummary(context);

  return `### SIEM Alert Report Draft

**Title:** ${summary.title}  
**Source:** ${summary.detection_source}  
**Severity:** ${summary.severity}  
**Risk Score:** ${summary.risk_score}/100  
**MITRE:** ${summary.technique}

### Executive Summary

SpectraSOC detected a SIEM alert involving **${summary.host}**, user **${summary.user}**, and IOC/source IP **${summary.ip}**. The alert matched the detection rule: **${summary.rule}**.

### Technical Summary

The event is mapped to **${summary.tactic} / ${summary.technique}** and should be validated using endpoint, authentication, and network evidence.

### Recommended Next Steps

1. Validate IOC reputation.
2. Review related logs.
3. Attach raw event as evidence.
4. Create an incident if confirmed suspicious.
5. Prepare SOAR handoff if containment is needed.`;
}

function buildThreatHunt(context = {}) {
  const summary = contextSummary(context);

  return `### Threat Hunt Queries

Use these hunt ideas for **${summary.title}**:

**Host-based hunt**
\`\`\`
host="${summary.host}" AND technique="${summary.technique}"
\`\`\`

**User-based hunt**
\`\`\`
user="${summary.user}" AND risk_score >= 70
\`\`\`

**IOC-based hunt**
\`\`\`
ip="${summary.ip}" OR raw CONTAINS "${summary.ip}"
\`\`\`

**MITRE hunt**
\`\`\`
mitre_technique="${summary.technique}" AND timestamp >= now()-24h
\`\`\`

**Rule hunt**
\`\`\`
rule="${summary.rule}"
\`\`\``;
}

function buildTechnicalFindings(context = {}) {
  const summary = contextSummary(context);

  return `### Technical Findings

The alert **${summary.title}** was detected by **${summary.detection_source}** and involves:

- Host: ${summary.host}
- User: ${summary.user}
- IOC/IP: ${summary.ip}
- MITRE Technique: ${summary.technique}
- Risk Score: ${summary.risk_score}/100
- Confidence: ${summary.confidence}%

The matched rule suggests suspicious behavior requiring validation through correlated logs and asset context.`;
}

function buildRemediationPlan(context = {}) {
  const summary = contextSummary(context);

  return `### Remediation Plan

1. Validate IOC **${summary.ip}**.
2. Review host **${summary.host}**.
3. Review user **${summary.user}**.
4. Search related logs across SIEM.
5. Create an incident if malicious activity is confirmed.
6. Run SOAR only after approval.
7. Block IOC or isolate host only when confirmed and authorized.`;
}

function buildAnalystConclusion(context = {}) {
  const summary = contextSummary(context);

  return `### Analyst Conclusion

The alert **${summary.title}** requires analyst validation. Based on the current severity **${summary.severity}** and risk score **${summary.risk_score}/100**, this event should be investigated with SIEM, endpoint, identity, and network telemetry before containment actions are executed.`;
}

function buildGenericIncidentSummary(context = {}) {
  const summary = contextSummary(context);

  return `### Incident / Alert Summary

**Title:** ${summary.title}  
**Severity:** ${summary.severity}  
**Risk:** ${summary.risk_score}/100  
**Status:** ${summary.status}  
**Source:** ${summary.detection_source}

This case should be reviewed by a SOC analyst. Validate evidence, check related activity, map to MITRE ATT&CK, and escalate if malicious behavior is confirmed.`;
}

function buildMockResponse(payload = {}) {
  const prompt = getPrompt(payload);
  const context = getContext(payload);

  let answer = "";

  if (
    context?.source === "SIEM Alert Triage" ||
    context?.siem_alert ||
    hasText(prompt, ["siem", "alert triage", "analyze siem", "raw log"])
  ) {
    answer = buildSIEMAlertAnalysis(context);
  } else if (
    hasText(prompt, [
      "technical findings",
      "technical analysis",
      "technical finding",
    ])
  ) {
    answer = buildTechnicalFindings(context);
  } else if (
    hasText(prompt, [
      "remediation",
      "containment",
      "eradication",
      "recovery",
      "prevention",
    ])
  ) {
    answer = buildRemediationPlan(context);
  } else if (
    hasText(prompt, ["analyst conclusion", "closure", "conclusion"])
  ) {
    answer = buildAnalystConclusion(context);
  } else if (
    hasText(prompt, ["soar", "playbook", "automation", "recommend soar"])
  ) {
    answer = buildSOARRecommendation(context);
  } else if (
    hasText(prompt, ["evidence", "forensic", "custody", "hash"])
  ) {
    answer = buildEvidenceAnalysis(context);
  } else if (hasText(prompt, ["sla", "priority", "escalation", "breach"])) {
    answer = buildSLAAnalysis(context);
  } else if (hasText(prompt, ["report", "draft", "executive summary"])) {
    answer = buildReportDraft(context);
  } else if (hasText(prompt, ["hunt", "threat hunt", "hunting", "query"])) {
    answer = buildThreatHunt(context);
  } else {
    answer = buildGenericIncidentSummary(context);
  }

  return {
    id: `AI-${Date.now()}`,
    role: "assistant",
    type: "analysis",
    answer,
    response: answer,
    message: answer,
    context_summary: contextSummary(context),
    recommendations: [
      "Validate IOC reputation.",
      "Review related SIEM events.",
      "Collect endpoint and network evidence.",
      "Create incident if confirmed malicious.",
      "Use SOAR only with approval for destructive actions.",
    ],
    created_at: new Date().toISOString(),
  };
}

const COPILOT_API = {
  ask: async (payload = {}) => {
    if (!USE_MOCK_COPILOT) {
      try {
        const res = await API.post("/api/v1/copilot/ask", payload);
        return res.data;
      } catch (error) {
        console.log("Using mock Copilot response because API failed", error);
        return buildMockResponse(payload);
      }
    }

    return buildMockResponse(payload);
  },

  summarizeIncident: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Summarize this incident or SIEM alert for SOC triage.",
      context,
    });
  },

  recommendSOAR: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Recommend a SOAR playbook and automation workflow.",
      context,
    });
  },

  recommendSOAREngine: async (context = {}) => {
    return COPILOT_API.ask({
      prompt:
        "Use the AI SOAR playbook recommendation engine to recommend a playbook.",
      context,
    });
  },

  analyzeEvidence: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Analyze evidence and recommend what evidence to collect next.",
      context,
    });
  },

  analyzeSLA: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Analyze SLA risk, escalation priority, and response urgency.",
      context,
    });
  },

  draftReport: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Draft an executive report for this security case.",
      context,
    });
  },

  generateTechnicalFindings: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Generate technical findings for this case.",
      context,
    });
  },

  generateRemediationPlan: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Generate remediation and containment plan.",
      context,
    });
  },

  generateAnalystConclusion: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Generate analyst conclusion and closure guidance.",
      context,
    });
  },

  threatHunt: async (context = {}) => {
    return COPILOT_API.ask({
      prompt: "Generate threat hunting queries and investigation pivots.",
      context,
    });
  },
};

export default COPILOT_API;
export { COPILOT_API };