export default function StatCard({ title, value }) {
  return (
    <div className="card">
      <div className="label">{title}</div>

      <div className="metric">
        {value}
      </div>
    </div>
  );
}