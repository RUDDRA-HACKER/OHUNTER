import {
  formatJobType,
  formatPostedDays,
  formatSalaryRange,
  getCompanyName,
  isFresherFriendly,
} from "../utils/jobUtils";

export default function JobCard({ job, onClick }) {
  const fresherFriendly = isFresherFriendly(job);
  const clickable = typeof onClick === "function";

  function handleKeyDown(event) {
    if (!clickable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <article
      className={`job-card card${clickable ? " job-card-clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="job-card-header">
        <div className="job-card-title-group">
          <h3>{job.title || "Untitled role"}</h3>
          <p>{getCompanyName(job)}</p>
        </div>
      </div>

      <div className="job-card-meta">
        <span className="badge chip">
          <span aria-hidden="true">📍</span>
          {job.location || "Remote"}
        </span>
        <span className="badge chip">
          <span aria-hidden="true">💼</span>
          {formatJobType(job.jobType)}
        </span>
        <span className="badge chip">
          <span aria-hidden="true">💰</span>
          {formatSalaryRange(job)}
        </span>
      </div>

      {job.description ? <p className="job-card-description">{job.description}</p> : null}

      <div className="job-card-footer">
        {fresherFriendly ? <span className="tag-fresher">Fresher OK</span> : <span />}
        <span className="job-card-posted">{formatPostedDays(job.createdAt)}</span>
      </div>
    </article>
  );
}
