import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Database,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { JobCard } from "../components/jobs/JobCard";
import { JobCardSkeleton } from "../components/jobs/JobCardSkeleton";
import { JobPagination } from "../components/jobs/JobPagination";
import { JobFilters } from "../components/jobs/JobFilters";
import { endpoints } from "../lib/api";
import type { Job } from "../types";

const pageSize = 20;

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="page-header fresh-jobs-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function FreshJobs() {
  const getParams = () => {
    const hash = window.location.hash;
    const qIndex = hash.indexOf("?");
    return new URLSearchParams(qIndex !== -1 ? hash.slice(qIndex) : "");
  };

  const [urlParams, setUrlParams] = useState(getParams);

  useEffect(() => {
    const onHash = () => setUrlParams(getParams());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const page = Number(urlParams.get("page") || "1");
  const query = urlParams.get("query") || "";
  const role = urlParams.get("role") || "";
  const location = urlParams.get("location") || "";
  const remote = urlParams.get("remote") === "true";
  const employmentType = urlParams.get("employment_type") || "";
  const source = urlParams.get("source") || "";
  const matchResume = urlParams.get("match_resume") === "true";
  
  const hasFilters = Boolean(query || role || location || remote || employmentType || source);

  const updateParams = (updates: Record<string, string | boolean | null>) => {
    const next = getParams();
    let changed = false;
    
    // Changing filters resets page to 1
    let resetPage = false;

    for (const [k, v] of Object.entries(updates)) {
      if (k !== "page") resetPage = true;
      if (v === null || v === false || v === "") {
        if (next.has(k)) { next.delete(k); changed = true; }
      } else {
        if (next.get(k) !== String(v)) { next.set(k, String(v)); changed = true; }
      }
    }
    
    if (resetPage && next.has("page") && !updates.page) {
      next.delete("page");
      changed = true;
    }

    if (changed) {
      const hash = window.location.hash.split("?")[0];
      const qs = next.toString();
      window.location.hash = qs ? `${hash}?${qs}` : hash;
    }
  };

  const clearFilters = () => {
    const hash = window.location.hash.split("?")[0];
    window.location.hash = hash;
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const jobsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchJobs = matchResume
      ? endpoints.recommendedJobs(page, pageSize)
      : endpoints.jobs(page, pageSize, {
          query: query || undefined,
          role: role || undefined,
          location: location || undefined,
          remote: remote || undefined,
          employment_type: employmentType || undefined,
          source: source || undefined,
        });

    fetchJobs
      .then((response) => {
        if (cancelled) return;
        setJobs(response.items);
        setTotal(response.total);
        setPages(response.pages);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, query, role, location, remote, employmentType, source, matchResume, refreshKey]);

  const changePage = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
    requestAnimationFrame(() => {
      jobsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <>
      <PageHeader
        eyebrow="Global job pool"
        title="Fresh jobs"
        description="Recently published jobs collected by HireAndTech background workers."
        action={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label className="tracking-filter-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={matchResume}
                onChange={(e) => updateParams({ match_resume: e.target.checked, page: "1" })}
              />
              Match with My Resume
            </label>
            <button
              className="secondary"
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              disabled={loading}
            >
              <RefreshCw
                className={loading ? "spin" : undefined}
                size={16}
                aria-hidden="true"
              />
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        }
      />

      <div className="info-banner jobs-info-banner">
        <BriefcaseBusiness size={19} aria-hidden="true" />
        <div>
          <b>Jobs are collected in the background</b>
          <span>
            Opening this page reads the global job database. It does not start a
            scraper.
          </span>
        </div>
      </div>

      <JobFilters
        query={query}
        role={role}
        location={location}
        remote={remote}
        employmentType={employmentType}
        source={source}
        onChange={(updates) => updateParams({
          query: updates.query ?? query,
          role: updates.role ?? role,
          location: updates.location ?? location,
          remote: updates.remote ?? remote,
          employment_type: updates.employmentType ?? employmentType,
          source: updates.source ?? source,
        })}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      <div className="jobs-section" ref={jobsSectionRef} aria-busy={loading}>
        {!loading && !error && total > 0 && (
          <div className="jobs-summary">
            <div className="jobs-summary-icon">
              <Database size={19} aria-hidden="true" />
            </div>
            <div className="jobs-summary-copy">
              <span className="eyebrow">Canonical job database</span>
              <h2>{total.toLocaleString()} fresh jobs</h2>
            </div>
            <div className="jobs-summary-range">
              <b>
                {firstResult}–{lastResult}
              </b>{" "}
              of {total.toLocaleString()}
              <span>
                Page {page} of {pages}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="job-list" aria-label="Loading fresh jobs">
            {Array.from({ length: 4 }, (_, index) => (
              <JobCardSkeleton key={index} />
            ))}
            <span className="sr-only" role="status">
              Loading fresh jobs
            </span>
          </div>
        ) : error ? (
          <div className="jobs-state-card" role="alert">
            <div className="empty-icon error-state-icon">
              <TriangleAlert size={21} aria-hidden="true" />
            </div>
            <h2>Unable to load fresh jobs.</h2>
            <p>
              Please try again. Your current page and filters are unchanged.
            </p>
            <button
              className="secondary"
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="jobs-state-card">
            <div className="empty-icon">
              <BriefcaseBusiness size={21} aria-hidden="true" />
            </div>
            <h2>{hasFilters ? "No jobs match your current filters." : "No fresh jobs are available yet."}</h2>
            <p>
              {hasFilters ? "Try adjusting your search criteria." : "Jobs will appear here as HireAndTech background collectors ingest them."}
            </p>
            {hasFilters && (
              <button className="secondary" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="job-list">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <JobPagination
              page={page}
              pages={pages}
              onPageChange={changePage}
            />
          </>
        )}
      </div>
    </>
  );
}
