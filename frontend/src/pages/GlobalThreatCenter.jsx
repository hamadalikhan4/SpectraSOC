import WorldThreatMap from "../components/threat/WorldThreatMap";
import { Globe2, ShieldAlert, Activity, Brain } from "lucide-react";

export default function GlobalThreatCenter() {
  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Global Threat Center</h1>
          <div className="subtitle">
            Live attacker geolocation, threat intelligence, IOC activity, and AI threat context.
          </div>
        </div>

        <div className="badge">LIVE THREAT FEED</div>
      </div>

      <div className="grid cards">
        <ThreatCard icon={<Globe2 />} title="Active Countries" value="12" />
        <ThreatCard icon={<ShieldAlert />} title="High Risk IOCs" value="31" />
        <ThreatCard icon={<Activity />} title="Live Attacks" value="248" />
        <ThreatCard icon={<Brain />} title="AI Confidence" value="93%" />
      </div>

      <br />

      <div className="threat-center-grid">
        <div>
          <WorldThreatMap />

          <br />

          <div className="card">
            <h3>Global Threat Feed</h3>

            <table>
              <thead>
                <tr>
                  <th>Source IP</th>
                  <th>Country</th>
                  <th>Threat Type</th>
                  <th>Risk</th>
                  <th>MITRE</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>185.220.101.44</td>
                  <td>Russia / Tor</td>
                  <td>SSH Brute Force</td>
                  <td><span className="pill CRITICAL">Critical</span></td>
                  <td>T1110</td>
                </tr>
                <tr>
                  <td>103.147.12.33</td>
                  <td>China</td>
                  <td>Web Recon</td>
                  <td><span className="pill HIGH">High</span></td>
                  <td>T1595</td>
                </tr>
                <tr>
                  <td>45.77.23.11</td>
                  <td>Germany</td>
                  <td>SQL Injection</td>
                  <td><span className="pill HIGH">High</span></td>
                  <td>T1190</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="threat-side">
          <div className="card">
            <h3>Top Threat Countries</h3>
            <ThreatCountry country="Russia" value="48" risk="CRITICAL" />
            <ThreatCountry country="China" value="29" risk="HIGH" />
            <ThreatCountry country="USA" value="21" risk="HIGH" />
            <ThreatCountry country="Germany" value="17" risk="MEDIUM" />
          </div>

          <div className="card">
            <h3>SpectraSOC Threat Summary</h3>
            <div className="result">
              <p>
                Multiple high-risk events are associated with repeated authentication attempts,
                web probing, and suspicious command execution.
              </p>
              <p>
                The current activity may indicate automated botnet scanning or credential attack behavior.
              </p>
              <p>
                <b>Recommended:</b> Block malicious IPs, review SSH access, and correlate with SIEM logs.
              </p>
            </div>
          </div>

          <div className="card">
            <h3>Threat Intelligence Sources</h3>
            <div className="soc-health-list">
              <div className="soc-health-row"><span>VirusTotal</span><b>Connected</b></div>
              <div className="soc-health-row"><span>AbuseIPDB</span><b>Connected</b></div>
              <div className="soc-health-row"><span>GeoIP</span><b>Active</b></div>
              <div className="soc-health-row"><span>SIEM Correlation</span><b>Active</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreatCard({ icon, title, value }) {
  return (
    <div className="card">
      <div className="kpi-icon">{icon}</div>
      <div className="label">{title}</div>
      <div className="metric">{value}</div>
    </div>
  );
}

function ThreatCountry({ country, value, risk }) {
  return (
    <div className="intel-row">
      <div className="intel-icon">
        <Globe2 size={18} />
      </div>
      <div>
        <span>{country}</span>
        <strong>{value} attacks</strong>
      </div>
      <b>{risk}</b>
    </div>
  );
}