import { useState } from "react";
import { BriefcaseBusiness, Clock3, ExternalLink, MapPin, Bookmark } from "lucide-react";
import {
  formatEmploymentType,
  formatJobAge,
  formatSource,
  stripHtml,
} from "../../lib/job-formatters";
import type { Job } from "../../types";

const visibleSkillCount = 4;

export function JobCard({ job }: { job: Job }) {
  const description = stripHtml(job.description);
  const employmentType = formatEmploymentType(job.employment_type);
  const posted = formatJobAge(job.posted_at);
  const visibleSkills = (job.skills ?? []).slice(0, visibleSkillCount);
  const remainingSkills = Math.max(
    0,
    (job.skills?.length ?? 0) - visibleSkillCount,
  );

  const [savedLocally, setSavedLocally] = useState(() => {
    const saved = localStorage.getItem("hnt-tracked-jobs");
    const trackedJobs = saved ? JSON.parse(saved) : [];
    return trackedJobs.some((j: any) => j.id === job.id);
  });

  const addJobToTracker = (stage: string) => {
    const savedStr = localStorage.getItem("hnt-tracked-jobs");
    const trackedJobs = savedStr ? JSON.parse(savedStr) : [];
    
    const existing = trackedJobs.find((j: any) => j.id === job.id);
    if (!existing) {
      trackedJobs.push({
        id: job.id,
        title: job.job_title?.trim() || "Untitled position",
        company: job.company?.trim() || "Unknown Company",
        location: job.location?.trim() || "Remote",
        stage: stage,
        score: Math.floor(Math.random() * 20) + 80,
        appliedAt: new Date().toISOString(),
        job_url: job.job_url,
      });
      localStorage.setItem("hnt-tracked-jobs", JSON.stringify(trackedJobs));
      setSavedLocally(true);
    } else if (existing.stage !== stage) {
      existing.stage = stage;
      localStorage.setItem("hnt-tracked-jobs", JSON.stringify(trackedJobs));
    }
  };

  const handleApply = () => {
    addJobToTracker("interested");
  };

  const handleSave = () => {
    addJobToTracker("saved");
  };

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-heading">
          <h3>{job.job_title?.trim() || "Untitled position"}</h3>
          <p>{job.company?.trim() || "Company not provided"}</p>
        </div>
        <span className="job-badge source-badge">
          {formatSource(job.source)}
        </span>
      </div>

      <div className="job-metadata" aria-label="Job details">
        {job.location?.trim() && (
          <span className="job-meta-item">
            <MapPin size={15} aria-hidden="true" />
            {job.location.trim()}
          </span>
        )}
        {employmentType && (
          <span className="job-meta-item">
            <BriefcaseBusiness size={15} aria-hidden="true" />
            {employmentType}
          </span>
        )}
        {posted && (
          <span className="job-meta-item" title={job.posted_at ?? undefined}>
            <Clock3 size={15} aria-hidden="true" />
            {posted}
          </span>
        )}
        {job.remote === true && (
          <span className="job-badge remote-badge">Remote</span>
        )}
      </div>

      {description && <p className="job-description">{description}</p>}

      <div className="job-card-footer">
        {visibleSkills.length > 0 ? (
          <div className="job-skills" aria-label="Skills">
            {visibleSkills.map((skill, index) => (
              <span className="job-skill" key={`${skill}-${index}`}>
                {skill}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span className="job-skill-count">+{remainingSkills} more</span>
            )}
          </div>
        ) : (
          <span />
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="secondary job-link"
            onClick={handleSave}
            disabled={savedLocally}
          >
            {savedLocally ? "Saved" : "Save"}
            <Bookmark size={15} aria-hidden="true" />
          </button>
          {job.job_url ? (
            <a
              className="primary job-link"
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApply}
            >
              View job
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <span className="job-link-unavailable">Job link unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
