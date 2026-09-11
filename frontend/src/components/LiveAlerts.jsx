import { useEffect, useState } from "react";
import API from "../api/api";

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  const loadAlerts = async () => {
    try {
      const res = await API.get("/alerts/");
      setAlerts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(() => {
      loadAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h3>Live Security Alerts</h3>

      {alerts.length === 0 && (
        <div className="result">
          No active alerts detected.
        </div>
      )}

      {alerts.map((alert) => (
        <div key={alert.id} className="alert-row">
          <div>
            <strong>{alert.title}</strong>
            <p>{alert.source}</p>
          </div>

          <span className={`pill ${alert.severity}`}>
            {alert.severity}
          </span>
        </div>
      ))}
    </div>
  );
}