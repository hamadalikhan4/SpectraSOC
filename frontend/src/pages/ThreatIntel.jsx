import { useEffect, useState } from "react";
import API from "../api/api";

import {
  Search,
  Database,
  ShieldAlert,
  Globe2,
  Brain,
  Activity,
  Trash2,
  RefreshCcw,
  CheckCircle2,
  Radar,
  ShieldCheck,
  AlertTriangle,
  Server,
  MapPin,
  Bug,
} from "lucide-react";

export default function ThreatIntel() {
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [iocs, setIocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadIOCs = async () => {
    try {
      const res = await API.get("/api/v1/threat/iocs");
      setIocs(res.data || []);
    } catch (err) {
      console.error("Failed to load IOCs", err);
    }
  };

  useEffect(() => {
    loadIOCs();
  }, []);

  const analyzeIOC = async () => {
    const value = query.trim();
    if (!value) return alert("Enter an IOC first.");

    setLoading(true);

    try {
      const res = await API.post("/api/v1/threat/analyze", null, {
        params: {
          indicator: value,
          indicator_type: "ip",
          auto_incident: true,
          threshold: 35,
        },
      });

      setResult(normalizeResult(res.data, value));
      setTab("search");
      loadIOCs();
    } catch (err) {
      console.error(err);
      alert("IOC analysis failed. Check backend terminal logs.");
    } finally {
      setLoading(false);
    }
  };

  const deleteIOC = async (id) => {
    try {
      await API.delete(`/api/v1/threat/iocs/${id}`);
      loadIOCs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete IOC.");
    }
  };

  const highRisk = iocs.filter(
    (i) => i.severity === "HIGH" || i.severity === "CRITICAL"
  ).length;

  const watchlisted = iocs.filter((i) => i.is_watchlisted).length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Threat Intelligence</h1>
          <div className="subtitle">
            IOC enrichment, VirusTotal, AbuseIPDB, GeoIP, scoring, and incident intelligence.
          </div>
        </div>

        <div className="badge">INTEL ENGINE ACTIVE</div>
      </div>

      <div className="siem-tabs">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}>
          IOC Analysis
        </button>
        <button className={tab === "database" ? "active" : ""} onClick={() => setTab("database")}>
          IOC Database
        </button>
        <button className={tab === "sources" ? "active" : ""} onClick={() => setTab("sources")}>
          Sources
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid cards">
            <IntelCard icon={<Database />} title="Stored IOCs" value={iocs.length} />
            <IntelCard icon={<ShieldAlert />} title="High Risk IOCs" value={highRisk} />
            <IntelCard icon={<Globe2 />} title="Enriched IOCs" value={iocs.filter((i) => i.country || i.provider).length} />
            <IntelCard icon={<Brain />} title="Watchlisted" value={watchlisted} />
          </div>

          <br />

          <div className="overview-grid">
            <div className="overview-left">
              <div className="card">
                <h3>Quick IOC Analysis</h3>
                <div className="threat-search-box">
                  <Search size={18} />
                  <input
                    placeholder="Search IP, domain, URL, hash, or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && analyzeIOC()}
                  />
                  <button className="btn" onClick={analyzeIOC}>
                    {loading ? "Analyzing..." : "Analyze"}
                  </button>
                </div>
              </div>

              <div className="card">
                <h3>Recent IOC Activity</h3>
                <table>
                  <thead>
                    <tr>
                      <th>IOC</th>
                      <th>Type</th>
                      <th>Country</th>
                      <th>Risk</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iocs.slice(0, 6).map((ioc) => (
                      <tr key={ioc.id}>
                        <td>{ioc.ioc_value}</td>
                        <td>{ioc.ioc_type}</td>
                        <td>{ioc.country || "N/A"}</td>
                        <td>{ioc.risk_score}</td>
                        <td>
                          <span className={`pill ${ioc.severity}`}>
                            {ioc.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overview-right">
              <div className="card">
                <h3>SpectraSOC Intel Summary</h3>
                <div className="result">
                  <p>
                    Threat Intelligence now analyzes IOCs through the live enrichment engine.
                  </p>
                  <p>
                    Providers include GeoIP, VirusTotal, AbuseIPDB, and the internal scoring engine.
                  </p>
                </div>
              </div>

              <div className="card">
                <h3>Provider Health</h3>
                <Provider name="GeoIP" status="Operational" />
                <Provider name="VirusTotal" status="Operational" />
                <Provider name="AbuseIPDB" status="Operational" />
                <Provider name="Threat Score Engine" status="Operational" />
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "search" && (
        <div className="grid two">
          <div className="card">
            <h3>IOC Analysis Engine</h3>

            <div className="threat-search-box">
              <Search size={18} />
              <input
                placeholder="Example: 8.8.8.8, google.com, SHA256 hash..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeIOC()}
              />
              <button className="btn" onClick={analyzeIOC}>
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            <br />

            {!result && (
              <div className="result">
                Search an IOC to view VirusTotal, AbuseIPDB, GeoIP, risk score, reasons, and incident status.
              </div>
            )}

            {result && <ThreatAnalysisResult result={result} />}
          </div>

          <div className="card">
            <h3>Analysis Workflow</h3>
            <div className="attack-timeline">
              <Step title="IOC Parser" text="Detect IP, domain, URL, MD5, SHA1, or SHA256." />
              <Step title="Plugin Loader" text="Run GeoIP, VirusTotal, and AbuseIPDB enrichers." />
              <Step title="Threat Score Engine" text="Calculate provider scores and final severity." />
              <Step title="Incident Pipeline" text="Show whether an incident was created automatically." />
              <Step title="SOC Workflow" text="Send high-risk findings to SIEM, incidents, SOAR, and reports." />
            </div>
          </div>
        </div>
      )}

      {tab === "database" && (
        <div className="card">
          <div className="siem-card-head">
            <div>
              <h3>IOC Database</h3>
              <p className="subtitle">Stored indicators enriched by SpectraSOC.</p>
            </div>

            <button className="btn secondary" onClick={loadIOCs}>
              <RefreshCcw size={15} /> Refresh
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>IOC</th>
                <th>Type</th>
                <th>Country</th>
                <th>Provider</th>
                <th>Risk</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {iocs.map((ioc) => (
                <tr key={ioc.id}>
                  <td>{ioc.ioc_value}</td>
                  <td>{ioc.ioc_type}</td>
                  <td>{ioc.country || "N/A"}</td>
                  <td>{ioc.provider || "N/A"}</td>
                  <td>{ioc.risk_score}</td>
                  <td>
                    <span className={`pill ${ioc.severity}`}>
                      {ioc.severity}
                    </span>
                  </td>
                  <td>{ioc.source}</td>
                  <td>
                    <button className="icon-btn danger" onClick={() => deleteIOC(ioc.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {iocs.length === 0 && <div className="result">No IOCs stored yet.</div>}
        </div>
      )}

      {tab === "sources" && (
        <div className="grid two">
          <SourceCard name="GeoIP" status="Operational" description="Provides country, ASN, ISP, and geolocation context." />
          <SourceCard name="VirusTotal" status="Operational" description="Provides live reputation, detections, tags, ASN, and network intelligence." />
          <SourceCard name="AbuseIPDB" status="Operational" description="Provides abuse confidence score and reporting history." />
          <SourceCard name="Threat Score Engine" status="Operational" description="Combines provider scores into unified severity and analyst reasons." />
        </div>
      )}
    </div>
  );
}

function ThreatAnalysisResult({ result }) {
  const score = Number(result.risk_score || 0);

  return (
    <div className="ioc-result pro-intel">
      <div className="intel-hero">
        <CircularRiskGauge score={score} severity={result.severity} />

        <div className="intel-hero-meta">
          <div className="analysis-header">
            <div>
              <h3>{result.indicator}</h3>
              <p className="subtitle">{result.ioc_type || "Unknown IOC Type"}</p>
            </div>

            <span className={`pill ${result.severity}`}>
              {result.severity}
            </span>
          </div>

          <div className="intel-kpi-grid">
            <MiniKPI icon={<ShieldCheck size={18} />} label="Severity" value={result.severity} />
            <MiniKPI icon={<Radar size={18} />} label="Providers" value={(result.providers_used || []).length} />
            <MiniKPI icon={<AlertTriangle size={18} />} label="Incident" value={result.incident_created ? "Created" : "Not Created"} />
            <MiniKPI icon={<Server size={18} />} label="IOC Type" value={result.ioc_type} />
          </div>
        </div>
      </div>

      <br />

      <div className="grid two">
        <ProviderBreakdown providerScores={result.provider_scores || {}} />
        <ReasonPanel reasons={result.reasons || []} />
      </div>

      <br />

      <div className="grid three intel-provider-grid">
        <VirusTotalPanel data={result.virustotal} />
        <AbuseIPDBPanel data={result.abuseipdb} />
        <GeoIPPanel data={result.geoip} />
      </div>

      <br />

      <AnalystSummary result={result} />
    </div>
  );
}

function CircularRiskGauge({ score, severity }) {
  const normalized = Math.min(Math.max(Number(score) || 0, 0), 100);
  const angle = normalized * 3.6;

  return (
    <div className="risk-circle-card">
      <div
        className="risk-circle"
        style={{
          background: `conic-gradient(var(--accent) ${angle}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <div className="risk-circle-inner">
          <strong>{normalized}</strong>
          <span>/100</span>
        </div>
      </div>

      <div className="risk-circle-label">
        <b>{severity}</b>
        <span>Threat Risk</span>
      </div>
    </div>
  );
}

function MiniKPI({ icon, label, value }) {
  return (
    <div className="intel-mini-kpi">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value || "N/A"}</strong>
    </div>
  );
}

function ProviderBreakdown({ providerScores }) {
  const entries = Object.entries(providerScores);

  return (
    <div className="result intel-panel">
      <h4>Provider Score Breakdown</h4>

      {entries.length === 0 && <p>No provider scores returned.</p>}

      <div className="score-card-grid">
        {entries.map(([name, value]) => (
          <div className="score-chip-card" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
            <div className="provider-score-bar">
              <div style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReasonPanel({ reasons }) {
  return (
    <div className="result intel-panel">
      <h4>Scoring Reasons</h4>

      {reasons.length === 0 && <p>No scoring reasons returned.</p>}

      {reasons.map((reason, index) => (
        <div className="reason-row pro" key={index}>
          <CheckCircle2 size={16} />
          <span>{reason}</span>
        </div>
      ))}
    </div>
  );
}

function VirusTotalPanel({ data }) {
  return (
    <div className="result intel-provider-card">
      <div className="provider-card-head">
        <Bug size={18} />
        <h4>VirusTotal</h4>
      </div>

      {!data && <p>No data returned.</p>}

      {data && (
        <>
          <div className="metric-tile-grid">
            <MetricTile label="Malicious" value={data.malicious ?? 0} />
            <MetricTile label="Suspicious" value={data.suspicious ?? 0} />
            <MetricTile label="Harmless" value={data.harmless ?? 0} />
            <MetricTile label="Undetected" value={data.undetected ?? 0} />
          </div>

          <InfoLine label="Reputation" value={data.reputation} />
          <InfoLine label="ASN" value={data.asn} />
          <InfoLine label="Owner" value={data.as_owner} />
          <InfoLine label="Network" value={data.network} />
          <InfoLine label="Tags" value={Array.isArray(data.tags) ? data.tags.join(", ") || "None" : data.tags} />
        </>
      )}
    </div>
  );
}

function AbuseIPDBPanel({ data }) {
  return (
    <div className="result intel-provider-card">
      <div className="provider-card-head">
        <ShieldAlert size={18} />
        <h4>AbuseIPDB</h4>
      </div>

      {!data && <p>No data returned.</p>}

      {data && (
        <>
          <div className="metric-tile-grid">
            <MetricTile label="Abuse Score" value={data.abuse_score ?? 0} />
            <MetricTile label="Reports" value={data.total_reports ?? 0} />
            <MetricTile label="TOR" value={data.tor ? "Yes" : "No"} />
            <MetricTile label="Country" value={data.country || "N/A"} />
          </div>

          <InfoLine label="ISP" value={data.isp} />
          <InfoLine label="Domain" value={data.domain} />
          <InfoLine label="Usage Type" value={data.usage_type} />
        </>
      )}
    </div>
  );
}

function GeoIPPanel({ data }) {
  return (
    <div className="result intel-provider-card">
      <div className="provider-card-head">
        <MapPin size={18} />
        <h4>GeoIP</h4>
      </div>

      {!data && <p>No data returned.</p>}

      {data && (
        <>
          <div className="metric-tile-grid">
            <MetricTile label="Country" value={data.country || "Unknown"} />
            <MetricTile label="City" value={data.city || "Unknown"} />
            <MetricTile label="Latitude" value={data.latitude ?? "N/A"} />
            <MetricTile label="Longitude" value={data.longitude ?? "N/A"} />
          </div>

          <InfoLine label="Note" value={data.note} />
        </>
      )}
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <p className="intel-info-line">
      <b>{label}:</b> {value === undefined || value === null || value === "" ? "N/A" : String(value)}
    </p>
  );
}

function AnalystSummary({ result }) {
  const reasons = result.reasons || [];
  const score = Number(result.risk_score || 0);

  return (
    <div className="result analyst-report">
      <div className="provider-card-head">
        <Brain size={18} />
        <h4>AI Threat Context</h4>
      </div>

      <p>
        SpectraSOC analyzed <b>{result.indicator}</b> using{" "}
        <b>{(result.providers_used || []).length}</b> intelligence providers and assigned a final severity of{" "}
        <b>{result.severity}</b> with a risk score of <b>{score}/100</b>.
      </p>

      <div className="analyst-list">
        {reasons.slice(0, 4).map((reason, index) => (
          <div key={index}>
            <CheckCircle2 size={15} />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      <p>
        <b>Recommended Actions:</b>{" "}
        {result.incident_created
          ? "An incident was created. Review the incident timeline, validate evidence, and begin response workflow."
          : "Continue monitoring, correlate this IOC with SIEM logs, review related incidents, and create a response workflow if activity is confirmed."}
      </p>
    </div>
  );
}

function normalizeResult(data, fallbackIOC) {
  const root = data.analysis || data;

  const enrichment =
    root.enrichment ||
    root.data?.raw_enrichment ||
    root.cache_payload?.data?.raw_enrichment ||
    {};

  const enrichmentList = enrichment.enrichments || [];

  const getProviderData = (providerName) => {
    const item = enrichmentList.find(
      (e) => e.provider?.toLowerCase() === providerName.toLowerCase()
    );

    return item?.data || null;
  };

  return {
    indicator: root.indicator || data.indicator || fallbackIOC,
    ioc_type: root.indicator_type || root.type || data.indicator_type || "unknown",
    risk_score: root.risk_score ?? data.risk_score ?? 0,
    severity: root.risk_level || root.severity || data.risk_level || "LOW",
    provider_scores:
      root.provider_scores ||
      root.cache_payload?.data?.provider_scores ||
      root.data?.provider_scores ||
      {},
    providers_used:
      root.providers ||
      root.cache_payload?.data?.providers ||
      root.data?.providers ||
      [],
    reasons:
      root.reasons ||
      root.cache_payload?.data?.reasons ||
      root.data?.reasons ||
      [],
    incident_created:
      data.incident_created ??
      root.should_create_incident ??
      false,
    incident_id: data.incident_id || root.incident_id || null,
    virustotal: getProviderData("VirusTotal"),
    abuseipdb: getProviderData("AbuseIPDB"),
    geoip: getProviderData("GeoIP"),
  };
}

function IntelCard({ icon, title, value }) {
  return (
    <div className="card">
      <div className="kpi-icon">{icon}</div>
      <div className="label">{title}</div>
      <div className="metric">{value}</div>
    </div>
  );
}

function Provider({ name, status }) {
  return (
    <div className="soc-health-row">
      <span>{name}</span>
      <b>{status}</b>
    </div>
  );
}

function SourceCard({ name, status, description }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <span className={status === "Operational" ? "pill LOW" : "pill MEDIUM"}>
        {status}
      </span>
      <p className="subtitle">{description}</p>
    </div>
  );
}

function Step({ title, text }) {
  return (
    <div className="timeline-entry">
      <div className="timeline-node">
        <Activity size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}