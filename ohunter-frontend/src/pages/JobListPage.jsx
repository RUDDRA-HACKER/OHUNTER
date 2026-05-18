import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { filterByLocation, getAllJobs, getFresherJobs, searchJobs } from "../api";

function formatSalary(job) {
  const min = job.minSalary ?? job.salaryMin ?? job.minSalaryRange;
  const max = job.maxSalary ?? job.salaryMax ?? job.maxSalaryRange;
  if (min == null && max == null) return "Salary undisclosed";
  return `${min ? `₹${Number(min).toLocaleString("en-IN")}` : "—"} - ${max ? `₹${Number(max).toLocaleString("en-IN")}` : "—"}`;
}

function JobSkeleton() {
  return (
    <article className="job-card card skeleton-card">
      <div className="skeleton skeleton-badge" />
      <div className="skeleton skeleton-line large" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton-grid">
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-chip" />
      </div>
    </article>
  );
}

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [fresherOnly, setFresherOnly] = useState(false);
  const [sticky, setSticky] = useState(false);

  const isEmpty = useMemo(() => !loading && jobs.length === 0, [jobs.length, loading]);

  async function loadJobs({ nextKeyword = keyword, nextLocation = location, nextFresher = fresherOnly } = {}) {
    setLoading(true);
    try {
      let data = [];
      if (nextFresher) {
        data = await getFresherJobs();
      } else if (nextKeyword.trim()) {
        data = await searchJobs(nextKeyword.trim());
      } else if (nextLocation.trim()) {
        data = await filterByLocation(nextLocation.trim());
      } else {
        data = await getAllJobs();
      }
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!fresherOnly) {
        loadJobs({ nextKeyword: keyword, nextLocation: location, nextFresher: false });
      }
    }, 400);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, location]);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="page-container jobs-page">
      <section className={`jobs-search card ${sticky ? "sticky-search" : ""}`}>
        <div className="search-grid">
          <label className="search-field">
            <span>Keyword</span>
            <input className="input-field" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search by role or skill" />
          </label>
          <label className="search-field">
            <span>Location</span>
            <input className="input-field" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, area, remote" />
          </label>
          <label className="toggle-field">
            <input type="checkbox" checked={fresherOnly} onChange={(event) => {
              const checked = event.target.checked;
              setFresherOnly(checked);
              if (checked) {
                loadJobs({ nextKeyword: "", nextLocation: "", nextFresher: true });
              } else {
                loadJobs({ nextKeyword: keyword, nextLocation: location, nextFresher: false });
              }
            }} />
            <span>Fresher Only</span>
          </label>
          <div className="toolbar job-search-actions">
            <button className="btn-primary" type="button" onClick={() => loadJobs({ nextKeyword: keyword, nextLocation: location, nextFresher: fresherOnly })}>
              Search
            </button>
            <button
              className="btn-outline"
              type="button"
              onClick={() => {
                setKeyword("");
                setLocation("");
                setFresherOnly(false);
                loadJobs({ nextKeyword: "", nextLocation: "", nextFresher: false });
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="jobs-grid-wrap">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <JobSkeleton key={index} />)
        ) : isEmpty ? (
          <div className="empty-state card">
            <div className="empty-illustration" aria-hidden="true">🔎</div>
            <h2>No jobs found</h2>
            <p>Try adjusting your filters or clear the search to see all opportunities.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const fresherFriendly = Boolean(job.fresher || job.isFresher || job.minExperience === 0);
            return (
              <Link key={job.id} to={`/jobs/${job.id}`} className="job-card card job-link">
                <div className="card-head job-card-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company?.name || job.companyName || "OHunter hiring partner"}</p>
                  </div>
                  <span className="badge">{job.jobType || "Full Time"}</span>
                </div>

                <div className="job-meta-grid">
                  <span className="badge">{job.location || "Remote"}</span>
                  <span className="badge">{formatSalary(job)}</span>
                  <span className="badge">Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}</span>
                </div>

                <p className="job-summary">{job.description || "Discover the latest job opportunity."}</p>

                <div className="card-foot">
                  {fresherFriendly ? <span className="tag-fresher">Fresher Friendly</span> : <span />}
                  <span className="view-link">View details →</span>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </main>
  );
}
