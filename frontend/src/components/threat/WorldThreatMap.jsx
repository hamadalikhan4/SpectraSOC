import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from "react-simple-maps";
import { X, ShieldAlert, Globe2, Brain, Activity } from "lucide-react";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const attacks = [
  {
    id: 1,
    attacker: "Russia / Tor",
    attackerCoord: [37.6173, 55.7558],
    target: "Pakistan",
    targetCoord: [73.0479, 33.6844],
    risk: "CRITICAL",
    ip: "185.220.101.44",
    type: "SSH Brute Force",
    mitre: "T1110",
    confidence: "96%",
  },
  {
    id: 2,
    attacker: "China",
    attackerCoord: [116.4074, 39.9042],
    target: "Germany",
    targetCoord: [13.405, 52.52],
    risk: "HIGH",
    ip: "103.147.12.33",
    type: "Web Recon",
    mitre: "T1595",
    confidence: "88%",
  },
  {
    id: 3,
    attacker: "USA",
    attackerCoord: [-74.006, 40.7128],
    target: "United Kingdom",
    targetCoord: [-0.1276, 51.5072],
    risk: "MEDIUM",
    ip: "44.211.18.90",
    type: "Suspicious Login",
    mitre: "T1078",
    confidence: "74%",
  },
];

export default function WorldThreatMap() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="siem-card threat-map-card">
      <div className="siem-card-head">
        <div>
          <h3>Global Threat Map</h3>
          <p className="subtitle">
            Live visualization of attacker locations and attack paths.
          </p>
        </div>

        <span className="live-indicator">LIVE</span>
      </div>

      <div className="world-map-wrap">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 155 }}
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#07111f"
                    stroke="#16466e"
                    strokeWidth={0.45}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#0e2a44", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {attacks.map((attack) => (
              <Line
                key={`line-${attack.id}`}
                from={attack.attackerCoord}
                to={attack.targetCoord}
                stroke={attack.risk === "CRITICAL" ? "#ff3b5f" : "#00e5ff"}
                strokeWidth={2}
                strokeLinecap="round"
                className="attack-line"
              />
            ))}

            {attacks.map((attack) => (
              <Marker
                key={`attacker-${attack.id}`}
                coordinates={attack.attackerCoord}
                onClick={() => setSelected(attack)}
              >
                <circle
                  r={7}
                  fill="#ff3b5f"
                  className="map-pulse-dot"
                />
                <circle
                  r={14}
                  fill="transparent"
                  stroke="#ff3b5f"
                  strokeWidth={1.5}
                  className="map-pulse-ring"
                />
              </Marker>
            ))}

            {attacks.map((attack) => (
              <Marker
                key={`target-${attack.id}`}
                coordinates={attack.targetCoord}
                onClick={() => setSelected(attack)}
              >
                <circle
                  r={7}
                  fill="#00ff99"
                  className="map-pulse-dot target"
                />
                <circle
                  r={14}
                  fill="transparent"
                  stroke="#00ff99"
                  strokeWidth={1.5}
                  className="map-pulse-ring"
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {selected && (
        <div className="threat-drawer">
          <div className="threat-drawer-head">
            <div>
              <h3>Threat Intelligence Detail</h3>
              <p>{selected.ip}</p>
            </div>

            <button onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
          </div>

          <div className="threat-detail-grid">
            <Detail icon={<Globe2 />} label="Origin" value={selected.attacker} />
            <Detail icon={<ShieldAlert />} label="Risk" value={selected.risk} />
            <Detail icon={<Activity />} label="Attack Type" value={selected.type} />
            <Detail icon={<Brain />} label="AI Confidence" value={selected.confidence} />
          </div>

          <div className="result">
            <p>
              <b>Target:</b> {selected.target}
            </p>
            <p>
              <b>MITRE Technique:</b> {selected.mitre}
            </p>
            <p>
              <b>Assessment:</b> SpectraSOC identified this activity as a
              high-priority threat path. Correlate this IP with SIEM logs,
              incidents, and threat intelligence sources.
            </p>
            <p>
              <b>Recommended Response:</b> Block the source IP, review related
              authentication logs, and create an incident if activity repeats.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="threat-detail-card">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}