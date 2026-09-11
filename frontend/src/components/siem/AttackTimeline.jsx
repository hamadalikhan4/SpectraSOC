import {
  Globe,
  Shield,
  KeyRound,
  Terminal,
  Database,
  Server,
  AlertTriangle,
} from "lucide-react";

export default function AttackTimeline({ selectedCase }) {
  if (!selectedCase) {
    return (
      <div className="siem-card">
        <h3>Attack Timeline</h3>
        <div className="result">Select a correlation case to view timeline.</div>
      </div>
    );
  }

  const events = selectedCase.attack_chain || [];

  const getIcon = (eventType = "") => {
    const event = eventType.toLowerCase();

    if (event.includes("login")) return KeyRound;
    if (event.includes("command")) return Terminal;
    if (event.includes("power")) return Terminal;
    if (event.includes("sql")) return Database;
    if (event.includes("scan")) return Shield;

    return Server;
  };

  return (
    <div className="siem-card">
      <div className="siem-card-head">
        <div>
          <h3>Attack Timeline</h3>
          <p className="subtitle">
            Chronological reconstruction of correlated attacker activity.
          </p>
        </div>

        <span className={`pill ${selectedCase.severity}`}>
          {selectedCase.severity}
        </span>
      </div>

      <div className="attack-timeline">
        <div className="timeline-entry source">
          <div className="timeline-node">
            <Globe size={18} />
          </div>

          <div>
            <strong>External Source</strong>
            <p>{selectedCase.source_ip || "Unknown attacker IP"}</p>
          </div>
        </div>

        {events.map((event, index) => {
          const Icon = getIcon(event.event_type);

          return (
            <div className="timeline-entry" key={index}>
              <div
                className={
                  event.risk_score >= 80
                    ? "timeline-node critical"
                    : "timeline-node"
                }
              >
                {event.risk_score >= 80 ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Icon size={18} />
                )}
              </div>

              <div>
                <strong>{event.event_type?.replaceAll("_", " ")}</strong>
                <p>
                  {event.mitre_technique || "N/A"} • {event.mitre_tactic || "Unknown"} • Risk{" "}
                  {event.risk_score}
                </p>
                <small>{event.timestamp}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}