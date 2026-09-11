const AUDIT_KEY = "spectrasoc_soar_audit_logs_v1";

export function readSoarAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logSoarAudit(event = {}) {
  const logs = readSoarAuditLogs();

  const auditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    actor: event.actor || "SOC Analyst",
    source: event.source || "SOAR",
    action: event.action || "Unknown Action",
    status: event.status || "Info",
    entity_type: event.entity_type || "Playbook",
    entity_id: event.entity_id || "",
    entity_name: event.entity_name || "",
    severity: event.severity || "Medium",
    details: event.details || {},
  };

  const updated = [auditEvent, ...logs].slice(0, 500);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));

  return auditEvent;
}

export function clearSoarAuditLogs() {
  localStorage.removeItem(AUDIT_KEY);
}

export function exportSoarAuditLogs() {
  const logs = readSoarAuditLogs();

  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `soar-audit-logs-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}