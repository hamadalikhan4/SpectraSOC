export default function StatusChip({
  children,
  type = "info",
}) {
  return (
    <span className={`status-chip ${type}`}>
      {children}
    </span>
  );
}