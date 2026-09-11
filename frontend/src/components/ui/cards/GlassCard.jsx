export default function GlassCard({ children, className = "" }) {
  return (
    <div className={`spectra-glass-card ${className}`}>
      {children}
    </div>
  );
}