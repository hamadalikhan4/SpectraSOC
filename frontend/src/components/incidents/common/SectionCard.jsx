export default function SectionCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3>{title}</h3>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      <div className="section-card-body">
        {children}
      </div>
    </div>
  );
}