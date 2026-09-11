import { Handle, Position } from "@xyflow/react";
import { GitBranch, PlayCircle, ShieldAlert, Zap } from "lucide-react";

function iconForType(type) {
  if (type === "Trigger") return PlayCircle;
  if (type === "Decision") return GitBranch;
  if (type === "Action") return Zap;
  return ShieldAlert;
}

export default function CustomSOARNode({ data, selected }) {
  const Icon = iconForType(data.step_type);

  return (
    <div className={`soar-flow-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />

      <div className="flow-node-top">
        <div className={`flow-node-icon ${data.step_type?.toLowerCase()}`}>
          <Icon size={16} />
        </div>

        <div>
          <span>{data.step_type}</span>
          <h4>{data.name}</h4>
        </div>
      </div>

      <p>{data.description || "No description provided."}</p>

      <div className="flow-node-meta">
        <span>{data.connector_name || "No connector"}</span>
        <span>{data.timeout_seconds || 60}s</span>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}