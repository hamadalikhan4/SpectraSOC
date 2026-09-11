export default function StatusBadge({ children, tone = "info" }) {
  return (
    <span className={`spectra-status-badge ${tone}`}>
      {children}
    </span>
  );
}