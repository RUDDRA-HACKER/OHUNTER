const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}

function getErrorMessage(payload, fallback) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    return payload.error || payload.message || fallback;
  }

  return fallback;
}

async function request(path, options = {}) {
  const { body, token, query, headers, ...rest } = options;
  const requestHeaders = new Headers(headers || {});

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload;
}

export const api = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
  getJobs() {
    return request("/jobs");
  },
  searchJobs(keyword) {
    return request("/jobs/search", {
      query: { keyword },
    });
  },
  getJobsByLocation(city) {
    return request("/jobs/location", {
      query: { city },
    });
  },
  getFresherJobs() {
    return request("/jobs/fresher");
  },
  createJob(job, employerId, token) {
    return request("/jobs", {
      method: "POST",
      token,
      query: { employerId },
      body: job,
    });
  },
  getEmployerJobs(employerId, token) {
    return request(`/jobs/employer/${employerId}`, {
      token,
    });
  },
  deleteJob(jobId, token) {
    return request(`/jobs/${jobId}`, {
      method: "DELETE",
      token,
    });
  },
  applyForJob(jobId, userId, coverLetter, token) {
    return request(`/applications/apply/${jobId}`, {
      method: "POST",
      token,
      query: {
        userId,
        coverLetter,
      },
    });
  },
  getMyApplications(userId, token) {
    return request(`/applications/my/${userId}`, {
      token,
    });
  },
  withdrawApplication(userId, jobId, token) {
    return request("/applications/withdraw", {
      method: "DELETE",
      token,
      query: { userId, jobId },
    });
  },
  getApplicants(jobId, token) {
    return request(`/applications/job/${jobId}`, {
      token,
    });
  },
  updateApplicationStatus(applicationId, status, token) {
    return request(`/applications/${applicationId}/status`, {
      method: "PUT",
      token,
      query: { status },
    });
  },
};
