import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import JobFormFields from "../components/JobFormFields";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { deleteJob, getAllJobs, getApplicantsForJob, getEmployerJobs, updateJob } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import {
  formatJobType,
  normalizeJobForm,
  toJobPayload,
  validateJobForm,
} from "../utils/jobUtils";

function dashboardNavClass({ isActive }) {
  return `dashboard-nav-link${isActive ? " active" : ""}`;
}

function TableSkeleton() {
  return (
    <div className="dashboard-table-shell card">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Type</th>
            <th>Applications</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, index) => (
            <tr key={index}>
              <td><div className="skeleton skeleton-line medium" /></td>
              <td><div className="skeleton skeleton-line short" /></td>
              <td><div className="skeleton skeleton-chip" /></td>
              <td><div className="skeleton skeleton-chip" /></td>
              <td><div className="skeleton skeleton-line short" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EmployerDashboard() {
  const { token, userId, logout } = useAuth();
  const { toast, showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState(normalizeJobForm());
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = Object.values(applicationsByJob).reduce((sum, count) => sum + count, 0);
    const activeListings = jobs.filter((job) => job.isActive !== false).length;

    return { totalJobs, totalApplications, activeListings };
  }, [applicationsByJob, jobs]);

  async function loadDashboard() {
    setLoading(true);

    try {
      let employerJobs;

      try {
        employerJobs = await getEmployerJobs(userId, token);
      } catch {
        const allJobs = await getAllJobs();
        employerJobs = (Array.isArray(allJobs) ? allJobs : []).filter(
          (job) => String(job?.employer?.id) === String(userId),
        );
      }

      const safeJobs = Array.isArray(employerJobs) ? employerJobs : [];
      const sortedJobs = safeJobs.sort((firstJob, secondJob) => {
        return new Date(secondJob.createdAt || 0) - new Date(firstJob.createdAt || 0);
      });
      setJobs(sortedJobs);

      const counts = await Promise.all(
        sortedJobs.map(async (job) => {
          try {
            const applications = await getApplicantsForJob(job.id, token);
            return [job.id, Array.isArray(applications) ? applications.length : 0];
          } catch {
            return [job.id, 0];
          }
        }),
      );

      setApplicationsByJob(Object.fromEntries(counts));
    } catch (error) {
      setJobs([]);
      setApplicationsByJob({});
      showToast(error?.message || error?.error || "Unable to load your dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function openEditModal(job) {
    setEditingJob(job);
    setEditForm(normalizeJobForm(job));
  }

  function closeEditModal() {
    setEditingJob(null);
    setEditForm(normalizeJobForm());
    setSavingEdit(false);
  }

  function handleEditChange(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSaveEdit(event) {
    event.preventDefault();

    const validationMessage = validateJobForm(editForm);
    if (validationMessage) {
      showToast(validationMessage, "error");
      return;
    }

    if (!editingJob) return;

    setSavingEdit(true);

    try {
      const updatedJob = await updateJob(editingJob.id, toJobPayload(editForm, editingJob), token);
      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === editingJob.id ? { ...job, ...updatedJob } : job)),
      );
      showToast("Job updated successfully!", "success");
      closeEditModal();
    } catch (error) {
      setSavingEdit(false);
      showToast(error?.message || error?.error || "Unable to update the job.", "error");
    }
  }

  async function handleDelete(jobId) {
    const confirmed = window.confirm("Delete this job listing? Existing applicants will no longer see it.");
    if (!confirmed) return;

    setDeletingJobId(jobId);

    try {
      await deleteJob(jobId, token);
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
      setApplicationsByJob((currentCounts) => {
        const nextCounts = { ...currentCounts };
        delete nextCounts[jobId];
        return nextCounts;
      });
      showToast("Job deleted successfully!", "success");
    } catch (error) {
      showToast(error?.message || error?.error || "Unable to delete the job.", "error");
    } finally {
      setDeletingJobId(null);
    }
  }

  return (
    <main className="page-container employer-dashboard-page">
      <Toast {...toast} />

      <div className="employer-dashboard-layout">
        <aside className="employer-sidebar">
          <div className="employer-sidebar-brand">
            <span className="navbar-logo-accent">O</span>
            <span className="navbar-logo-rest"> HUNTER</span>
          </div>

          <nav className="employer-sidebar-nav">
            <NavLink to="/employer/dashboard" className={dashboardNavClass}>
              My Jobs
            </NavLink>
            <NavLink to="/employer/post-job" className={dashboardNavClass}>
              Post a Job
            </NavLink>
            <button className="dashboard-nav-link logout-link" type="button" onClick={logout}>
              Logout
            </button>
          </nav>
        </aside>

        <section className="employer-main">
          <div className="dashboard-header">
            <div>
              <span className="badge chip chip-soft">Employer Dashboard</span>
              <h1>My Posted Jobs</h1>
            </div>
          </div>

          <div className="dashboard-stats">
            <article className="metric-card">
              <span>Total Jobs Posted</span>
              <strong>{stats.totalJobs}</strong>
            </article>
            <article className="metric-card">
              <span>Total Applications</span>
              <strong>{stats.totalApplications}</strong>
            </article>
            <article className="metric-card">
              <span>Active Listings</span>
              <strong>{stats.activeListings}</strong>
            </article>
          </div>

          {loading ? <TableSkeleton /> : null}

          {!loading && jobs.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No jobs posted yet"
              message="Your listings will appear here once you publish your first opportunity."
              actionLabel="Post a Job"
              actionTo="/employer/post-job"
            />
          ) : null}

          {!loading && jobs.length > 0 ? (
            <div className="dashboard-table-shell card">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.location || "Remote"}</td>
                      <td>{formatJobType(job.jobType)}</td>
                      <td>{applicationsByJob[job.id] || 0}</td>
                      <td>
                        <div className="dashboard-actions">
                          <button className="icon-button" type="button" onClick={() => openEditModal(job)}>
                            ✎
                          </button>
                          <button
                            className="icon-button danger"
                            type="button"
                            disabled={deletingJobId === job.id}
                            onClick={() => handleDelete(job.id)}
                          >
                            {deletingJobId === job.id ? <LoadingSpinner label="Deleting job" /> : "🗑"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>

      {editingJob ? (
        <div className="modal-overlay" role="presentation" onClick={closeEditModal}>
          <div
            className="modal-card card"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editingJob.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="badge chip chip-soft">Edit Listing</span>
                <h2>{editingJob.title}</h2>
              </div>
              <button className="icon-button" type="button" onClick={closeEditModal} aria-label="Close edit modal">
                x
              </button>
            </div>

            <form className="job-post-form" onSubmit={handleSaveEdit}>
              <JobFormFields form={editForm} onChange={handleEditChange} disabled={savingEdit} />

              <div className="modal-actions">
                <button className="btn-outline" type="button" onClick={closeEditModal} disabled={savingEdit}>
                  Cancel
                </button>
                <button className="btn-primary" type="submit" disabled={savingEdit}>
                  {savingEdit ? <LoadingSpinner label="Saving changes" /> : null}
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
