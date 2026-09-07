const BASE =
  import.meta.env.VITE_API_URL ||
  "https://ai-resume-ats-optimizer.onrender.com/api/v1";

// const BASE =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:8000/api/v1";

const TOKEN_KEY = "ats_token";
const USER_KEY = "ats_user";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem("ats_session_id");
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("ats_session_id");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const { headers: optionHeaders, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(optionHeaders || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const payload = await res.json().catch(() => null);

  if (res.status === 401 && !path.startsWith("/auth/")) {
    clearAuth();
    window.dispatchEvent(new Event("auth:logout"));
  }

  if (!res.ok) {
    throw new Error(
      payload?.message || payload?.detail || `Request failed (${res.status})`
    );
  }

  return payload;
}

export async function registerUser({ name, email, password }) {
  const payload = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = payload?.data;
  if (!data?.token || !data?.user) throw new Error("Register failed");
  setAuth(data.token, data.user);
  return data.user;
}

export async function loginUser({ email, password }) {
  const payload = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = payload?.data;
  if (!data?.token || !data?.user) throw new Error("Login failed");
  setAuth(data.token, data.user);
  return data.user;
}

export async function getMe() {
  const payload = await apiFetch("/auth/me");
  return payload?.data?.user ?? null;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("pdf", file);

  const payload = await apiFetch("/upload", {
    method: "POST",
    body: formData,
  });

  const resumeId = payload?.data?.resumeId ?? payload?.text?.resumeId;
  if (!resumeId) throw new Error("Upload succeeded but no resumeId was returned.");

  return {
    resumeId,
    status: payload?.data?.status ?? payload?.text?.status ?? "processing",
  };
}

export async function getResumeStatus(resumeId) {
  const payload = await apiFetch(`/resume/${resumeId}/status`);
  return payload?.data ?? payload;
}

export async function getResumes({ page = 1, limit = 10 } = {}) {
  const payload = await apiFetch(`/resumes?page=${page}&limit=${limit}`);
  return {
    items: payload?.items ?? [],
    pagination: payload?.pagination ?? {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
    stats: payload?.stats ?? {
      total: 0,
      completed: 0,
      averageScore: null,
      latestScore: null,
    },
  };
}

export async function getResumeById(resumeId) {
  const payload = await apiFetch(`/resume/${resumeId}`);
  return payload?.data ?? payload;
}

export async function deleteResume(resumeId) {
  const payload = await apiFetch(`/resume/${resumeId}`, { method: "DELETE" });
  return payload?.data ?? payload;
}

export function formatResumeDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function mapResumeItem(r) {
  return {
    id: r.resumeId,
    name: r.fileName,
    date: formatResumeDate(r.createdAt),
    score: typeof r.atsScore === "number" ? r.atsScore : null,
    status: r.status,
    createdAt: r.createdAt,
  };
}

export function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}
