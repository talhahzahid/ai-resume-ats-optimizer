const BASE =
  import.meta.env.VITE_API_URL ||
  "https://ai-resume-ats-optimizer.onrender.com/api/v1";

// const BASE =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:8000/api/v1";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
  });
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      payload?.message || payload?.detail || `Request failed (${res.status})`
    );
  }

  return payload;
}

/**
 * Upload a resume PDF.
 * POST /api/v1/upload
 */
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

/**
 * Poll resume status.
 * GET /api/v1/resume/{resumeId}/status
 */
export async function getResumeStatus(resumeId) {
  const payload = await apiFetch(`/resume/${resumeId}/status`);
  return payload?.data ?? payload;
}

/**
 * List resumes for this browser session (paginated).
 * GET /api/v1/resumes?page=1&limit=10
 */
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

/**
 * Full resume detail (analysis + suggestions).
 * GET /api/v1/resume/{id}
 */
export async function getResumeById(resumeId) {
  const payload = await apiFetch(`/resume/${resumeId}`);
  return payload?.data ?? payload;
}

/**
 * Delete a resume owned by this session.
 * DELETE /api/v1/resume/{id}
 */
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

/** Map API list item → UI history row */
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
