import { useState, useCallback } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import MobileTopBar from "./components/layout/MobileTopBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import Analyzing from "./pages/Analyzing.jsx";
import Results from "./pages/Results.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import Resumes from "./pages/Resumes.jsx";
import { initialHistory } from "./data/mockData.js";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [history, setHistory] = useState(initialHistory);

  // Upload → Analyzing state
  const [pendingFile, setPendingFile] = useState(null);   // { name, resumeId }
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);

  /** Called by UploadResume after successful upload — moves to analyzing screen */
  const startPolling = ({ fileName, resumeId }) => {
    setPendingFile({ name: fileName, resumeId });
    setPage("analyzing");
  };

  /** Called by Analyzing when polling returns "completed" */
  const onAnalysisDone = useCallback((fileName, analysisPayload) => {
    const suggestions = analysisPayload.suggestions ?? [];
    setCurrentAnalysis(analysisPayload);
    setCurrentSuggestions(suggestions);
    setHistory((h) => [
      { id: `r${Date.now()}`, name: fileName, date: "Just now", score: analysisPayload.atsScore },
      ...h,
    ]);
    setPage("results");
  }, []); // no deps — only uses stable setState functions

  /** Called by Analyzing on failure */
  const onAnalysisFailed = useCallback(() => {
    setPendingFile(null);
    setPage("upload");
  }, []); // no deps — only uses stable setState functions

  let body;
  if (page === "dashboard")
    body = <Dashboard setPage={setPage} history={history} />;
  else if (page === "upload")
    body = <UploadResume onUploadDone={startPolling} />;
  else if (page === "analyzing")
    body = (
      <Analyzing
        fileName={pendingFile?.name}
        resumeId={pendingFile?.resumeId}
        onDone={onAnalysisDone}
        onFailed={onAnalysisFailed}
      />
    );
  else if (page === "results")
    body = (
      <Results
        fileName={pendingFile?.name}
        analysis={currentAnalysis}
        setPage={setPage}
      />
    );
  else if (page === "suggestions")
    body = <Suggestions apiSuggestions={currentSuggestions} />;
  else if (page === "history")
    body = <Resumes history={history} setHistory={setHistory} setPage={setPage} />;

  return (
    <div className="ra-root min-h-screen flex w-full">
      <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar setMobileOpen={setMobileOpen} />
        <main key={page} className="ra-scrollbar flex-1">{body}</main>
      </div>
    </div>
  );
}
