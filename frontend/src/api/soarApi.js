import API from "./api";

const unwrap = (request) => request.then((res) => res.data);

const SOAR_API = {
  getOverview: () => unwrap(API.get("/api/v1/soar/overview")),

  getPlaybooks: (params = {}) =>
    unwrap(API.get("/api/v1/soar/playbooks", { params })),

  getPlaybook: (id) =>
    unwrap(API.get(`/api/v1/soar/playbooks/${id}`)),

  createPlaybook: (payload) =>
    unwrap(API.post("/api/v1/soar/playbooks", payload)),

  updatePlaybook: (id, payload) =>
    unwrap(API.put(`/api/v1/soar/playbooks/${id}`, payload)),

  replacePlaybookSteps: (id, steps) =>
    unwrap(API.put(`/api/v1/soar/playbooks/${id}/steps`, { steps })),

  startPlaybook: (id, payload) =>
    unwrap(API.post(`/api/v1/soar/playbooks/${id}/start`, payload)),

  getExecutions: (params = {}) =>
    unwrap(API.get("/api/v1/soar/executions", { params })),

  getExecution: (id) =>
    unwrap(API.get(`/api/v1/soar/executions/${id}`)),

  createExecution: (payload) =>
    unwrap(API.post("/api/v1/soar/executions", payload)),

  updateExecution: (id, payload) =>
    unwrap(API.put(`/api/v1/soar/executions/${id}`, payload)),

  simulateExecutionProgress: (id) =>
    unwrap(API.post(`/api/v1/soar/executions/${id}/simulate-progress`)),

  simulateExecutionFailure: (id) =>
    unwrap(API.post(`/api/v1/soar/executions/${id}/simulate-failure`)),

  retryFailedExecutionStep: (id, payload = {}) =>
    unwrap(API.post(`/api/v1/soar/executions/${id}/retry-failed-step`, payload)),

  getConnectors: (params = {}) =>
    unwrap(API.get("/api/v1/soar/connectors", { params })),

  getConnector: (id) =>
    unwrap(API.get(`/api/v1/soar/connectors/${id}`)),

  createConnector: (payload) =>
    unwrap(API.post("/api/v1/soar/connectors", payload)),

  updateConnector: (id, payload) =>
    unwrap(API.put(`/api/v1/soar/connectors/${id}`, payload)),

  seedConnectors: () =>
    unwrap(API.post("/api/v1/soar/connectors/seed-defaults")),

  getSettings: () =>
    unwrap(API.get("/api/v1/soar/settings")),

  updateSettings: (payload) =>
    unwrap(API.put("/api/v1/soar/settings", payload)),
};

export default SOAR_API;