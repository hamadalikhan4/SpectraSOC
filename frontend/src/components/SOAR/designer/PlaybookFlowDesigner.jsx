import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Copy,
  GitBranch,
  LayoutGrid,
  Maximize2,
  Plus,
  Save,
  Trash2,
  Zap,
} from "lucide-react";

import CustomSOARNode from "./CustomSOARNode";
import NodeConfigPanel from "./NodeConfigPanel";
import { flowToSteps, normalizeNodeOrder, stepsToFlow } from "./nodeMapper";

const nodeTypes = {
  soarNode: CustomSOARNode,
};

function createNode(type, index, lastNode) {
  const id = `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const name =
    type === "Trigger"
      ? `New Trigger ${index}`
      : type === "Decision"
      ? `New Decision ${index}`
      : `New Action ${index}`;

  const actionKey =
    type === "Trigger"
      ? "custom.trigger"
      : type === "Decision"
      ? "custom.decision"
      : "custom.action";

  const connector =
    type === "Trigger"
      ? "SIEM"
      : type === "Decision"
      ? "Risk Engine"
      : "Custom Connector";

  return {
    id,
    type: "soarNode",
    position: {
      x: lastNode ? lastNode.position.x + 360 : 80,
      y: lastNode ? lastNode.position.y : 80,
    },
    data: {
      step_order: index,
      step_type: type,
      name,
      description: `Configure this ${type.toLowerCase()} node.`,
      action_key: actionKey,
      connector_name: connector,
      config: {},
      condition: type === "Decision" ? { risk_score: ">70" } : {},
      timeout_seconds: 60,
      retry_count: type === "Trigger" ? 0 : 1,
    },
  };
}

function validateWorkflow(nodes = [], edges = []) {
  const findings = [];

  const triggerNodes = nodes.filter(
    (node) => node.data.step_type === "Trigger"
  );

  const actionNodes = nodes.filter(
    (node) => node.data.step_type === "Action"
  );

  const decisionNodes = nodes.filter(
    (node) => node.data.step_type === "Decision"
  );

  if (triggerNodes.length === 0) {
    findings.push({
      level: "critical",
      message: "Workflow must include at least one Trigger node.",
    });
  }

  if (actionNodes.length === 0) {
    findings.push({
      level: "critical",
      message: "Workflow must include at least one Action node.",
    });
  }

  nodes.forEach((node) => {
    if (!node.data.name?.trim()) {
      findings.push({
        level: "critical",
        message: `Node ${node.id} is missing a name.`,
      });
    }

    if (!node.data.action_key?.trim()) {
      findings.push({
        level: "warning",
        message: `${node.data.name || node.id} is missing an action key.`,
      });
    }

    if (!node.data.connector_name?.trim()) {
      findings.push({
        level: "warning",
        message: `${node.data.name || node.id} is missing a connector.`,
      });
    }
  });

  decisionNodes.forEach((node) => {
    const condition = node.data.condition || {};

    if (Object.keys(condition).length === 0) {
      findings.push({
        level: "warning",
        message: `${node.data.name} decision node has no condition JSON.`,
      });
    }
  });

  if (nodes.length > 1 && edges.length === 0) {
    findings.push({
      level: "warning",
      message: "Workflow has multiple nodes but no sequence edges.",
    });
  }

  const connectedNodeIds = new Set();

  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  nodes.forEach((node) => {
    if (nodes.length > 1 && !connectedNodeIds.has(node.id)) {
      findings.push({
        level: "warning",
        message: `${node.data.name || node.id} is disconnected from the workflow.`,
      });
    }
  });

  const criticalCount = findings.filter(
    (item) => item.level === "critical"
  ).length;

  const warningCount = findings.filter(
    (item) => item.level === "warning"
  ).length;

  const score = Math.max(0, 100 - criticalCount * 35 - warningCount * 10);

  return {
    score,
    criticalCount,
    warningCount,
    passed: criticalCount === 0,
    findings,
  };
}

function PlaybookFlowDesignerInner({ playbook, steps = [], onSave }) {
  const { fitView } = useReactFlow();

  const initialFlow = useMemo(() => {
    return stepsToFlow(steps, playbook);
  }, [playbook?.id]);

  const [nodes, setNodes] = useState(initialFlow.nodes);
  const [edges, setEdges] = useState(initialFlow.edges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false);

  const [validation, setValidation] = useState({
    score: 100,
    criticalCount: 0,
    warningCount: 0,
    passed: true,
    findings: [],
  });

  const nodesRef = useRef(initialFlow.nodes);
  const edgesRef = useRef(initialFlow.edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    setNodes(initialFlow.nodes);
    setEdges(initialFlow.edges);
    setSelectedNode(null);

    setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 250);
  }, [playbook?.id]);

  useEffect(() => {
    setValidation(validateWorkflow(nodes, edges));
  }, [nodes, edges]);

  const refitCanvas = () => {
    setTimeout(() => {
      fitView({ padding: 0.25, duration: 450 });
    }, 200);
  };

  const onNodesChange = useCallback((changes) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((currentEdges) =>
      addEdge(
        {
          ...params,
          animated: true,
          type: "smoothstep",
        },
        currentEdges
      )
    );
  }, []);

  const addNodeByType = (type = "Action") => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const nextIndex = currentNodes.length + 1;
    const lastNode = currentNodes[currentNodes.length - 1];

    const newNode = createNode(type, nextIndex, lastNode);

    const nextNodes = normalizeNodeOrder([...currentNodes, newNode]);

    const nextEdges = lastNode
      ? [
          ...currentEdges,
          {
            id: `edge-${lastNode.id}-${newNode.id}`,
            source: lastNode.id,
            target: newNode.id,
            animated: true,
            type: "smoothstep",
          },
        ]
      : currentEdges;

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNode(newNode);
    refitCanvas();
  };

  const duplicateSelectedNode = () => {
    if (!selectedNode) {
      alert("Select a node first.");
      return;
    }

    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const lastNode = currentNodes[currentNodes.length - 1];

    const duplicateNode = {
      ...selectedNode,
      id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      position: {
        x: selectedNode.position.x + 360,
        y: selectedNode.position.y + 70,
      },
      data: {
        ...selectedNode.data,
        step_order: currentNodes.length + 1,
        name: `${selectedNode.data.name} Copy`,
      },
    };

    const nextNodes = normalizeNodeOrder([...currentNodes, duplicateNode]);

    const nextEdges = lastNode
      ? [
          ...currentEdges,
          {
            id: `edge-${lastNode.id}-${duplicateNode.id}`,
            source: lastNode.id,
            target: duplicateNode.id,
            animated: true,
            type: "smoothstep",
          },
        ]
      : currentEdges;

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNode(duplicateNode);
    refitCanvas();
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) {
      alert("Select a node first.");
      return;
    }

    const nextNodes = normalizeNodeOrder(
      nodesRef.current.filter((node) => node.id !== selectedNode.id)
    );

    const nextEdges = edgesRef.current.filter(
      (edge) =>
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
    );

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNode(null);
    refitCanvas();
  };

  const autoLayout = () => {
    const orderedNodes = normalizeNodeOrder(nodesRef.current);

    const nextNodes = orderedNodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * 360,
        y: Math.floor(index / 3) * 230 + 80,
      },
      data: {
        ...node.data,
        step_order: index + 1,
      },
    }));

    setNodes(nextNodes);
    refitCanvas();
  };

  const rebuildSequenceEdges = () => {
    const orderedNodes = normalizeNodeOrder(nodesRef.current);

    const nextEdges = orderedNodes.slice(0, -1).map((node, index) => ({
      id: `edge-seq-${index + 1}`,
      source: node.id,
      target: orderedNodes[index + 1].id,
      animated: true,
      type: "smoothstep",
    }));

    setNodes(orderedNodes);
    setEdges(nextEdges);
    refitCanvas();
  };

  const saveFlow = async () => {
    try {
      const currentValidation = validateWorkflow(
        nodesRef.current,
        edgesRef.current
      );

      setValidation(currentValidation);

      if (!currentValidation.passed) {
        alert("Workflow has critical validation issues. Fix them before saving.");
        return;
      }

      setSaving(true);

      const orderedNodes = normalizeNodeOrder(nodesRef.current);
      const nextSteps = flowToSteps(orderedNodes);

      setNodes(orderedNodes);

      if (onSave) {
        await onSave(nextSteps);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save React Flow workflow.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="playbook-flow-designer">
      <div className="flow-designer-header spectra-glass-card">
        <div>
          <span className="hero-chip">React Flow Designer</span>

          <h2>Enterprise Playbook Flow Designer</h2>

          <p>
            Build, inspect, edit, validate, and save SOAR workflow logic using a
            visual automation canvas.
          </p>

          <div className="queue-meta" style={{ marginTop: "12px" }}>
            <span>Nodes: {nodes.length}</span>
            <span>Edges: {edges.length}</span>
            <span>Selected: {selectedNode?.data?.name || "None"}</span>
          </div>
        </div>

        <div className="hero-actions designer-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => addNodeByType("Trigger")}
          >
            <Plus size={15} />
            Trigger
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => addNodeByType("Action")}
          >
            <Zap size={15} />
            Action
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => addNodeByType("Decision")}
          >
            <GitBranch size={15} />
            Decision
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={duplicateSelectedNode}
          >
            <Copy size={15} />
            Duplicate
          </button>

          <button
            type="button"
            className="secondary-btn danger-soft"
            onClick={deleteSelectedNode}
          >
            <Trash2 size={15} />
            Delete
          </button>

          <button type="button" className="secondary-btn" onClick={autoLayout}>
            <LayoutGrid size={15} />
            Auto Layout
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={rebuildSequenceEdges}
          >
            <GitBranch size={15} />
            Rebuild Edges
          </button>

          <button type="button" className="secondary-btn" onClick={refitCanvas}>
            <Maximize2 size={15} />
            Fit View
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={saveFlow}
            disabled={saving}
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save Workflow"}
          </button>
        </div>
      </div>

      <div className="spectra-glass-card workflow-validation-card">
        <div>
          <span className="hero-chip">Workflow Validation</span>

          <h3>Enterprise Readiness Score: {validation.score}%</h3>

          <p>
            {validation.passed
              ? "Workflow passed critical validation and is ready to save."
              : "Workflow has critical validation issues that must be fixed before saving."}
          </p>
        </div>

        <div className="validation-mini-grid">
          <span>Critical: {validation.criticalCount}</span>
          <span>Warnings: {validation.warningCount}</span>
          <span>{validation.passed ? "Passed" : "Blocked"}</span>
        </div>

        {validation.findings.length > 0 && (
          <div className="workflow-validation-list">
            {validation.findings.slice(0, 5).map((item, index) => (
              <div
                key={`${item.message}-${index}`}
                className={`workflow-validation-item ${item.level}`}
              >
                {item.level.toUpperCase()} — {item.message}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flow-designer-layout">
        <div className="spectra-glass-card flow-canvas-card">
          <div className="flow-canvas-inner">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNode(node)}
              onPaneClick={() => setSelectedNode(null)}
              fitView
              minZoom={0.25}
              maxZoom={1.5}
            >
              <MiniMap />
              <Controls />
              <Background gap={22} size={1} />
            </ReactFlow>
          </div>
        </div>

        <NodeConfigPanel
          node={selectedNode}
          onUpdate={(nodeId, nextData) => {
            setNodes((currentNodes) =>
              currentNodes.map((node) =>
                node.id === nodeId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        ...nextData,
                        label: nextData.name || node.data.label,
                      },
                    }
                  : node
              )
            );

            setSelectedNode((current) =>
              current && current.id === nodeId
                ? {
                    ...current,
                    data: {
                      ...current.data,
                      ...nextData,
                      label: nextData.name || current.data.label,
                    },
                  }
                : current
            );
          }}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}

export default function PlaybookFlowDesigner(props) {
  return (
    <ReactFlowProvider>
      <PlaybookFlowDesignerInner {...props} />
    </ReactFlowProvider>
  );
}