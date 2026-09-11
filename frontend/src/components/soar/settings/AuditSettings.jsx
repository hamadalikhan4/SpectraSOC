import { FileClock, ScrollText } from "lucide-react";

import { auditEvents } from "./settingsData";

export default function AuditSettings() {
  return (
    <div className="spectra-glass-card audit-settings">
      <div className="panel-title">
        <ScrollText size={18} />
        Audit & Compliance
      </div>

      <p className="settings-subtitle">
        Track SOAR configuration changes, action execution, connector use, and worker events.
      </p>

      <div className="audit-list">
        {auditEvents.map((item) => (
          <div className="audit-item" key={`${item.time}-${item.event}`}>
            <div className="audit-icon">
              <FileClock size={15} />
            </div>

            <div>
              <div className="audit-top">
                <h4>{item.event}</h4>
                <span>{item.time}</span>
              </div>

              <p>{item.actor}</p>

              <b className={`audit-severity ${item.severity.toLowerCase()}`}>
                {item.severity}
              </b>
            </div>
          </div>
        ))}
      </div>

      <button className="secondary-btn full-width-btn">
        Export Audit Logs
      </button>
    </div>
  );
}