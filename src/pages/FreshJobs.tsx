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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
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

    endpoints
      .jobs(page, pageSize)
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
  }, [page, refreshKey]);

  const changePage = (nextPage: number) => {
    setPage(nextPage);
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
            <h2>No fresh jobs are available yet.</h2>
            <p>
              Jobs will appear here as HireAndTech background collectors ingest
              them.
            </p>
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
