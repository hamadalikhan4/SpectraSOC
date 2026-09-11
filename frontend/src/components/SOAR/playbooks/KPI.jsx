export default function KPI({ label, value, trend }) {
  return (
    <div className="spectra-glass-card playbook-kpi">
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{trend}</span>
      </div>
    </div>
  );
}