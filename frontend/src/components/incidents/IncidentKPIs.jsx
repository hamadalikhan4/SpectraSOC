import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
} from "lucide-react";

export default function IncidentKPIs({ stats }) {
  return (
    <div className="incident-kpi-grid">
      <KpiCard icon={<AlertTriangle />} label="Total Incidents" value={stats.total} />
      <KpiCard icon={<Flame />} label="Critical" value={stats.critical} danger />
      <KpiCard icon={<Clock />} label="Open" value={stats.open} />
      <KpiCard icon={<Activity />} label="Investigating" value={stats.investigating} />
      <KpiCard icon={<ShieldCheck />} label="Contained" value={stats.contained} />
      <KpiCard icon={<CheckCircle2 />} label="Closed" value={stats.closed} />
      <KpiCard icon={<Clock />} label="MTTR" value={stats.mttr} />
      <KpiCard icon={<ShieldCheck />} label="SLA Health" value={stats.sla} />
    </div>
  );
}

function KpiCard({ icon, label, value, danger }) {
  return (
    <div className={danger ? "kpi-card danger" : "kpi-card"}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}