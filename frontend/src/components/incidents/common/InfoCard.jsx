export default function InfoCard({
  icon,
  title,
  value,
  subtitle,
  badge,
}) {
  return (
    <div className="info-card">
      <div className="info-card-top">
        <div className="info-card-icon">
          {icon}
        </div>

        {badge && (
          <span className="info-card-badge">
            {badge}
          </span>
        )}
      </div>

      <span className="info-card-title">
        {title}
      </span>

      <h3 className="info-card-value">
        {value}
      </h3>

      {subtitle && (
        <small className="info-card-subtitle">
          {subtitle}
        </small>
      )}
    </div>
  );
}