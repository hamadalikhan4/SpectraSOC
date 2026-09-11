import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

export default function EntityRelationshipGraph({ selectedCase }) {
  const { nodes, edges } = useMemo(() => {
    if (!selectedCase) {
      return { nodes: [], edges: [] };
    }

    const attackChain = selectedCase.attack_chain || [];

    const graphNodes = [
      {
        id: "internet",
        position: { x: 400, y: 0 },
        data: { label: "🌍 Internet" },
        style: nodeStyle("#0ea5e9"),
      },

      {
        id: "attacker",
        position: { x: 400, y: 120 },
        data: {
          label: selectedCase.source_ip || "Unknown IP",
        },
        style: nodeStyle("#ef4444"),
      },

      {
        id: "target",
        position: { x: 400, y: 260 },
        data: {
          label: "Ubuntu Server",
        },
        style: nodeStyle("#22c55e"),
      },
    ];

    const graphEdges = [
      edge("internet", "attacker"),
      edge("attacker", "target"),
    ];

    attackChain.forEach((event, index) => {
      const nodeId = `event-${index}`;

      graphNodes.push({
        id: nodeId,
        position: {
          x: 400,
          y: 420 + index * 130,
        },
        data: {
          label: `${event.event_type}\n${event.mitre_technique}`,
        },
        style:
          event.risk_score >= 80
            ? nodeStyle("#ef4444")
            : nodeStyle("#0ea5e9"),
      });

      if (index === 0) {
        graphEdges.push(edge("target", nodeId));
      } else {
        graphEdges.push(edge(`event-${index - 1}`, nodeId));
      }
    });

    return {
      nodes: graphNodes,
      edges: graphEdges,
    };
  }, [selectedCase]);

  return (
    <div className="siem-card">
      <div className="siem-card-head">
        <div>
          <h3>Entity Relationship Graph</h3>

          <p className="subtitle">
            Interactive visualization of attacker,
            assets and correlated events.
          </p>
        </div>
      </div>

      <div style={{ height: 650 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

function nodeStyle(color) {
  return {
    background: "#07111f",
    color: "#ffffff",
    border: `2px solid ${color}`,
    borderRadius: "14px",
    width: 190,
    padding: 10,
    fontWeight: 600,
    textAlign: "center",
    boxShadow: `0 0 20px ${color}33`,
  };
}

function edge(source, target) {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
  };
}