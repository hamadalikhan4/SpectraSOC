export default function EmptyState({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="spectra-empty-state">
      {icon && <div className="spectra-empty-icon">{icon}</div>}
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}