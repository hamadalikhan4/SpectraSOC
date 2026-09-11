const CONNECTOR_MODE_KEY = "spectrasoc_soar_connector_mode_v1";

const CONNECTOR_PROFILES = [
  {
    match: ["virustotal", "virus total"],
    name: "VirusTotal",
    type: "Threat Intelligence",
    health: "Ready",
    latencyMs: 850,
  },
  {
    match: ["abuseipdb", "abuse ipdb"],
    name: "AbuseIPDB",
    type: "Threat Intelligence",
    health: "Ready",
    latencyMs: 760,
  },
  {
    match: ["geoip", "geo ip"],
    name: "GeoIP",
    type: "Context Enrichment",
    health: "Ready",
    latencyMs: 420,
  },
  {
    match: ["siem", "splunk", "sentinel", "elastic"],
    name: "SIEM",
    type: "Security Monitoring",
    health: "Ready",
    latencyMs: 680,
  },
  {
    match: ["microsoft defender", "defender", "edr"],
    name: "Microsoft Defender",
    type: "Endpoint Security",
    health: "Approval Required",
    latencyMs: 900,
  },
  {
    match: ["email gateway", "email", "mail"],
    name: "Email Gateway",
    type: "Email Security",
    health: "Ready",
    latencyMs: 520,
  },
  {
    match: ["webhook", "notification"],
    name: "Webhook",
    type: "Notification",
    health: "Ready",
    latencyMs: 350,
  },
  {
    match: ["firewall"],
    name: "Firewall",
    type: "Network Security",
    health: "Approval Required",
    latencyMs: 880,
  },
  {
    match: ["dlp"],
    name: "DLP",
    type: "Data Security",
    health: "Approval Required",
    latencyMs: 790,
  },
  {
    match: ["identity provider", "identity", "iam", "azure ad"],
    name: "Identity Provider",
    type: "Identity Security",
    health: "Ready",
    latencyMs: 620,
  },
  {
    match: ["soar engine", "soar"],
    name: "SOAR Engine",
    type: "Automation Core",
    health: "Ready",
    latencyMs: 260,
  },
];

const DANGEROUS_KEYWORDS = [
  "isolate",
  "bulk_isolate",
  "block",
  "disable",
  "contain",
  "quarantine",
  "firewall",
  "account.disable",
  "host.isolate",
  "ransomware",
  "dlp",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getConnectorMode() {
  return localStorage.getItem(CONNECTOR_MODE_KEY) || "mock";
}

export function setConnectorMode(mode) {
  localStorage.setItem(CONNECTOR_MODE_KEY, mode);
  return mode;
}

export function resolveConnectorProfile(connectorName = "SOAR Engine") {
  const value = String(connectorName || "").toLowerCase();

  const profile = CONNECTOR_PROFILES.find((item) =>
    item.match.some((keyword) => value.includes(keyword))
  );

  return (
    profile || {
      name: connectorName || "Unknown Connector",
      type: "Custom Connector",
      health: "Mock Only",
      latencyMs: 500,
    }
  );
}

export function isDangerousAction(step = {}) {
  const text = `${step.name || ""} ${step.action_key || ""} ${
    step.connector_name || ""
  }`.toLowerCase();

  return (
    step.config?.require_approval === true ||
    DANGEROUS_KEYWORDS.some((keyword) => text.includes(keyword))
  );
}

export function isStepApproved(step = {}, approvalState = {}) {
  const approval = approvalState?.approvals?.[step.step_order];

  return approval?.status === "Approved";
}

export function buildConnectorExecutionPlan(steps = [], approvalState = {}) {
  return [...steps]
    .sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))
    .map((step) => {
      const profile = resolveConnectorProfile(step.connector_name);
      const dangerous = isDangerousAction(step);
      const approved = isStepApproved(step, approvalState);

      return {
        step,
        connector: profile,
        dangerous,
        approved,
        blocked: dangerous && !approved,
        mode: getConnectorMode(),
      };
    });
}

function buildMockOutput(step = {}, profile = {}) {
  const connector = profile.name.toLowerCase();
  const action = String(step.action_key || "").toLowerCase();

  if (connector.includes("virustotal")) {
    return {
      provider: "VirusTotal",
      reputation_score: action.includes("hash") ? 88 : 72,
      malicious_votes: action.includes("hash") ? 14 : 7,
      suspicious_votes: 3,
      verdict: "Suspicious / Malicious indicators found",
    };
  }

  if (connector.includes("abuseipdb")) {
    return {
      provider: "AbuseIPDB",
      abuse_confidence_score: 76,
      total_reports: 23,
      last_reported_at: new Date().toISOString(),
      verdict: "High abuse confidence source detected",
    };
  }

  if (connector.includes("geoip")) {
    return {
      provider: "GeoIP",
      country: "United States",
      city: "Mountain View",
      asn: "AS15169",
      organization: "Google LLC",
      verdict: "Geo context enriched",
    };
  }

  if (connector.includes("siem")) {
    return {
      provider: "SIEM",
      events_matched: 42,
      lookback_hours: step.config?.lookback_hours || 24,
      correlated_alerts: 5,
      verdict: "Related security events found",
    };
  }

  if (connector.includes("microsoft defender")) {
    return {
      provider: "Microsoft Defender",
      endpoint: "WIN-SOC-042",
      device_risk: "High",
      process_tree_collected: true,
      isolation_state: action.includes("isolate") ? "Isolation queued" : "No isolation requested",
      verdict: "Endpoint response action prepared",
    };
  }

  if (connector.includes("email")) {
    return {
      provider: "Email Gateway",
      message_id: `msg-${Date.now()}`,
      urls_extracted: 4,
      ips_extracted: 2,
      hashes_extracted: 1,
      verdict: "Email indicators extracted",
    };
  }

  if (connector.includes("webhook")) {
    return {
      provider: "Webhook",
      delivery_status: "Delivered",
      channel: step.config?.priority || "soc-alerts",
      notification_id: `notify-${Date.now()}`,
      verdict: "Notification sent",
    };
  }

  if (connector.includes("firewall")) {
    return {
      provider: "Firewall",
      rule_action: action.includes("block") ? "Block rule staged" : "Policy check completed",
      change_ticket_required: true,
      verdict: "Firewall action requires approval in live mode",
    };
  }

  if (connector.includes("dlp")) {
    return {
      provider: "DLP",
      sensitive_labels_found: ["Confidential", "PII"],
      matched_events: 8,
      verdict: "Sensitive data movement detected",
    };
  }

  if (connector.includes("identity")) {
    return {
      provider: "Identity Provider",
      targeted_users: 3,
      lockout_status_checked: true,
      risky_signins_found: 6,
      verdict: "Identity context enriched",
    };
  }

  return {
    provider: profile.name || "SOAR Engine",
    decision_evaluated: step.step_type === "Decision",
    automation_result: "Step completed in mock mode",
    verdict: "Mock execution completed",
  };
}

export async function executeConnectorStep(step = {}, options = {}) {
  const {
    mode = getConnectorMode(),
    approvalState = {},
    playbook = {},
  } = options;

  const profile = resolveConnectorProfile(step.connector_name);
  const dangerous = isDangerousAction(step);
  const approved = isStepApproved(step, approvalState);

  const startedAt = new Date().toISOString();

  if (dangerous && !approved) {
    return {
      step_order: step.step_order,
      step_name: step.name,
      action_key: step.action_key,
      connector_name: profile.name,
      connector_type: profile.type,
      mode,
      status: "Blocked",
      severity: "High",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      duration_ms: 0,
      output_payload: {
        reason: "Approval required before executing dangerous action.",
        dangerous_action: true,
        approved: false,
      },
      logs: [
        "Approval gate evaluated",
        "Dangerous action detected",
        "Execution blocked until approval is granted",
      ],
    };
  }

  if (mode === "real") {
    await wait(300);

    return {
      step_order: step.step_order,
      step_name: step.name,
      action_key: step.action_key,
      connector_name: profile.name,
      connector_type: profile.type,
      mode,
      status: "Skipped",
      severity: "Medium",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      duration_ms: 300,
      output_payload: {
        reason: "Real connector execution placeholder.",
        live_mode_ready: false,
        required_configuration: [
          "API credentials",
          "Connector base URL",
          "Action-specific request schema",
          "Permission and approval policy",
        ],
      },
      logs: [
        "Real execution mode selected",
        "Live connector credentials are not configured",
        "Step skipped safely",
      ],
    };
  }

  await wait(profile.latencyMs);

  const completedAt = new Date().toISOString();

  return {
    step_order: step.step_order,
    step_name: step.name,
    action_key: step.action_key,
    connector_name: profile.name,
    connector_type: profile.type,
    mode,
    status: "Completed",
    severity: dangerous ? "High" : playbook.severity || "Medium",
    started_at: startedAt,
    completed_at: completedAt,
    duration_ms: profile.latencyMs,
    output_payload: buildMockOutput(step, profile),
    logs: [
      `Connector selected: ${profile.name}`,
      `Execution mode: ${mode}`,
      `Action key: ${step.action_key}`,
      "Input payload normalized",
      "Mock connector response generated",
      "Step completed successfully",
    ],
  };
}

export function summarizeConnectorResults(results = []) {
  return {
    total: results.length,
    completed: results.filter((item) => item.status === "Completed").length,
    blocked: results.filter((item) => item.status === "Blocked").length,
    skipped: results.filter((item) => item.status === "Skipped").length,
    failed: results.filter((item) => item.status === "Failed").length,
  };
}