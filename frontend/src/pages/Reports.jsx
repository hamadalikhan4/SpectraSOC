import { useState } from "react";

export default function Reports() {
  const [incidentId, setIncidentId] = useState("");

  const generateReport = () => {
    if (!incidentId.trim()) {
      alert("Please enter an Incident ID");
      return;
    }

    window.open(
      `http://127.0.0.1:8000/reports/incident/${incidentId}`,
      "_blank"
    );
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Reports</h1>
          <div className="subtitle">
            Generate executive and technical PDF incident reports.
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Generate Incident Report</h3>

          <label>Incident ID</label>
          <input
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            placeholder="Example: INC-20260622000602"
          />

          <div className="actions">
            <button className="btn" onClick={generateReport}>
              Generate PDF Report
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Report Includes</h3>
          <div className="result">
            <p>Executive Summary</p>
            <p>Incident Severity and Status</p>
            <p>IOC and Threat Intelligence Evidence</p>
            <p>AI Investigation Summary</p>
            <p>Containment and Recovery Steps</p>
            <p>Incident Timeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}