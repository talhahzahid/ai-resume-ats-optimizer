const BASE = "https://ai-resume-ats-optimizer.onrender.com/api/v1";

/**
 * Upload a resume PDF.
 * POST /api/v1/upload
 * Response shape: { text: { resumeId, status } }
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("pdf", file);

  const res = await fetch(`${BASE}/upload`, { method: "POST", body: formData });
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.detail || payload?.message || "Upload failed. Please try again.");
  }

  const resumeId = payload?.text?.resumeId;
  if (!resumeId) throw new Error("Upload succeeded but no resumeId was returned.");

  return { resumeId, status: payload?.text?.status ?? "processing" };
}

/**
 * Poll resume status.
 * GET /api/v1/resume/{resumeId}/status
 *
 * Actual response shape:
 * {
 *   "success": true,
 *   "data": {
 *     "resumeId": 3,
 *     "status": "processing" | "completed" | "failed",
 *     "ats_score": { "score": 85, "breakdown": { ... } },
 *     "suggestions": [ { id, category, priority, issue, suggestion,
 *                        original_text, improved_text, ... } ]
 *   }
 * }
 *
 * Returns the inner `data` object so callers read:
 *   result.status / result.ats_score / result.suggestions
 */
export async function getResumeStatus(resumeId) {
  const res = await fetch(`${BASE}/resume/${resumeId}/status`);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      payload?.detail || payload?.message || "Failed to fetch analysis status."
    );
  }

  // Unwrap the { success, data } envelope.
  // If the API ever returns the flat shape directly, fall back gracefully.
  return payload?.data ?? payload;
}
