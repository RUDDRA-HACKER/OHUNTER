const API_BASE = "";

function buildQuery(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

async function request(path, options = {}) {
  const storedAuth = JSON.parse(localStorage.getItem("ohunter.auth") || "{}");
  const token = options.token || storedAuth.token || "";
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}/api${path}${buildQuery(options.query)}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw payload;
  }

  return payload;
}

// Auth
export function registerUser(data) {
  return request("/auth/register", { method: "POST", body: data });
}

export function loginUser(data) {
  return request("/auth/login", { method: "POST", body: data });
}

// Jobs
export function getAllJobs() {
  return request("/jobs");
}

export function searchJobs(keyword) {
  return request("/jobs/search", { query: { keyword } });
}

export function filterByLocation(loc) {
  return request("/jobs/location", { query: { loc } });
}

export function getFresherJobs() {
  return request("/jobs", { query: { fresher: true } });
}

export function createJob(data, token) {
  return request("/jobs", { method: "POST", body: data, token });
}

export function updateJob(id, data, token) {
  return request(`/jobs/${id}`, { method: "PUT", body: data, token });
}

export function deleteJob(id, token) {
  return request(`/jobs/${id}`, { method: "DELETE", token });
}

// Applications
export function applyToJob(jobId, userId, token) {
  return request(`/applications/apply/${jobId}`, { method: "POST", query: { userId }, token });
}

export function getMyApplications(userId, token) {
  return request(`/applications/my/${userId}`, { token });
}

export function updateApplicationStatus(id, status, token) {
  return request(`/applications/${id}/status`, { method: "PUT", query: { status }, token });
}
