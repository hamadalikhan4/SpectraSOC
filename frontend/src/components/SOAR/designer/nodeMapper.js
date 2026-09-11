export function buildDefaultSteps(playbook = {}) {
  return [
    {
      step_order: 1,
      step_type: "Trigger",
      name: playbook.trigger_source || "Security Alert Trigger",
      description: "Start the workflow when the configured alert is detected.",
      action_key: "security.alert.trigger",
      connector_name: "SpectraSOC SIEM",
      config: {},
      condition: {},
      timeout_seconds: 60,
      retry_count: 0,
    },
    {
      step_order: 2,
      step_type: "Action",
      name: "Extract Indicators",
      description: "Extract IPs, domains, URLs, hashes, and users.",
      action_key: "ioc.extract",
      connector_name: "SpectraSOC Parser",
      config: {},
      condition: {},
      timeout_seconds: 60,
      retry_count: 1,
    },
    {
      step_order: 3,
      step_type: "Action",
      name: "Enrich Indicators",
      description: "Query threat intelligence providers.",
      action_key: "ioc.enrich",
      connector_name: "VirusTotal",
      config: {},
      condition: {},
      timeout_seconds: 90,
      retry_count: 2,
    },
    {
      step_order: 4,
      step_type: "Decision",
      name: "Evaluate Risk",
      description: "Continue only if risk score is above threshold.",
      action_key: "risk.evaluate",
      connector_name: "SpectraSOC Risk Engine",
      config: { threshold: 70 },
      condition: { risk_score: ">70" },
      timeout_seconds: 30,
      retry_count: 0,
    },
    {
      step_order: 5,
      step_type: "Action",
      name: "Create Incident",
      description: "Create incident and attach evidence.",
      action_key: "incident.create",
      connector_name: "Incident Repository",
      config: {},
      condition: {},
      timeout_seconds: 60,
      retry_count: 1,
    },
  ];
}

export function stepsToFlow(steps = [], playbook = {}) {
  const safeSteps =
    Array.isArray(steps) && steps.length > 0 ? steps : buildDefaultSteps(playbook);

  const sortedSteps = [...safeSteps].sort(
    (a, b) => Number(a.step_order || 0) - Number(b.step_order || 0)
  );

  const nodes = sortedSteps.map((step, index) => ({
    id: `step-${index + 1}`,
    type: "soarNode",
    position: {
      x: (index % 3) * 360,
      y: Math.floor(index / 3) * 230 + 80,
    },
    data: {
      ...step,
      label: step.name,
      step_order: index + 1,
      step_type: step.step_type || "Action",
      name: step.name || `Step ${index + 1}`,
      description: step.description || "",
      action_key: step.action_key || "",
      connector_name: step.connector_name || "",
      config: step.config || {},
      condition: step.condition || {},
      timeout_seconds: Number(step.timeout_seconds || 60),
      retry_count: Number(step.retry_count || 0),
    },
  }));

  const edges = nodes.slice(0, -1).map((node, index) => ({
    id: `edge-${index + 1}`,
    source: node.id,
    target: nodes[index + 1].id,
    animated: true,
    type: "smoothstep",
  }));

  return { nodes, edges };
}

export function normalizeNodeOrder(nodes = []) {
  return [...nodes]
    .sort((a, b) => {
      const orderA = Number(a.data?.step_order || 9999);
      const orderB = Number(b.data?.step_order || 9999);

      if (orderA !== orderB) return orderA - orderB;

      if (a.position.y === b.position.y) {
        return a.position.x - b.position.x;
      }

      return a.position.y - b.position.y;
    })
    .map((node, index) => ({
      ...node,
      data: {
        ...node.data,
        step_order: index + 1,
      },
    }));
}

export function flowToSteps(nodes = []) {
  return normalizeNodeOrder(nodes).map((node, index) => ({
    step_order: index + 1,
    step_type: node.data.step_type || "Action",
    name: node.data.name || node.data.label || `Step ${index + 1}`,
    description: node.data.description || "",
    action_key: node.data.action_key || "",
    connector_name: node.data.connector_name || "",
    config: node.data.config || {},
    condition: node.data.condition || {},
    timeout_seconds: Number(node.data.timeout_seconds || 60),
    retry_count: Number(node.data.retry_count || 0),
  }));
}