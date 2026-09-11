export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="spectra-page-header">
      <div>
        {eyebrow && <span className="spectra-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action && <div className="spectra-page-action">{action}</div>}
    </div>
  );
}