export function JobCardSkeleton() {
  return (
    <div className="job-card job-card-skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-company" />
      <div className="skeleton-meta">
        <span />
        <span />
        <span />
      </div>
      <div className="skeleton-line skeleton-copy" />
      <div className="skeleton-line skeleton-copy short" />
    </div>
  );
}
