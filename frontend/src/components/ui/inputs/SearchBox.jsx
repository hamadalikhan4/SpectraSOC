import { Search } from "lucide-react";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="spectra-search-box">
      <Search size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}