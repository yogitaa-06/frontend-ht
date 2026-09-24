import { ChevronLeft, ChevronRight } from "lucide-react";

interface JobPaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function JobPagination({
  page,
  pages,
  onPageChange,
}: JobPaginationProps) {
  return (
    <nav className="job-pagination" aria-label="Job results pagination">
      <button
        className="secondary"
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Previous
      </button>
      <span aria-live="polite">
        Page <b>{page}</b> of <b>{pages}</b>
      </span>
      <button
        className="secondary"
        type="button"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
