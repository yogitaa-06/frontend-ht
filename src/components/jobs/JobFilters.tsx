import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface JobFiltersProps {
  query: string;
  role: string;
  location: string;
  remote: boolean;
  employmentType: string;
  source: string;
  onChange: (updates: {
    query?: string | null;
    role?: string | null;
    location?: string | null;
    remote?: boolean | null;
    employmentType?: string | null;
    source?: string | null;
  }) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export function JobFilters({
  query,
  role,
  location,
  remote,
  employmentType,
  source,
  onChange,
  onClear,
  hasFilters,
}: JobFiltersProps) {
  // Debounce the text search
  const [localQuery, setLocalQuery] = useState(query);
  const [localLocation, setLocalLocation] = useState(location);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    setLocalLocation(location);
  }, [location]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localQuery !== query) onChange({ query: localQuery || null });
    }, 400);
    return () => clearTimeout(t);
  }, [localQuery, query, onChange]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localLocation !== location) onChange({ location: localLocation || null });
    }, 400);
    return () => clearTimeout(t);
  }, [localLocation, location, onChange]);

  return (
    <div className="job-filters-bar">
      <div className="filter-row primary-search">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search keywords or titles..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            aria-label="Search jobs"
          />
        </div>
      </div>
      
      <div className="filter-row secondary-filters">
        <div className="search-input-wrap location-wrap">
          <input
            type="text"
            placeholder="Location..."
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            aria-label="Filter by location"
          />
        </div>

        <select
          value={role}
          onChange={(e) => onChange({ role: e.target.value || null })}
          aria-label="Filter by role family"
        >
          <option value="">All roles</option>
          <option value="engineering">Engineering</option>
          <option value="data">Data</option>
          <option value="product">Product</option>
          <option value="design">Design</option>
          <option value="sales">Sales</option>
        </select>

        <select
          value={employmentType}
          onChange={(e) => onChange({ employmentType: e.target.value || null })}
          aria-label="Filter by employment type"
        >
          <option value="">All employment types</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="CONTRACTOR">Contract</option>
          <option value="PART_TIME">Part-time</option>
          <option value="INTERN">Internship</option>
        </select>

        <select
          value={source}
          onChange={(e) => onChange({ source: e.target.value || null })}
          aria-label="Filter by source"
        >
          <option value="">All sources</option>
          <option value="dice">Dice</option>
          <option value="linkedin">LinkedIn</option>
          <option value="glassdoor">Glassdoor</option>
          <option value="hiringcafe">HiringCafe</option>
        </select>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => onChange({ remote: e.target.checked || null })}
          />
          Remote only
        </label>
        
        {hasFilters && (
          <button className="clear-filters icon-button" onClick={onClear} aria-label="Clear filters">
            <X size={15} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
