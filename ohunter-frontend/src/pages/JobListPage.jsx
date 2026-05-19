import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { filterByLocation, getAllJobs, getFresherJobs, searchJobs } from "../api";
import { useToast } from "../hooks/useToast";
import { getCompanyName, isFresherFriendly } from "../utils/jobUtils";

function JobCardSkeleton() {
  return (
    <article className="job-card card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-line large" />
      <div className="skeleton skeleton-line medium" />
      <div className="job-card-meta">
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-chip wide" />
      </div>
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </article>
  );
}

function matchesKeyword(job, keyword) {
  const haystack = [
    job?.title,
    getCompanyName(job),
    job?.requiredSkills,
    job?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(keyword.toLowerCase());
}

export default function JobListPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [fresherOnly, setFresherOnly] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const isEmpty = useMemo(() => !loading && jobs.length === 0, [jobs.length, loading]);

  async function loadJobs(overrides = {}) {
    const nextKeyword = overrides.keyword ?? keyword;
    const nextLocation = overrides.location ?? location;
    const nextFresher = overrides.fresherOnly ?? fresherOnly;

    setLoading(true);

    try {
      let data;
      const hasKeyword = nextKeyword.trim().length > 0;
      const hasLocation = nextLocation.trim().length > 0;

      if (nextFresher && !hasKeyword && !hasLocation) {
        data = await getFresherJobs();
      } else if (hasKeyword && !hasLocation && !nextFresher) {
        data = await searchJobs(nextKeyword.trim());
      } else if (hasLocation && !hasKeyword && !nextFresher) {
        data = await filterByLocation(nextLocation.trim());
      } else {
        data = await getAllJobs();
        data = (Array.isArray(data) ? data : []).filter((job) => {
          const keywordMatch = hasKeyword ? matchesKeyword(job, nextKeyword.trim()) : true;
          const locationMatch = hasLocation
            ? (job.location || "").toLowerCase().includes(nextLocation.trim().toLowerCase())
            : true;
          const fresherMatch = nextFresher ? isFresherFriendly(job) : true;
          return keywordMatch && locationMatch && fresherMatch;
        });
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setJobs([]);
      showToast(error?.message || error?.error || "Unable to load jobs right now.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 300);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleClearFilters() {
    setKeyword("");
    setLocation("");
    setFresherOnly(false);
    loadJobs({ keyword: "", location: "", fresherOnly: false });
  }

  return (
    <main className="page-container jobs-page">
      <Toast {...toast} />

      <section className="jobs-search card">
        <form
          className="search-grid"
          onSubmit={(event) => {
            event.preventDefault();
            loadJobs();
          }}
        >
          <label className="search-field">
            <span>Keyword</span>
            <input
              className="input-field"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search by role, skills, or company"
            />
          </label>

          <label className="search-field">
            <span>Location</span>
            <input
              className="input-field"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, region, or remote"
            />
          </label>

          <label className="toggle-switch toggle-inline">
            <input
              type="checkbox"
              checked={fresherOnly}
              onChange={(event) => setFresherOnly(event.target.checked)}
            />
            <span className="toggle-slider" aria-hidden="true" />
            <span>Fresher Only</span>
          </label>

          <div className="toolbar job-search-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <LoadingSpinner label="Searching jobs" /> : null}
              {loading ? "Searching..." : "Search"}
            </button>
            <button className="btn-outline" type="button" disabled={loading} onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="jobs-grid-wrap">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <JobCardSkeleton key={index} />)
        ) : isEmpty ? (
          <EmptyState
            icon="🔎"
            title="No jobs found"
            message="Try adjusting your filters to uncover more opportunities."
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => navigate(`/jobs/${job.id}`)}
            />
          ))
        )}
      </section>

      {showBackToTop ? (
        <button
          className="back-to-top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑ Top
        </button>
      ) : null}
    </main>
  );
}
