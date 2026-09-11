export const settingsMetrics = [
  {
    label: "Automation Workers",
    value: "06",
    trend: "4 active, 2 standby",
    tone: "success",
  },
  {
    label: "Queue Depth",
    value: "13",
    trend: "3 high priority",
    tone: "warning",
  },
  {
    label: "Secrets Stored",
    value: "18",
    trend: "Encrypted vault",
    tone: "info",
  },
  {
    label: "Audit Events",
    value: "2.4K",
    trend: "Last 24 hours",
    tone: "success",
  },
];

export const workerConfig = [
  {
    name: "soar-worker-01",
    status: "Active",
    load: "68%",
    queue: "High Priority",
    region: "Primary Node",
  },
  {
    name: "soar-worker-02",
    status: "Active",
    load: "44%",
    queue: "Default Queue",
    region: "Primary Node",
  },
  {
    name: "soar-worker-03",
    status: "Standby",
    load: "0%",
    queue: "Failover",
    region: "Backup Node",
  },
];

export const queueConfig = [
  {
    name: "High Priority",
    description: "Critical incident response playbooks",
    workers: 2,
    maxRetries: 3,
    timeout: "90s",
  },
  {
    name: "Default Queue",
    description: "Standard SOAR playbook executions",
    workers: 3,
    maxRetries: 2,
    timeout: "120s",
  },
  {
    name: "Background Jobs",
    description: "Low-priority enrichment and report jobs",
    workers: 1,
    maxRetries: 1,
    timeout: "300s",
  },
];

export const auditEvents = [
  {
    time: "10:41",
    event: "Playbook setting updated",
    actor: "Admin",
    severity: "Info",
  },
  {
    time: "10:32",
    event: "Connector validation completed",
    actor: "System",
    severity: "Success",
  },
  {
    time: "10:17",
    event: "Secret rotation policy checked",
    actor: "Security Engine",
    severity: "Info",
  },
  {
    time: "09:58",
    event: "Failed execution retry limit reached",
    actor: "SOAR Worker",
    severity: "Warning",
  },
];