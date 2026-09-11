export default function WorkspaceHeader({
  icon,
  title,
  description,
  status = "Active",
  statusType = "info",
}) {
  return (
    <div className="workspace-tab-header">
      <div className="workspace-tab-title">
        <div className="workspace-tab-icon">{icon}</div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <span className={`workspace-status-chip ${statusType}`}>
        {status}
      </span>
    </div>
  );
}