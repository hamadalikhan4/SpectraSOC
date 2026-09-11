export const actionMetrics = [
  {
    label: "Total Connectors",
    value: "32",
    trend: "+5 added",
    tone: "success",
  },
  {
    label: "Connected",
    value: "18",
    trend: "56% active",
    tone: "success",
  },
  {
    label: "Available Actions",
    value: "146",
    trend: "Across all tools",
    tone: "info",
  },
  {
    label: "Failed Actions",
    value: "04",
    trend: "-21% today",
    tone: "danger",
  },
];

export const connectors = [
  {
    name: "VirusTotal",
    category: "Threat Intelligence",
    status: "Connected",
    health: "Healthy",
    actions: 12,
    executions: 2481,
    lastUsed: "5 min ago",
    description:
      "Enrich IPs, domains, URLs, and file hashes with multi-engine threat intelligence.",
    capabilities: [
      "Hash reputation lookup",
      "URL scanning",
      "Domain intelligence",
      "IP reputation",
    ],
    auth: "API Key",
    risk: "Low",
  },
  {
    name: "AbuseIPDB",
    category: "Threat Intelligence",
    status: "Connected",
    health: "Healthy",
    actions: 8,
    executions: 1874,
    lastUsed: "9 min ago",
    description:
      "Check IP reputation, abuse confidence score, reports, and malicious activity history.",
    capabilities: [
      "IP abuse score",
      "Reporter history",
      "Geo details",
      "Confidence scoring",
    ],
    auth: "API Key",
    risk: "Low",
  },
  {
    name: "Microsoft Defender",
    category: "Endpoint Security",
    status: "Needs Setup",
    health: "Not Configured",
    actions: 18,
    executions: 0,
    lastUsed: "Never",
    description:
      "Automate endpoint isolation, malware investigation, device actions, and alert enrichment.",
    capabilities: [
      "Isolate endpoint",
      "Collect investigation package",
      "Run antivirus scan",
      "Get device timeline",
    ],
    auth: "OAuth / Tenant",
    risk: "Medium",
  },
  {
    name: "Microsoft Sentinel",
    category: "SIEM",
    status: "Available",
    health: "Ready",
    actions: 22,
    executions: 0,
    lastUsed: "Never",
    description:
      "Create incidents, update alerts, query logs, and trigger automation from SIEM events.",
    capabilities: [
      "Create incident",
      "Run KQL query",
      "Update alert status",
      "Attach evidence",
    ],
    auth: "OAuth / Workspace",
    risk: "Medium",
  },
  {
    name: "Email Gateway",
    category: "Email Security",
    status: "Connected",
    health: "Healthy",
    actions: 10,
    executions: 943,
    lastUsed: "14 min ago",
    description:
      "Quarantine emails, extract headers, block senders, and notify affected users.",
    capabilities: [
      "Quarantine message",
      "Extract headers",
      "Block sender",
      "Notify user",
    ],
    auth: "SMTP / API",
    risk: "Low",
  },
  {
    name: "Slack",
    category: "Collaboration",
    status: "Available",
    health: "Ready",
    actions: 7,
    executions: 0,
    lastUsed: "Never",
    description:
      "Send alerts, post incident updates, create channels, and notify SOC analysts.",
    capabilities: [
      "Send message",
      "Create channel",
      "Mention analyst",
      "Post incident summary",
    ],
    auth: "OAuth",
    risk: "Low",
  },
  {
    name: "Webhook",
    category: "Custom Automation",
    status: "Connected",
    health: "Healthy",
    actions: 6,
    executions: 754,
    lastUsed: "3 min ago",
    description:
      "Trigger external workflows and integrate custom security tools through HTTP requests.",
    capabilities: [
      "POST request",
      "Custom headers",
      "Payload mapping",
      "Response parsing",
    ],
    auth: "Token / Header",
    risk: "Medium",
  },
  {
    name: "Custom Python Action",
    category: "Custom Automation",
    status: "Beta",
    health: "Sandboxed",
    actions: 14,
    executions: 126,
    lastUsed: "1 hour ago",
    description:
      "Run controlled Python automation scripts for custom incident response logic.",
    capabilities: [
      "Run script",
      "Parse output",
      "Return artifacts",
      "Custom logic",
    ],
    auth: "Sandbox Policy",
    risk: "High",
  },
];

export const aiConnectorInsights = [
  {
    title: "Connector Gap Detected",
    detail:
      "Microsoft Defender is not connected. Endpoint containment playbooks cannot isolate compromised hosts yet.",
  },
  {
    title: "High-Value Automation",
    detail:
      "VirusTotal and AbuseIPDB are the most used connectors. Enable caching to reduce duplicate API calls.",
  },
  {
    title: "Custom Action Risk",
    detail:
      "Python actions are powerful but should require approval before production execution.",
  },
];