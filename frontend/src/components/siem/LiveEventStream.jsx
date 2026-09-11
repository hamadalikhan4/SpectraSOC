import { useEffect, useState } from "react";
import API from "../../api/api";
import { Activity, AlertTriangle, ShieldAlert, Zap } from "lucide-react";

export default function LiveEventStream() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const res = await API.get("/api/v1/siem/logs?limit=8");
      setEvents(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load live SIEM events", err);
    }
  };

  useEffect(() => {
    loadEvents();

    const interval = setInterval(() => {
      loadEvents();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (severity) => {
    if (severity === "CRITICAL") return <ShieldAlert size={18} />;
    if (severity === "HIGH") return <AlertTriangle size={18} />;
    if (severity === "MEDIUM") return <Zap size={18} />;
    return <Activity size={18} />;
  };

  return (
    <div className="siem-card live-stream-card">
      <div className="siem-card-head">
        <h3>Live Event Stream</h3>
        <span className="live-indicator">LIVE</span>
      </div>

      <div className="event-stream">
        {events.length === 0 && (
          <div className="result">
            No live SIEM events found. Ingest logs first.
          </div>
        )}

        {events.map((event) => (
          <div className="event-row" key={event.id}>
            <div className={`event-icon ${event.severity}`}>
              {getIcon(event.severity)}
            </div>

            <div className="event-content">
              <div className="event-main">
                <strong>{event.event_type.replaceAll("_", " ")}</strong>
                <span className={`pill ${event.severity}`}>
                  {event.severity}
                </span>
              </div>

              <p>{event.message}</p>

              <div className="event-meta">
                <span>{event.source_ip || "Unknown IP"}</span>
                <span>Risk {event.risk_score}</span>
                <span>{event.mitre_technique}</span>
                <span>{new Date(event.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}