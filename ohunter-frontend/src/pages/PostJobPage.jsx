import { useState } from "react";
import JobFormFields from "../components/JobFormFields";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { createJob } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { normalizeJobForm, toJobPayload, validateJobForm } from "../utils/jobUtils";

export default function PostJobPage() {
  const { token, userId } = useAuth();
  const { toast, showToast } = useToast();
  const [form, setForm] = useState(normalizeJobForm());
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateJobForm(form);
    if (validationMessage) {
      showToast(validationMessage, "error");
      return;
    }

    setSubmitting(true);

    try {
      await createJob(toJobPayload(form), token, userId);
      setForm(normalizeJobForm());
      showToast("Job posted successfully!", "success");
    } catch (error) {
      showToast(error?.message || error?.error || "Unable to post the job.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-container form-page">
      <Toast {...toast} />

      <section className="card form-card">
        <div className="section-heading">
          <span className="badge chip chip-soft">Employer</span>
          <h1>Post a New Job</h1>
          <p>Create a clean, searchable listing for jobseekers.</p>
        </div>

        <form className="job-post-form" onSubmit={handleSubmit}>
          <JobFormFields form={form} onChange={handleChange} disabled={submitting} />

          <button className="btn-primary submit-button" type="submit" disabled={submitting}>
            {submitting ? <LoadingSpinner label="Posting job" /> : null}
            {submitting ? "Submitting..." : "Submit Job"}
          </button>
        </form>
      </section>
    </main>
  );
}
