import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const STORAGE_KEY = "ohunter.session.v2";
const ROLE_OPTIONS = [
  { value: "STUDENT_FRESHER", label: "Student Fresher" },
  { value: "STUDENT_EXPERIENCED", label: "Student Experienced" },
  { value: "EMPLOYER", label: "Employer" },
  { value: "ADMIN", label: "Admin" },
];
const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "FREELANCE", "CONTRACT"];
const APPLICATION_STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFERED", "REJECTED", "WITHDRAWN"];

const emptySession = { token: "", user: null };
const emptyLoginForm = { email: "", password: "" };
const emptyRegisterForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  skills: "",
  experienceYears: "0",
  role: "STUDENT_FRESHER",
};
const emptyJobForm = {
  title: "",
  description: "",
  location: "",
  jobType: "FULL_TIME",
  minSalary: "",
  maxSalary: "",
  requiredSkills: "",
  minExperience: "",
  maxExperience: "",
  qualification: "",
  openings: "1",
  deadline: "",
};

function readSession() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : emptySession;
  } catch {
    return emptySession;
  }
}

function currency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Not disclosed";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return "Open";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function labelize(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function byNewest(items, key) {
  return [...items].sort((left, right) => {
    const leftValue = left?.[key] ? new Date(left[key]).getTime() : 0;
    const rightValue = right?.[key] ? new Date(right[key]).getTime() : 0;
    return rightValue - leftValue;
  });
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function AccountStatus({ user }) {
  if (!user) {
    return null;
  }

  const isGuest = user.role === "GUEST";

  return (
    <div className="account-status" aria-label={isGuest ? "Guest mode" : "Logged in account"}>
      <span className={`account-dot ${isGuest ? "account-dot-guest" : "account-dot-user"}`} />
      <div>
        <span>{isGuest ? "Guest mode" : "Logged in"}</span>
        <strong>{isGuest ? "Guest" : user.fullName || user.email || labelize(user.role)}</strong>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [activePanel, setActivePanel] = useState(() => {
    const sessionValue = readSession();
    if (window.location.pathname === "/admin") return "admin";
    return sessionValue && sessionValue.user ? "jobs" : "auth";
  });
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [manualUserId, setManualUserId] = useState("");
  const [notice, setNotice] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [jobFilters, setJobFilters] = useState({ keyword: "", location: "" });
  const [jobMode, setJobMode] = useState("all");
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [coverLetterDrafts, setCoverLetterDrafts] = useState({});
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [employerJobsLoading, setEmployerJobsLoading] = useState(false);
  const [selectedEmployerJobId, setSelectedEmployerJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [postingJob, setPostingJob] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);
  const [adminApplications, setAdminApplications] = useState([]);

  const currentUser = session.user;
  const effectiveUserId = currentUser?.id || toNullableNumber(manualUserId);
  const isStudent = currentUser?.role === "STUDENT_FRESHER" || currentUser?.role === "STUDENT_EXPERIENCED";
  const isEmployer = currentUser?.role === "EMPLOYER";
  const showAuthPanel = !currentUser && activePanel === "auth";
  const applicationMap = useMemo(
    () => new Map(applications.map((application) => [application.job?.id, application])),
    [applications],
  );
  const totalOpenings = useMemo(
    () => jobs.reduce((sum, job) => sum + (job.openings || 0), 0),
    [jobs],
  );
  const totalLocations = useMemo(
    () => new Set(jobs.map((job) => (job.location || "Remote").trim()).filter(Boolean)).size,
    [jobs],
  );
  const latestEmployerJob = useMemo(
    () => employerJobs.find((job) => job.id === selectedEmployerJobId) || employerJobs[0] || null,
    [employerJobs, selectedEmployerJobId],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    // If user navigates to /admin path directly, show the admin panel (will prompt auth if needed)
    if (window.location.pathname === "/admin") {
      setActivePanel("admin");
    }
  }, []);

  useEffect(() => {
    loadJobs("all");
  }, []);

  useEffect(() => {
    if (!session.token || !isStudent || !effectiveUserId) {
      setApplications([]);
      return;
    }

    loadApplications(effectiveUserId);
  }, [effectiveUserId, isStudent, session.token]);

  useEffect(() => {
    if (!session.token || !isEmployer || !effectiveUserId) {
      setEmployerJobs([]);
      setSelectedEmployerJobId(null);
      return;
    }

    loadEmployerJobs(effectiveUserId);
  }, [effectiveUserId, isEmployer, session.token]);

  useEffect(() => {
    if (!session.token || !selectedEmployerJobId || !isEmployer) {
      setApplicants([]);
      return;
    }

    loadApplicants(selectedEmployerJobId);
  }, [isEmployer, selectedEmployerJobId, session.token]);

  async function loadJobs(mode = "all", filtersOverride = jobFilters) {
    const run = jobs.length === 0 ? setJobsLoading : setSearchingJobs;
    run(true);

    try {
      const keyword = filtersOverride.keyword.trim();
      const location = filtersOverride.location.trim().toLowerCase();
      let nextJobs = [];

      if (mode === "fresher") {
        nextJobs = await api.getFresherJobs();
      } else if (keyword) {
        nextJobs = await api.searchJobs(keyword);
      } else if (location) {
        nextJobs = await api.getJobsByLocation(location);
      } else {
        nextJobs = await api.getJobs();
      }

      if (location && (mode === "all" || keyword)) {
        nextJobs = nextJobs.filter((job) => (job.location || "").toLowerCase().includes(location));
      }

      setJobs(byNewest(nextJobs, "createdAt"));
      setJobMode(mode);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to load jobs right now." });
    } finally {
      setJobsLoading(false);
      setSearchingJobs(false);
    }
  }

  async function loadApplications(userId) {
    setApplicationsLoading(true);

    try {
      const items = await api.getMyApplications(userId, session.token);
      setApplications(byNewest(items, "appliedAt"));
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to load your applications." });
    } finally {
      setApplicationsLoading(false);
    }
  }

  async function loadEmployerJobs(employerId) {
    setEmployerJobsLoading(true);

    try {
      const items = byNewest(await api.getEmployerJobs(employerId, session.token), "createdAt");
      setEmployerJobs(items);
      setSelectedEmployerJobId((currentValue) => {
        if (currentValue && items.some((job) => job.id === currentValue)) {
          return currentValue;
        }

        return items[0]?.id || null;
      });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to load your jobs." });
    } finally {
      setEmployerJobsLoading(false);
    }
  }

  async function loadApplicants(jobId) {
    setApplicantsLoading(true);

    try {
      const items = byNewest(await api.getApplicants(jobId, session.token), "appliedAt");
      setApplicants(items);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to load applicants." });
    } finally {
      setApplicantsLoading(false);
    }
  }

  function saveSession(authResponse) {
    const nextSession = {
      token: authResponse.token,
      user: {
        id: authResponse.userId ?? null,
        fullName: authResponse.fullName || "",
        email: authResponse.email || "",
        role: authResponse.role,
      },
    };

    setSession(nextSession);
    setManualUserId(authResponse.userId ? "" : manualUserId);
    if (nextSession.user.role === "EMPLOYER") {
      setActivePanel("employer");
    } else if (nextSession.user.role === "ADMIN") {
      setActivePanel("admin");
      loadAdminData(authResponse.token);
    } else {
      setActivePanel("student");
    }
  }

  function handleSkip() {
    const guest = { token: "", user: { id: null, fullName: "Guest", email: "", role: "GUEST" } };
    setSession(guest);
    setActivePanel("jobs");
    window.history.pushState({}, "", "/");
  }

  async function loadAdminData() {
    setAdminLoading(true);
    try {
      const token = arguments[0] || session.token;
      const [users, jobsList, apps] = await Promise.all([
        api.getAdminUsers(token),
        api.getAdminJobs(token),
        api.getAdminApplications(token),
      ]);

      setAdminUsers(users || []);
      setAdminJobs(jobsList || []);
      setAdminApplications(apps || []);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to load admin data." });
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSubmittingAuth(true);

    try {
      const payload = await api.login(loginForm);
      saveSession(payload);
      setLoginForm(emptyLoginForm);
      setNotice({ type: "success", text: payload.message || "Login successful." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Login failed." });
    } finally {
      setSubmittingAuth(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setSubmittingAuth(true);

    try {
      const payload = await api.register({
        ...registerForm,
        experienceYears: toNullableNumber(registerForm.experienceYears) ?? 0,
      });

      saveSession(payload);
      setRegisterForm(emptyRegisterForm);
      setNotice({ type: "success", text: payload.message || "Registration successful." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Registration failed." });
    } finally {
      setSubmittingAuth(false);
    }
  }

  function handleLogout() {
    setSession(emptySession);
    setManualUserId("");
    setApplications([]);
    setEmployerJobs([]);
    setApplicants([]);
    setApplyingJobId(null);
    setActivePanel("jobs");
    setNotice({ type: "success", text: "You have been logged out." });
  }

  async function handleApply(job) {
    if (!session.token) {
      setActivePanel("auth");
      setNotice({ type: "error", text: "Log in as a student account to apply." });
      return;
    }

    if (!isStudent) {
      setNotice({ type: "error", text: "Only student accounts can apply for jobs." });
      return;
    }

    if (!effectiveUserId) {
      setNotice({
        type: "error",
        text: "Your backend user ID is missing. Enter it in the student panel to unlock applications.",
      });
      setActivePanel("student");
      return;
    }

    try {
      await api.applyForJob(job.id, effectiveUserId, coverLetterDrafts[job.id] || "", session.token);
      setApplyingJobId(null);
      setCoverLetterDrafts((currentValue) => ({ ...currentValue, [job.id]: "" }));
      setNotice({ type: "success", text: `Application sent for ${job.title}.` });
      await loadApplications(effectiveUserId);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to submit application." });
    }
  }

  async function handleWithdraw(jobId) {
    if (!effectiveUserId || !jobId) {
      return;
    }

    if (!window.confirm("Withdraw this application?")) {
      return;
    }

    try {
      await api.withdrawApplication(effectiveUserId, jobId, session.token);
      setNotice({ type: "success", text: "Application withdrawn." });
      await loadApplications(effectiveUserId);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to withdraw application." });
    }
  }

  async function handlePostJob(event) {
    event.preventDefault();

    if (!effectiveUserId) {
      setNotice({ type: "error", text: "Your employer user ID is missing. Add it below to post jobs." });
      return;
    }

    setPostingJob(true);

    try {
      await api.createJob(
        {
          title: jobForm.title,
          description: jobForm.description,
          location: jobForm.location,
          jobType: jobForm.jobType,
          minSalary: toNullableNumber(jobForm.minSalary),
          maxSalary: toNullableNumber(jobForm.maxSalary),
          requiredSkills: jobForm.requiredSkills,
          minExperience: toNullableNumber(jobForm.minExperience),
          maxExperience: toNullableNumber(jobForm.maxExperience),
          qualification: jobForm.qualification,
          openings: toNullableNumber(jobForm.openings),
          deadline: jobForm.deadline || null,
          active: true,
        },
        effectiveUserId,
        session.token,
      );
      setJobForm(emptyJobForm);
      setNotice({ type: "success", text: "Job posted successfully." });
      await Promise.all([loadEmployerJobs(effectiveUserId), loadJobs("all")]);
      setActivePanel("employer");
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to post job." });
    } finally {
      setPostingJob(false);
    }
  }

  async function handleDeleteJob(jobId) {
    if (!window.confirm("Archive this job listing?")) {
      return;
    }

    try {
      await api.deleteJob(jobId, session.token);
      setNotice({ type: "success", text: "Job archived successfully." });
      await Promise.all([loadEmployerJobs(effectiveUserId), loadJobs("all")]);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to delete the job." });
    }
  }

  async function handleStatusChange(applicationId, status) {
    try {
      await api.updateApplicationStatus(applicationId, status, session.token);
      setNotice({ type: "success", text: `Application moved to ${labelize(status)}.` });
      await loadApplicants(selectedEmployerJobId);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to update application status." });
    }
  }

  if (!currentUser && activePanel === "auth") {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">OHunter hiring workspace</span>
            <h1>OHunter</h1>
          </div>
        </header>

        <main className="auth-only-main">
          <section className="panel panel-focus auth-panel">
            <div className="panel-header">
              <div>
                <span className="section-tag">Auth</span>
                <h3>Join OHunter Today</h3>
              </div>
              <p>Access your personalized dashboard, applications, and career opportunities securely.</p>
            </div>

            <div className="toggle-row">
              <button
                className={authMode === "login" ? "button button-primary" : "button button-ghost"}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "button button-primary" : "button button-ghost"}
                onClick={() => setAuthMode("register")}
                type="button"
              >
                Register
              </button>
            </div>

            {authMode === "login" ? (
              <form className="stack-form" onSubmit={handleLogin}>
                <Field
                  label="Email"
                  input={
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((currentValue) => ({ ...currentValue, email: event.target.value }))
                      }
                      required
                    />
                  }
                />
                <Field
                  label="Password"
                  input={
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((currentValue) => ({ ...currentValue, password: event.target.value }))
                      }
                      required
                    />
                  }
                />
                <button className="button button-primary" disabled={submittingAuth} type="submit">
                  {submittingAuth ? "Signing in..." : "Sign in"}
                </button>
              </form>
            ) : (
              <form className="stack-form" onSubmit={handleRegister}>
                <div className="form-grid">
                  <Field
                    label="Full name"
                    input={
                      <input
                        value={registerForm.fullName}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, fullName: event.target.value }))
                        }
                        required
                      />
                    }
                  />
                  <Field
                    label="Email"
                    input={
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, email: event.target.value }))
                        }
                        required
                      />
                    }
                  />
                  <Field
                    label="Password"
                    input={
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, password: event.target.value }))
                        }
                        minLength="6"
                        required
                      />
                    }
                  />
                  <Field
                    label="Phone"
                    input={
                      <input
                        value={registerForm.phone}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, phone: event.target.value }))
                        }
                        placeholder="9876543210"
                      />
                    }
                  />
                  <Field
                    label="City"
                    input={
                      <input
                        value={registerForm.city}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, city: event.target.value }))
                        }
                      />
                    }
                  />
                  <Field
                    label="Role"
                    input={
                      <select
                        value={registerForm.role}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, role: event.target.value }))
                        }
                        required
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label="Skills"
                    input={
                      <input
                        value={registerForm.skills}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, skills: event.target.value }))
                        }
                        placeholder="Java, SQL, React"
                      />
                    }
                  />
                  <Field
                    label="Experience years"
                    input={
                      <input
                        type="number"
                        min="0"
                        value={registerForm.experienceYears}
                        onChange={(event) =>
                          setRegisterForm((currentValue) => ({ ...currentValue, experienceYears: event.target.value }))
                        }
                      />
                    }
                  />
                </div>
                <button className="button button-primary" disabled={submittingAuth} type="submit">
                  {submittingAuth ? "Creating account..." : "Create account"}
                </button>
              </form>
            )}

            <div className="auth-actions">
              <button className="button button-ghost" onClick={handleSkip} type="button">
                Skip for now
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <header className="topbar">
        <div>
          <span className="eyebrow">OHunter hiring workspace</span>
          <h1>OHunter</h1>
        </div>

        <nav className="nav-actions">
          <AccountStatus user={currentUser} />
          <button
            className={activePanel === "jobs" ? "button button-primary" : "button button-ghost"}
            onClick={() => setActivePanel("jobs")}
            type="button"
          >
            Explore jobs
          </button>
          {currentUser?.role === "ADMIN" && (
            <button
              className={activePanel === "admin" ? "button button-primary" : "button button-ghost"}
              onClick={() => {
                window.history.pushState({}, "", "/admin");
                setActivePanel("admin");
                loadAdminData();
              }}
              type="button"
            >
              Admin panel
            </button>
          )}
          {isStudent && (
            <button
              className={activePanel === "student" ? "button button-primary" : "button button-ghost"}
              onClick={() => setActivePanel("student")}
              type="button"
            >
              Student hub
            </button>
          )}
          {isEmployer && (
            <button
              className={activePanel === "employer" ? "button button-primary" : "button button-ghost"}
              onClick={() => setActivePanel("employer")}
              type="button"
            >
              Employer hub
            </button>
          )}
          {currentUser ? (
            <button className="button button-ghost" onClick={handleLogout} type="button">
              Log out
            </button>
          ) : (
            <button
              className={activePanel === "auth" ? "button button-primary" : "button button-ghost"}
              onClick={() => {
                setAuthMode("login");
                setActivePanel("auth");
              }}
              type="button"
            >
              Sign in
            </button>
          )}
        </nav>
      </header>

      {!(!currentUser && activePanel === "auth") && (
        <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">Explore thousands of opportunities from trusted companies and apply with ease.</span>
          <h2>Find Your Dream Job</h2>
          <p>
           Discover opportunities, apply seamlessly, and manage hiring workflows from one modern platform.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setActivePanel("jobs")} type="button">
              Browse live jobs
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                setAuthMode("register");
                setActivePanel("auth");
              }}
              type="button"
            >
              {currentUser ? "Open workspace" : "Create account"}
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <Metric
            label="Active roles"
            value={jobs.length}
            detail={jobMode === "fresher" ? "Fresher filter active" : "Across your backend feed"}
          />
          <Metric label="Total openings" value={totalOpenings} detail="Summed from current listings" />
          <Metric label="Hiring cities" value={totalLocations} detail="Remote and onsite combined" />
        </div>
      </section>

      {notice && (
        <div className={`toast toast-${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      <main className="workspace">
        <section className={`panel ${activePanel === "jobs" ? "panel-focus" : ""}`}>
          <div className="panel-header">
            <div>
              <span className="section-tag">Job board</span>
              <h3>Find exciting career opportunities from companies hiring right now.</h3>
            </div>
            <p>Filter jobs by skills, location, and experience level to find the perfect match.</p>
          </div>

          <form
            className="filters"
            onSubmit={(event) => {
              event.preventDefault();
              loadJobs("all");
            }}
          >
            <Field
              label="Job title or skill"
              input={
                <input
                  value={jobFilters.keyword}
                  onChange={(event) =>
                  setJobFilters((currentValue) => ({ ...currentValue, keyword: event.target.value }))
                  }
                  placeholder="Role, company, or skill (e.g. 'Java','python', 'Product manager', 'Google')"
                />
              }
            />
            <Field
              label="Preferred location"
              input={
                <input
                  value={jobFilters.location}
                  onChange={(event) =>
                  setJobFilters((currentValue) => ({ ...currentValue, location: event.target.value }))
                  }
                  placeholder="City, state, or remote (e.g. 'Bangalore', 'Remote')"
                />
              }
            />

            <div className="filter-actions">
              <button className="button button-primary" disabled={searchingJobs} type="submit">
                {searchingJobs ? "Searching..." : "Search"}
              </button>
              <button className="button button-secondary" onClick={() => loadJobs("fresher")} type="button">
                Fresher roles
              </button>
              <button
                className="button button-ghost"
                onClick={() => {
                  const clearedFilters = { keyword: "", location: "" };
                  setJobFilters(clearedFilters);
                  loadJobs("all", clearedFilters);
                }}
                type="button"
              >
                Reset
              </button>
            </div>
          </form>

          {jobsLoading ? (
            <Loader label="Loading jobs from the backend..." />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No jobs match this view yet."
              description="Try a broader keyword, reset the filters, or post a new role from the employer workspace."
            />
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => {
                const myApplication = applicationMap.get(job.id);
                const isApplied = Boolean(myApplication);

                return (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <div>
                        <span className="job-badge">{labelize(job.jobType || "OPEN")}</span>
                        <h4>{job.title}</h4>
                        <p className="job-company">{job.company?.name || "Independent employer listing"}</p>
                      </div>
                      {isApplied && <StatusPill status={myApplication.status} />}
                    </div>

                    <p className="job-description">{job.description || "No description provided yet."}</p>

                    <div className="job-meta">
                      <MetaItem label="Location" value={job.location || "Remote / flexible"} />
                      <MetaItem
                        label="Salary"
                        value={
                          job.minSalary || job.maxSalary
                            ? `${currency(job.minSalary)} - ${currency(job.maxSalary)}`
                            : "Not disclosed"
                        }
                      />
                      <MetaItem
                        label="Experience"
                        value={
                          job.minExperience !== null && job.minExperience !== undefined
                            ? `${job.minExperience} - ${job.maxExperience ?? job.minExperience}+ years`
                            : "Open"
                        }
                      />
                      <MetaItem label="Deadline" value={formatDate(job.deadline)} />
                    </div>

                    <div className="skill-row">
                      {(job.requiredSkills || "Skills to be discussed")
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                        .slice(0, 5)
                        .map((skill) => (
                          <span className="chip" key={`${job.id}-${skill}`}>
                            {skill}
                          </span>
                        ))}
                    </div>

                    {isStudent && (
                      <div className="job-actions">
                        {isApplied ? (
                          <>
                            <button className="button button-secondary" type="button" disabled>
                              Already applied
                            </button>
                            <button className="button button-ghost" onClick={() => handleWithdraw(job.id)} type="button">
                              Withdraw
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="button button-primary"
                              onClick={() => setApplyingJobId((currentValue) => (currentValue === job.id ? null : job.id))}
                              type="button"
                            >
                              {applyingJobId === job.id ? "Close application" : "Apply now"}
                            </button>
                            <button className="button button-ghost" onClick={() => setActivePanel("student")} type="button">
                              Track status
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {!currentUser && (
                      <button className="button button-primary" onClick={() => setActivePanel("auth")} type="button">
                        Sign in to apply
                      </button>
                    )}

                    {applyingJobId === job.id && !isApplied && (
                      <div className="application-box">
                        <label>
                          Cover letter
                          <textarea
                            rows="4"
                            value={coverLetterDrafts[job.id] || ""}
                            onChange={(event) =>
                              setCoverLetterDrafts((currentValue) => ({
                                ...currentValue,
                                [job.id]: event.target.value,
                              }))
                            }
                            placeholder="Share why you're a strong fit for this role."
                          />
                        </label>
                        <button className="button button-primary" onClick={() => handleApply(job)} type="button">
                          Submit application
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

                <aside className="sidebar">
          {!currentUser && !showAuthPanel && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <span className="section-tag">Auth</span>
                  <h3>Sign in or create an account when you are ready.</h3>
                </div>
                <p>The full login form stays out of the way until you open it.</p>
              </div>

              <div className="toggle-row">
                <button className="button button-primary" onClick={() => setActivePanel("auth")} type="button">
                  Sign in
                </button>
                <button className="button button-ghost" onClick={() => setActivePanel("auth")} type="button">
                  Register
                </button>
              </div>
            </section>
          )}

          {showAuthPanel && (
            <section className="panel panel-focus">
              <div className="panel-header">
                <div>
                  <span className="section-tag">Auth</span>
                  <h3>Join OHunter Today</h3>
                </div>
                <p>Access your personalized dashboard, applications, and career opportunities securely.</p>
              </div>

              <div className="toggle-row">
                <button
                  className={authMode === "login" ? "button button-primary" : "button button-ghost"}
                  onClick={() => setAuthMode("login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={authMode === "register" ? "button button-primary" : "button button-ghost"}
                  onClick={() => setAuthMode("register")}
                  type="button"
                >
                  Register
                </button>
              </div>

              {/* Skip button moved below forms */}

              {authMode === "login" ? (
                <form className="stack-form" onSubmit={handleLogin}>
                  <Field
                    label="Email"
                    input={
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(event) =>
                          setLoginForm((currentValue) => ({ ...currentValue, email: event.target.value }))
                        }
                        required
                      />
                    }
                  />
                  <Field
                    label="Password"
                    input={
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) =>
                          setLoginForm((currentValue) => ({ ...currentValue, password: event.target.value }))
                        }
                        required
                      />
                    }
                  />
                  <button className="button button-primary" disabled={submittingAuth} type="submit">
                    {submittingAuth ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              ) : (
                <form className="stack-form" onSubmit={handleRegister}>
                  <div className="form-grid">
                    <Field
                      label="Full name"
                      input={
                        <input
                          value={registerForm.fullName}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              fullName: event.target.value,
                            }))
                          }
                          required
                        />
                      }
                    />
                    <Field
                      label="Email"
                      input={
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              email: event.target.value,
                            }))
                          }
                          required
                        />
                      }
                    />
                    <Field
                      label="Password"
                      input={
                        <input
                          type="password"
                          value={registerForm.password}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              password: event.target.value,
                            }))
                          }
                          minLength="6"
                          required
                        />
                      }
                    />
                    <Field
                      label="Phone"
                      input={
                        <input
                          value={registerForm.phone}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="9876543210"
                        />
                      }
                    />
                    <Field
                      label="City"
                      input={
                        <input
                          value={registerForm.city}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              city: event.target.value,
                            }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Role"
                      input={
                        <select
                          value={registerForm.role}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              role: event.target.value,
                            }))
                          }
                          required
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      }
                    />
                    <Field
                      label="Skills"
                      input={
                        <input
                          value={registerForm.skills}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              skills: event.target.value,
                            }))
                          }
                          placeholder="Java, SQL, React"
                        />
                      }
                    />
                    <Field
                      label="Experience years"
                      input={
                        <input
                          type="number"
                          min="0"
                          value={registerForm.experienceYears}
                          onChange={(event) =>
                            setRegisterForm((currentValue) => ({
                              ...currentValue,
                              experienceYears: event.target.value,
                            }))
                          }
                        />
                      }
                    />
                  </div>
                  <button className="button button-primary" disabled={submittingAuth} type="submit">
                    {submittingAuth ? "Creating account..." : "Create account"}
                  </button>
                </form>
              )}

              <div className="auth-actions">
                <button className="button button-ghost" onClick={handleSkip} type="button">
                  Skip for now
                </button>
              </div>
            </section>
          )}

          {isStudent && (
            <section className={`panel ${activePanel === "student" ? "panel-focus" : ""}`}>
              <div className="panel-header">
                <div>
                  <span className="section-tag">Student hub</span>
                  <h3>Applications from `/api/applications/my/{'{userId}'}`</h3>
                </div>
                <p>Review your latest applications and current backend status.</p>
              </div>

              {applicationsLoading ? (
                <Loader label="Loading your applications..." />
              ) : applications.length === 0 ? (
                <EmptyState
                  title="No applications yet."
                  description="Apply to a role from the job board and it will show up here."
                />
              ) : (
                <div className="stack-list">
                  {applications.map((application) => (
                    <article className="info-card" key={application.id}>
                      <div className="split-row">
                        <div>
                          <h4>{application.job?.title || "Untitled job"}</h4>
                          <p>{application.job?.company?.name || application.job?.location || "OHunter listing"}</p>
                        </div>
                        <StatusPill status={application.status} />
                      </div>
                      <p className="muted">
                        Applied on {formatDate(application.appliedAt)}.
                        {application.coverLetter ? " Cover letter saved." : " No cover letter attached."}
                      </p>
                      {application.status !== "WITHDRAWN" && (
                        <button
                          className="button button-ghost"
                          onClick={() => handleWithdraw(application.job?.id)}
                          type="button"
                        >
                          Withdraw application
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {isEmployer && (
            <>
              <section className={`panel ${activePanel === "employer" ? "panel-focus" : ""}`}>
                <div className="panel-header">
                  <div>
                    <span className="section-tag">Employer hub</span>
                    <h3>Create a new job opening...</h3>
                  </div>
                  <p>Create job openings and attract qualified candidates</p>
                </div>

                <form className="stack-form" onSubmit={handlePostJob}>
                  <div className="form-grid">
                    <Field
                      label="Job title"
                      input={
                        <input
                          value={jobForm.title}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, title: event.target.value }))
                          }
                          required
                        />
                      }
                    />
                    <Field
                      label="Job type"
                      input={
                        <select
                          value={jobForm.jobType}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, jobType: event.target.value }))
                          }
                          required
                        >
                          {JOB_TYPES.map((jobType) => (
                            <option key={jobType} value={jobType}>
                              {labelize(jobType)}
                            </option>
                          ))}
                        </select>
                      }
                    />
                    <Field
                      label="Location"
                      input={
                        <input
                          value={jobForm.location}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, location: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Qualification"
                      input={
                        <input
                          value={jobForm.qualification}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, qualification: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Minimum salary"
                      input={
                        <input
                          type="number"
                          min="0"
                          value={jobForm.minSalary}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, minSalary: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Maximum salary"
                      input={
                        <input
                          type="number"
                          min="0"
                          value={jobForm.maxSalary}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, maxSalary: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Min experience"
                      input={
                        <input
                          type="number"
                          min="0"
                          value={jobForm.minExperience}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, minExperience: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Max experience"
                      input={
                        <input
                          type="number"
                          min="0"
                          value={jobForm.maxExperience}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, maxExperience: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Openings"
                      input={
                        <input
                          type="number"
                          min="1"
                          value={jobForm.openings}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, openings: event.target.value }))
                          }
                        />
                      }
                    />
                    <Field
                      label="Deadline"
                      input={
                        <input
                          type="date"
                          value={jobForm.deadline}
                          onChange={(event) =>
                            setJobForm((currentValue) => ({ ...currentValue, deadline: event.target.value }))
                          }
                        />
                      }
                    />
                  </div>

                  <Field
                    label="Required skills"
                    input={
                      <input
                        value={jobForm.requiredSkills}
                        onChange={(event) =>
                          setJobForm((currentValue) => ({ ...currentValue, requiredSkills: event.target.value }))
                        }
                        placeholder="Java, Spring Boot, MySQL"
                      />
                    }
                  />
                  <Field
                    label="Job description"
                    input={
                      <textarea
                        rows="5"
                        value={jobForm.description}
                        onChange={(event) =>
                          setJobForm((currentValue) => ({ ...currentValue, description: event.target.value }))
                        }
                        required
                      />
                    }
                  />

                  <button className="button button-primary" disabled={postingJob} type="submit">
                    {postingJob ? "Publishing..." : "Post job"}
                  </button>
                </form>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <span className="section-tag">Employer feed</span>
                    <h3>Your active jobs and applicants.</h3>
                  </div>
                  <p>Manage your posted jobs and track applicants in one place</p>
                </div>

                {employerJobsLoading ? (
                  <Loader label="Loading your job postings..." />
                ) : employerJobs.length === 0 ? (
                  <EmptyState
                    title="No jobs posted yet."
                    description="Publish your first role above and applicants will appear here."
                  />
                ) : (
                  <div className="stack-list">
                    {employerJobs.map((job) => (
                      <article
                        className={`info-card clickable ${selectedEmployerJobId === job.id ? "selected" : ""}`}
                        key={job.id}
                        onClick={() => setSelectedEmployerJobId(job.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            setSelectedEmployerJobId(job.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="split-row">
                          <div>
                            <h4>{job.title}</h4>
                            <p>
                              {job.location || "Flexible"} | {labelize(job.jobType)}
                            </p>
                          </div>
                          <span className="chip">{job.openings || 0} openings</span>
                        </div>
                        <div className="job-inline-actions">
                          <button
                            className="button button-ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            type="button"
                          >
                            Archive
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <div className="applicant-panel">
                  <div className="split-row">
                    <div>
                      <h4>{latestEmployerJob ? latestEmployerJob.title : "Select a job to inspect applicants"}</h4>
                      <p className="muted">
                        {latestEmployerJob
                          ? `Applicants for ${latestEmployerJob.location || "your selected role"}`
                          : "Once a job is selected, applicant details will load here."}
                      </p>
                    </div>
                    {latestEmployerJob && <span className="chip">{applicants.length} applicants</span>}
                  </div>

                  {applicantsLoading ? (
                    <Loader label="Loading applicants..." />
                  ) : applicants.length === 0 ? (
                    <EmptyState
                      title="No applicants yet."
                      description="Keep this panel open and status updates will reflect the backend responses."
                    />
                  ) : (
                    <div className="stack-list">
                      {applicants.map((application) => (
                        <article className="info-card" key={application.id}>
                          <div className="split-row">
                            <div>
                              <h4>{application.user?.fullName || "Applicant"}</h4>
                              <p>{application.user?.email || "Email unavailable"}</p>
                            </div>
                            <StatusPill status={application.status} />
                          </div>
                          <p className="muted">
                            {application.user?.skills || "Skills not provided"} |{" "}
                            {application.user?.experienceYears ?? 0} years experience
                          </p>
                          <p className="cover-note">
                            {application.coverLetter || "No cover letter submitted for this application."}
                          </p>
                          <label className="status-control">
                            Update status
                            <select
                              value={application.status}
                              onChange={(event) => handleStatusChange(application.id, event.target.value)}
                            >
                              <option value={application.status}>{labelize(application.status)}</option>
                              {APPLICATION_STATUSES.filter((status) => status !== application.status).map((status) => (
                                <option key={`${application.id}-${status}`} value={status}>
                                  {labelize(status)}
                                </option>
                              ))}
                            </select>
                          </label>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

        {activePanel === "admin" && (
          <section className="panel panel-focus">
            <div className="panel-header">
              <div>
                <span className="section-tag">Admin</span>
                <h3>Administration console</h3>
              </div>
              <p>Overview of users, jobs and applications (requires ADMIN token).</p>
            </div>

            {adminLoading ? (
              <Loader label="Loading admin data..." />
            ) : (
              <div>
                <div className="stack-list">
                  <article className="info-card">
                    <h4>Users ({adminUsers.length})</h4>
                    <div className="muted">
                      {adminUsers.slice(0, 10).map((u) => (
                        <div key={u.id}>{u.fullName} — {u.email} — {u.role}</div>
                      ))}
                    </div>
                  </article>

                  <article className="info-card">
                    <h4>Jobs ({adminJobs.length})</h4>
                    <div className="muted">
                      {adminJobs.slice(0, 10).map((j) => (
                        <div key={j.id}>{j.title} — {j.location}</div>
                      ))}
                    </div>
                  </article>

                  <article className="info-card">
                    <h4>Applications ({adminApplications.length})</h4>
                    <div className="muted">
                      {adminApplications.slice(0, 10).map((a) => (
                        <div key={a.id}>{a.user?.fullName || a.user?.email} — {a.job?.title}</div>
                      ))}
                    </div>
                  </article>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="button button-ghost" onClick={loadAdminData} type="button">
                    Refresh admin data
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
        </aside>
      </main>
      </>
      )}
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Field({ label, input }) {
  return (
    <label className="field">
      <span>{label}</span>
      {input}
    </label>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Loader({ label }) {
  return (
    <div className="loader">
      <span className="loader-dot" />
      <p>{label}</p>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "pending").toLowerCase().replaceAll("_", "-");
  return <span className={`status-pill status-${normalized}`}>{labelize(status)}</span>;
}
