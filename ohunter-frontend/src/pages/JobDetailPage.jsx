import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { applyToJob, getAllJobs, getJobById } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import {
  formatDescription,
  formatJobType,
  formatPostedDays,
  formatSalaryRange,
  getCompanyName,
  getJobRequirements,
} from "../utils/jobUtils";

function JobDetailSkeleton() {
  return (
    <div className="job-detail-layout">
      <section className="job-detail-main">
        <article className="card job-detail-card skeleton-card">
          <div className="skeleton skeleton-line large" />
          <div className="skeleton skeleton-line medium" />
          <div className="job-card-meta">
            <div className="skeleton skeleton-chip" />
            <div className="skeleton skeleton-chip" />
          </div>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </article>
      </section>
      <aside className="job-detail-side">
        <article className="card job-side-card skeleton-card">
          <div className="skeleton skeleton-line medium" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </article>
      </aside>
    </div>
  );
}

export default function JobDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isJobseeker, token, userId } = useAuth();
  const { toast, showToast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const descriptionParagraphs = useMemo(() => formatDescription(job?.description), [job?.description]);
  const requirements = useMemo(() => getJobRequirements(job), [job]);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);

      try {
        const directJob = await getJobById(id);
        setJob(directJob);
      } catch {
        try {
          const jobs = await getAllJobs();
          const fallbackJob = (Array.isArray(jobs) ? jobs : []).find((item) => String(item.id) === String(id));
          setJob(fallbackJob || null);
        } catch (error) {
          setJob(null);
          showToast(error?.message || error?.error || "Unable to load this job.", "error");
        }
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id, showToast]);

  async function handleApply() {
    if (!job || !isJobseeker) return;

    setApplying(true);

    try {
      await applyToJob(job.id, userId, token);
      setApplied(true);
      showToast("Applied successfully!", "success");
    } catch (error) {
      showToast(error?.message || error?.error || "Unable to submit application.", "error");
    } finally {
      setApplying(false);
    }
  }

  return (
    <main className="page-container detail-page">
      <Toast {...toast} />

      <button className="back-link" type="button" onClick={() => navigate("/jobs")}>
        ← Back to jobs
      </button>

      {loading ? <JobDetailSkeleton /> : null}

      {!loading && !job ? (
        <article className="card page-card empty-state">
          <div className="empty-illustration" aria-hidden="true">
            🧭
          </div>
          <h2>Job not found</h2>
          <p>The role you are looking for may have been removed or is no longer active.</p>
          <Link className="btn-primary" to="/jobs">
            Browse Jobs
          </Link>
        </article>
      ) : null}

      {!loading && job ? (
        <div className="job-detail-layout">
          <section className="job-detail-main">
            <article className="card job-detail-card">
              <span className="badge chip chip-soft">{formatPostedDays(job.createdAt)}</span>
              <h1>{job.title}</h1>
              <p className="job-detail-company">{getCompanyName(job)}</p>

              <div className="job-card-meta">
                <span className="badge chip">
                  <span aria-hidden="true">📍</span>
                  {job.location || "Remote"}
                </span>
                <span className="badge chip">
                  <span aria-hidden="true">💼</span>
                  {formatJobType(job.jobType)}
                </span>
              </div>
            </article>

            <article className="card job-detail-card">
              <h2>Role Overview</h2>
              <div className="job-description-stack">
                {descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <article className="card job-detail-card">
              <h2>Requirements</h2>
              <ul className="requirements-list">
                {requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </article>
          </section>

          <aside className="job-detail-side">
            <article className="card job-side-card">
              <span className="badge chip chip-soft">Compensation</span>
              <h3>{formatSalaryRange(job)}</h3>
              <p>Location: {job.location || "Remote"}</p>
              <p>Type: {formatJobType(job.jobType)}</p>

              {isAuthenticated && isJobseeker ? (
                <button
                  className="btn-primary apply-button"
                  type="button"
                  onClick={handleApply}
                  disabled={applying || applied}
                >
                  {applying ? <LoadingSpinner label="Applying" /> : null}
                  {applied ? "Application Sent" : applying ? "Applying..." : "Apply Now"}
                </button>
              ) : null}

              {!isAuthenticated ? (
                <Link className="btn-outline" to="/login">
                  Login to Apply
                </Link>
              ) : null}

              {isAuthenticated && !isJobseeker ? (
                <p className="helper">
                  Employer accounts can view the job, but only jobseekers can apply.
                </p>
              ) : null}
            </article>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
