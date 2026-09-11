import { Filter, Search } from "lucide-react";

export default function IncidentFilters({
  search,
  setSearch,
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="card incident-filter-card">
      <div className="incident-filter-left">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by incident ID, IOC, type, or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="incident-filter-right">
        <Filter size={16} />

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="CONTAINED">Contained</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
    </div>
  );
}