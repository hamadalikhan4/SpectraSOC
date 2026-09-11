export const executionMetrics = [
  {
    label: "Running Executions",
    value: "07",
    trend: "+2 live",
    tone: "info",
  },
  {
    label: "Completed Today",
    value: "148",
    trend: "96.4% success",
    tone: "success",
  },
  {
    label: "Failed Runs",
    value: "05",
    trend: "-18% vs yesterday",
    tone: "danger",
  },
  {
    label: "Avg Runtime",
    value: "42s",
    trend: "8s faster",
    tone: "success",
  },
  {
    label: "Queue Size",
    value: "13",
    trend: "3 high priority",
    tone: "warning",
  },
  {
    label: "Time Saved",
    value: "126h",
    trend: "Last 30 days",
    tone: "success",
  },
];

export const liveEvents = [
  {
    time: "09:41:10",
    title: "Playbook execution started",
    detail: "Phishing Email Triage triggered by suspicious mailbox alert",
    status: "running",
  },
  {
    time: "09:41:12",
    title: "IOC extraction completed",
    detail: "2 URLs, 1 sender domain and 1 attachment hash extracted",
    status: "success",
  },
  {
    time: "09:41:15",
    title: "Threat intelligence enrichment",
    detail: "VirusTotal and AbuseIPDB lookup in progress",
    status: "running",
  },
  {
    time: "09:41:19",
    title: "Incident created",
    detail: "INC-SOAR-1047 created with High severity",
    status: "success",
  },
  {
    time: "09:41:22",
    title: "Analyst notification sent",
    detail: "SOC L2 analyst notified for validation",
    status: "success",
  },
];

export const executions = [
  {
    id: "EXE-9821",
    playbook: "Phishing Email Triage",
    trigger: "Suspicious Email IOC",
    severity: "High",
    status: "Running",
    runtime: "00:00:34",
    analyst: "AI Worker",
    started: "2 min ago",
    duration: "34s",
    incident: "INC-SOAR-1047",
    progress: 72,
    steps: [
      {
        name: "Trigger Received",
        status: "Completed",
        time: "09:41:10",
        output: "Mailbox alert received from SIEM correlation rule.",
      },
      {
        name: "Extract Indicators",
        status: "Completed",
        time: "09:41:12",
        output: "2 URLs, 1 domain, 1 hash extracted.",
      },
      {
        name: "VirusTotal Lookup",
        status: "Running",
        time: "09:41:15",
        output: "Provider enrichment in progress.",
      },
      {
        name: "Create Incident",
        status: "Waiting",
        time: "-",
        output: "Waiting for risk score decision.",
      },
    ],
    logs: [
      "09:41:10 Trigger received",
      "09:41:12 IOC extraction completed",
      "09:41:15 VirusTotal lookup started",
      "09:41:18 AbuseIPDB lookup started",
      "09:41:22 Risk score calculated",
    ],
  },
  {
    id: "EXE-9818",
    playbook: "Malware Containment",
    trigger: "EDR Malware Alert",
    severity: "Critical",
    status: "Completed",
    runtime: "00:01:12",
    analyst: "Automation Worker",
    started: "12 min ago",
    duration: "72s",
    incident: "INC-SOAR-1043",
    progress: 100,
    steps: [
      {
        name: "Trigger Received",
        status: "Completed",
        time: "09:24:02",
        output: "EDR alert received.",
      },
      {
        name: "Hash Enrichment",
        status: "Completed",
        time: "09:24:12",
        output: "Malware confidence: 93%.",
      },
      {
        name: "Endpoint Isolation",
        status: "Completed",
        time: "09:24:39",
        output: "Endpoint isolated successfully.",
      },
      {
        name: "Notify Analyst",
        status: "Completed",
        time: "09:25:14",
        output: "Critical alert delivered.",
      },
    ],
    logs: [
      "09:24:02 Malware playbook started",
      "09:24:12 Hash enrichment completed",
      "09:24:39 Endpoint isolated",
      "09:25:14 Analyst notified",
      "09:25:14 Execution completed successfully",
    ],
  },
  {
    id: "EXE-9815",
    playbook: "Brute Force Response",
    trigger: "Failed Login Spike",
    severity: "Medium",
    status: "Failed",
    runtime: "00:00:49",
    analyst: "AI Worker",
    started: "28 min ago",
    duration: "49s",
    incident: "INC-SOAR-1039",
    progress: 58,
    steps: [
      {
        name: "Trigger Received",
        status: "Completed",
        time: "09:12:11",
        output: "Authentication anomaly detected.",
      },
      {
        name: "User Lookup",
        status: "Completed",
        time: "09:12:18",
        output: "Affected user identified.",
      },
      {
        name: "Account Lock",
        status: "Failed",
        time: "09:12:42",
        output: "IAM connector timeout.",
      },
    ],
    logs: [
      "09:12:11 Brute force playbook started",
      "09:12:18 User lookup completed",
      "09:12:42 IAM connector timeout",
      "09:12:44 Retry attempt 1 failed",
      "09:13:00 Execution failed",
    ],
  },
  {
    id: "EXE-9811",
    playbook: "Suspicious IP Enrichment",
    trigger: "IOC Submitted",
    severity: "Medium",
    status: "Queued",
    runtime: "Pending",
    analyst: "SOC Analyst",
    started: "Queued",
    duration: "-",
    incident: "-",
    progress: 0,
    steps: [
      {
        name: "Queued",
        status: "Waiting",
        time: "-",
        output: "Waiting for available automation worker.",
      },
    ],
    logs: ["Execution queued. Waiting for worker assignment."],
  },
];

export const aiInsights = [
  {
    title: "Connector Bottleneck Detected",
    detail:
      "VirusTotal lookup is consuming 47% of total execution runtime. Enable caching for repeated IOC checks.",
  },
  {
    title: "Failure Pattern Found",
    detail:
      "IAM connector timeouts caused 3 failed Brute Force Response runs today.",
  },
  {
    title: "Optimization Opportunity",
    detail:
      "Merge duplicate enrichment steps in phishing workflows to reduce average runtime by 28%.",
  },
];