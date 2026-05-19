import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { getMyApplications, withdrawApplication } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { getApplicationStatusMeta } from "../utils/applicationUtils";
import { formatJobType, getCompanyName } from "../utils/jobUtils";

function formatAppliedDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyApplicationsPage() {
  const { userId, token } = useAuth();
  const { toast, showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const sortedApplications = useMemo(() => {
    return [...applications].sort((firstApplication, secondApplication) => {
      return new Date(secondApplication.appliedAt || 0) - new Date(firstApplication.appliedAt || 0);
    });
  }, [applications]);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);

      try {
        const data = await getMyApplications(userId, token);
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        setApplications([]);
        showToast(error?.message || error?.error || "Unable to load your applications.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [showToast, token, userId]);

  async function handleWithdraw(application) {
    setWithdrawingId(application.id);

    try {
      await withdrawApplication(application.job?.id, userId, token);
      setApplications((currentApplications) =>
        currentApplications.map((item) =>
          item.id === application.id ? { ...item, status: "WITHDRAWN" } : item,
        ),
      );
      showToast("Application withdrawn successfully.", "success");
    } catch (error) {
      showToast(error?.message || error?.error || "Unable to withdraw the application.", "error");
    } finally {
      setWithdrawingId(null);
    }
  }

  return (
    <main className="page-container applications-page">
      <Toast {...toast} />

      <div className="section-heading">
        <span className="badge chip chip-soft">Jobseeker</span>
        <h1>My Applications</h1>
        <p>Track your latest applications and take action while they are still pending.</p>
      </div>

      {loading ? (
        <div className="applications-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <article className="card application-card skeleton-card" key={index}>
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-chip" />
              <div className="skeleton skeleton-line" />
            </article>
          ))}
        </div>
      ) : null}

      {!loading && sortedApplications.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="You haven't applied to any jobs yet."
          message="Start browsing listings and keep track of every application here."
          actionLabel="Browse Jobs"
          actionTo="/jobs"
        />
      ) : null}

      {!loading && sortedApplications.length > 0 ? (
        <div className="applications-grid">
          {sortedApplications.map((application) => {
            const status = getApplicationStatusMeta(application.status);
            return (
              <article className="card application-card" key={application.id}>
                <div className="application-head">
                  <div>
                    <h2>{application.job?.title || "Untitled role"}</h2>
                    <p>{getCompanyName(application.job)}</p>
                  </div>
                  <span className={`status-pill status-${status.tone}`}>{status.label}</span>
                </div>

                <div className="application-meta">
                  <span>{application.job?.location || "Remote"}</span>
                  <span>{formatJobType(application.job?.jobType)}</span>
                </div>

                <p>Applied on {formatAppliedDate(application.appliedAt)}</p>

                {status.pending ? (
                  <button
                    className="btn-outline"
                    type="button"
                    disabled={withdrawingId === application.id}
                    onClick={() => handleWithdraw(application)}
                  >
                    {withdrawingId === application.id ? <LoadingSpinner label="Withdrawing application" /> : null}
                    {withdrawingId === application.id ? "Withdrawing..." : "Withdraw"}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
