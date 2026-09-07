import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "./components/layout/Sidebar.jsx";
import MobileTopBar from "./components/layout/MobileTopBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import Analyzing from "./pages/Analyzing.jsx";
import Results from "./pages/Results.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import Resumes from "./pages/Resumes.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import {
  getResumes,
  getResumeById,
  deleteResume,
  mapResumeItem,
  getToken,
  getStoredUser,
  getMe,
  clearAuth,
} from "./services/api.js";

export default function App() {
  // "login" | "register"
  const [authScreen, setAuthScreen] = useState("login");

  const [user, setUser]               = useState(() => getToken() ? getStoredUser() : null);
  const [authChecking, setAuthChecking] = useState(() => Boolean(getToken()));

  const [page, setPage]         = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [history, setHistory]   = useState([]);
  const [stats, setStats]       = useState({ total: 0, completed: 0, averageScore: null, latestScore: null });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError,   setHistoryError]   = useState("");

  const [pendingFile,        setPendingFile]        = useState(null);
  const [currentAnalysis,    setCurrentAnalysis]    = useState(null);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);

  /* ── auth ──────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setHistory([]);
    setPage("dashboard");
    setAuthScreen("login");
  }, []);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [logout]);

  useEffect(() => {
    if (!getToken()) { setAuthChecking(false); return; }
    getMe()
      .then((me) => setUser(me))
      .catch(() => logout())
      .finally(() => setAuthChecking(false));
  }, [logout]);

  /* ── resume history ────────────────────────────────────────────── */
  const loadHistory = useCallback(async (pageNum = 1) => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await getResumes({ page: pageNum, limit: 10 });
      setHistory((data.items || []).map(mapResumeItem));
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setHistoryError(err.message || "Could not load your resumes.");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadHistory(1); }, [user, loadHistory]);

  /* ── analysis flow ─────────────────────────────────────────────── */
  const startPolling = ({ fileName, resumeId }) => {
    setPendingFile({ name: fileName, resumeId });
    setPage("analyzing");
  };

  const onAnalysisDone = useCallback((fileName, analysisPayload) => {
    const suggestions = analysisPayload.suggestions ?? [];
    setCurrentAnalysis(analysisPayload);
    setCurrentSuggestions(suggestions);
    setPendingFile((prev) => prev ?? { name: fileName, resumeId: null });
    loadHistory(1);
    setPage("results");
  }, [loadHistory]);

  const onAnalysisFailed = useCallback(() => {
    setPendingFile(null);
    setPage("upload");
  }, []);

  const openResume = useCallback(async (resumeId) => {
    try {
      const data = await getResumeById(resumeId);
      const atsScore    = typeof data.ats_score?.score === "number" ? data.ats_score.score : 0;
      const breakdown   = data.ats_score?.breakdown ?? {};
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      setPendingFile({ name: data.fileName, resumeId: data.resumeId });
      setCurrentAnalysis({ atsScore, breakdown, suggestions });
      setCurrentSuggestions(suggestions);
      setPage("results");
    } catch (err) {
      setHistoryError(err.message || "Could not open resume.");
    }
  }, []);

  const openSuggestions = useCallback(async (resumeId) => {
    try {
      const data        = await getResumeById(resumeId);
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      setPendingFile({ name: data.fileName, resumeId: data.resumeId });
      setCurrentSuggestions(suggestions);
      if (data.ats_score) {
        setCurrentAnalysis({
          atsScore:   data.ats_score.score,
          breakdown:  data.ats_score.breakdown ?? {},
          suggestions,
        });
      }
      setPage("suggestions");
    } catch (err) {
      setHistoryError(err.message || "Could not load suggestions.");
    }
  }, []);

  const removeResume = useCallback(async (resumeId) => {
    await deleteResume(resumeId);
    const nextPage = history.length === 1 && pagination.page > 1
      ? pagination.page - 1
      : pagination.page;
    await loadHistory(nextPage);
  }, [history.length, pagination.page, loadHistory]);

  /* ── render ────────────────────────────────────────────────────── */

  // Checking stored token
  if (authChecking) {
    return (
      <div className="ra-root min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="ra-spin" style={{ color: "var(--violet)" }} />
      </div>
    );
  }

  // Not logged in — show Login or Register
  if (!user) {
    return authScreen === "register"
      ? <Register onAuth={setUser} onSwitchToLogin={() => setAuthScreen("login")} />
      : <Login    onAuth={setUser} onSwitchToRegister={() => setAuthScreen("register")} />;
  }

  // Logged in — main app
  let body;
  if      (page === "dashboard")  body = <Dashboard   setPage={setPage} history={history} stats={stats} loading={historyLoading} onOpenResume={openResume} />;
  else if (page === "upload")     body = <UploadResume onUploadDone={startPolling} />;
  else if (page === "analyzing")  body = <Analyzing   fileName={pendingFile?.name} resumeId={pendingFile?.resumeId} onDone={onAnalysisDone} onFailed={onAnalysisFailed} />;
  else if (page === "results")    body = <Results     fileName={pendingFile?.name} analysis={currentAnalysis} setPage={setPage} />;
  else if (page === "suggestions") body = <Suggestions apiSuggestions={currentSuggestions} />;
  else if (page === "history")    body = <Resumes     history={history} pagination={pagination} loading={historyLoading} error={historyError} setPage={setPage} onPageChange={loadHistory} onOpenResume={openResume} onOpenSuggestions={openSuggestions} onDelete={removeResume} />;

  return (
    <div className="ra-root min-h-screen flex w-full">
      <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} onLogout={logout} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar setMobileOpen={setMobileOpen} />
        <main key={page} className="ra-scrollbar flex-1">{body}</main>
      </div>
    </div>
  );
}
