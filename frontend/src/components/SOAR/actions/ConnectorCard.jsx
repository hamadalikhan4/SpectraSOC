import {
  Activity,
  Bot,
  Cpu,
  Mail,
  Network,
  PlugZap,
  Radio,
  Shield,
  TerminalSquare,
} from "lucide-react";

function getIcon(category, name) {
  if (name.includes("VirusTotal")) return Shield;
  if (name.includes("AbuseIPDB")) return Radio;
  if (name.includes("Python")) return TerminalSquare;
  if (category.includes("Endpoint")) return Cpu;
  if (category.includes("Email")) return Mail;
  if (category.includes("SIEM")) return Activity;
  if (category.includes("Collaboration")) return Bot;
  if (category.includes("Custom")) return Network;
  return PlugZap;
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function ConnectorCard({ connector, onOpen }) {
  const Icon = getIcon(connector.category, connector.name);

  return (
    <div className="spectra-glass-card connector-card">
      <div className="connector-card-top">
        <div className="connector-icon">
          <Icon size={24} />
        </div>

        <span className={`connector-status ${statusClass(connector.status)}`}>
          {connector.status}
        </span>
      </div>

      <div className="connector-body">
        <span className="category">{connector.category}</span>
        <h3>{connector.name}</h3>
        <p>{connector.description}</p>
      </div>

      <div className="connector-stats">
        <div>
          <span>Actions</span>
          <b>{connector.actions}</b>
        </div>

        <div>
          <span>Executions</span>
          <b>{connector.executions}</b>
        </div>

        <div>
          <span>Health</span>
          <b>{connector.health}</b>
        </div>
      </div>

      <div className="connector-footer">
        <span>Last used: {connector.lastUsed}</span>

        <button onClick={onOpen}>
          View Details
        </button>
      </div>
    </div>
  );
}