export const promptTemplates = [
  {
    title: "Phishing Response",
    prompt:
      "Create a SOAR playbook that analyzes a suspicious phishing email, extracts IOCs, enriches them using VirusTotal and AbuseIPDB, creates an incident if risk is high, and notifies the SOC analyst.",
  },
  {
    title: "Malware Containment",
    prompt:
      "Create a playbook for malware detection that enriches file hashes, checks endpoint details, isolates the endpoint if malicious, creates evidence, and alerts the analyst.",
  },
  {
    title: "Brute Force Attack",
    prompt:
      "Generate an automation workflow for brute force login detection that checks failed login count, enriches source IP, maps MITRE technique, creates an incident, and recommends account lockout.",
  },
];

export const generatedPlaybook = {
  name: "AI Generated Phishing Triage",
  category: "Email Security",
  confidence: 94,
  estimatedRuntime: "42 seconds",
  riskLevel: "Medium",
  description:
    "AI-generated automation workflow for suspicious email investigation, IOC enrichment, risk scoring, incident creation, and analyst notification.",
};

export const aiWorkflowSteps = [
  {
    type: "Trigger",
    name: "Suspicious Email Alert",
    detail: "Starts when SIEM or email gateway detects a suspicious message.",
  },
  {
    type: "Action",
    name: "Extract Email Indicators",
    detail: "Extract sender, URLs, domains, IPs, attachments, and file hashes.",
  },
  {
    type: "Action",
    name: "Threat Intelligence Enrichment",
    detail: "Query VirusTotal, AbuseIPDB, and internal reputation sources.",
  },
  {
    type: "Decision",
    name: "Risk Score Evaluation",
    detail: "If score is above threshold, escalate to incident response.",
  },
  {
    type: "Action",
    name: "Create Incident",
    detail: "Create a High or Medium severity incident with extracted evidence.",
  },
  {
    type: "Action",
    name: "Notify SOC Analyst",
    detail: "Send analyst notification and attach AI-generated summary.",
  },
];

export const validationFindings = [
  {
    title: "Safe Automation Boundary",
    status: "Passed",
    detail:
      "The playbook does not perform destructive actions without analyst approval.",
  },
  {
    title: "Connector Availability",
    status: "Warning",
    detail:
      "Microsoft Defender connector is not configured. Endpoint containment will require setup later.",
  },
  {
    title: "Audit Logging",
    status: "Passed",
    detail:
      "All generated actions can be logged for timeline, evidence, and compliance review.",
  },
];

export const mitreMappings = [
  {
    technique: "T1566",
    name: "Phishing",
  },
  {
    technique: "T1204",
    name: "User Execution",
  },
  {
    technique: "T1059",
    name: "Command and Scripting Interpreter",
  },
];

export const connectorRequirements = [
  "VirusTotal",
  "AbuseIPDB",
  "Email Gateway",
  "Incident Repository",
  "Notification Service",
];