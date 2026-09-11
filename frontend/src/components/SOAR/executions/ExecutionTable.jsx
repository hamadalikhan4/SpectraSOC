import { useMemo, useState } from "react";
import { Eye, Filter, RefreshCcw, Search } from "lucide-react";

import SOAR_API from "../../../api/soarApi";
import ExecutionDetailsDrawer from "./ExecutionDetailsDrawer";

export default function ExecutionTable({ executions = [], loading, onRefresh }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [simulating, setSimulating] = useState("");

  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      const matchesSearch =
        execution.execution_id?.toLowerCase().includes(query.toLowerCase()) ||
        execution.playbook?.toLowerCase().includes(query.toLowerCase()) ||
        execution.trigger?.toLowerCase().includes(query.toLowerCase());

      const matchesFilter = filter === "All" || execution.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [query, filter, executions]);

  const simulateProgress = async (execution) => {
    try {
      setSimulating(execution.id);

      await SOAR_API.simulateExecutionProgress(execution.id);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to simulate execution progress.");
    } finally {
      setSimulating("");
    }
  };

  return (
    <>
      <div className="spectra-glass-card execution-table-card">
        <div className="execution-panel-header">
          <div>
            <h2>Execution History</h2>
            <p>Track every automated response workflow from PostgreSQL</p>
          </div>

          <button className="details-btn" onClick={onRefresh}>
            <RefreshCcw size={15} />
            Refresh
          </button>
        </div>

        <div className="execution-toolbar">
          <div className="search-wrap">
            <Search size={18} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search execution ID, playbook, trigger..."
            />
          </div>

          <div className="filter-wrap">
            <Filter size={17} />

            {["All", "Running", "Completed", "Failed", "Queued"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="subtitle">Loading backend executions...</p>
        ) : filteredExecutions.length === 0 ? (
          <div style={{ padding: "18px" }}>
            <h3>No executions found</h3>
            <p className="subtitle">
              Start a playbook execution from Playbook Builder first.
            </p>
          </div>
        ) : (
          <div className="execution-table-wrap">
            <table className="execution-table">
              <thead>
                <tr>
                  <th>Execution ID</th>
                  <th>Playbook</th>
                  <th>Trigger</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Started</th>
                  <th>Analyst</th>
                  <th>Progress</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredExecutions.map((execution) => (
                  <tr key={execution.id}>
                    <td>
                      <b>{execution.execution_id}</b>
                    </td>

                    <td>{execution.playbook}</td>
                    <td>{execution.trigger}</td>

                    <td>
                      <span
                        className={`severity-badge ${execution.severity.toLowerCase()}`}
                      >
                        {execution.severity}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`execution-status ${execution.status.toLowerCase()}`}
                      >
                        {execution.status}
                      </span>
                    </td>

                    <td>{execution.runtime}</td>
                    <td>{execution.started}</td>
                    <td>{execution.analyst}</td>
                    <td>{execution.progress}%</td>

                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="details-btn"
                          onClick={() => setSelectedExecution(execution)}
                        >
                          <Eye size={15} />
                          View
                        </button>

                        {execution.status !== "Completed" &&
                          execution.status !== "Failed" && (
                            <button
                              className="details-btn"
                              onClick={() => simulateProgress(execution)}
                              disabled={simulating === execution.id}
                            >
                              {simulating === execution.id ? "..." : "Sim"}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedExecution && (
        <ExecutionDetailsDrawer
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </>
  );
}