import { Globe2, ShieldAlert, Server, Hash } from "lucide-react";

export default function ThreatIntelWidget({ logs = [] }) {
  const topIp = logs[0]?.source_ip || "185.220.101.44";

  return (
    <div className="siem-card overview-widget">
      <div className="siem-card-head">
        <div>
          <h3>Threat Intelligence</h3>
          <p className="subtitle">IOC enrichment and attacker context.</p>
        </div>
        <span className="live-indicator">CONNECTED</span>
      </div>

      <div className="threat-intel-list">
        <IntelRow icon={<ShieldAlert size={18} />} label="High-Risk IOC" value={topIp} tag="Risk 95" />
        <IntelRow icon={<Globe2 size={18} />} label="Top Origin" value="Russia / Tor Exit" tag="Critical" />
        <IntelRow icon={<Server size={18} />} label="ASN / Provider" value="AS-Anonymous Hosting" tag="Suspicious" />
        <IntelRow icon={<Hash size={18} />} label="Latest Hash" value="44d88612fea8..." tag="Malware" />
      </div>
    </div>
  );
}

function IntelRow({ icon, label, value, tag }) {
  return (
    <div className="intel-row">
      <div className="intel-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <b>{tag}</b>
    </div>
  );
}