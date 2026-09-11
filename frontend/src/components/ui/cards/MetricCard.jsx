export default function MetricCard({
  icon,
  label,
  value,
  subtext,
  tone = "info",
}) {
  return (
    <div className={`spectra-metric-card ${tone}`}>
      <div className="spectra-metric-icon">{icon}</div>

      <span>{label}</span>
      <b>{value}</b>

      {subtext && <small>{subtext}</small>}
    </div>
  );
}