import {
  Activity,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";

function getIcon(status) {
  if (status === "Running") return Loader2;
  if (status === "Failed") return XCircle;
  return CheckCircle2;
}

function getStatusClass(status) {
  if (status === "Running") return "running";
  if (status === "Failed") return "failed";
  return "success";
}

export default function LiveExecutionFeed({ executions = [], loading, onRefresh }) {
  const feed = executions.slice(0, 5);

  return (
    <div className="spectra-glass-card live-feed-panel">
      <div className="execution-panel-header">
        <div>
          <h2>Live Execution Feed</h2>
          <p>Real-time automation activity stream from FastAPI</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="live-pill">
            <Activity size={14} />
            Live
          </span>

          <button className="details-btn" onClick={onRefresh}>
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="subtitle">Loading backend execution feed...</p>
      ) : feed.length === 0 ? (
        <p className="subtitle">
          No executions yet. Open a playbook and click Test Run to create one.
        </p>
      ) : (
        <div className="live-feed-list">
          {feed.map((execution) => {
            const Icon = getIcon(execution.status);

            return (
              <div className="live-feed-item" key={execution.id}>
                <div className={`feed-icon ${getStatusClass(execution.status)}`}>
                  <Icon size={15} />
                </div>

                <div>
                  <span>{execution.started}</span>
                  <h4>{execution.playbook}</h4>
                  <p>
                    {execution.execution_id} • {execution.status} • Progress{" "}
                    {execution.progress}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}