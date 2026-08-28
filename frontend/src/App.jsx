import { useState } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import MobileTopBar from "./components/layout/MobileTopBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import Results from "./pages/Results.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import Resumes from "./pages/Resumes.jsx";
import Settings from "./pages/Settings.jsx";
import { initialHistory } from "./data/mockData.js";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);

  const startAnalysis = (fileName, analysis) => {
    setCurrentFileName(fileName);
    setCurrentAnalysis(analysis);
    setCurrentSuggestions(analysis.suggestions ?? []);
    setHistory((h) => [{ id: `r${Date.now()}`, name: fileName, date: "Just now", score: analysis.atsScore }, ...h]);
    setPage("results");
  };

  let body;
  if (page === "dashboard") body = <Dashboard setPage={setPage} history={history} />;
  else if (page === "upload") body = <UploadResume onAnalyze={startAnalysis} />;
  else if (page === "results") body = <Results fileName={currentFileName} analysis={currentAnalysis} setPage={setPage} />;
  else if (page === "suggestions") body = <Suggestions apiSuggestions={currentSuggestions} />;
  else if (page === "history") body = <Resumes history={history} setHistory={setHistory} setPage={setPage} />;
  else if (page === "settings") body = <Settings />;

  return (
    <div className="ra-root min-h-screen flex w-full">
      <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0">
        <MobileTopBar setMobileOpen={setMobileOpen} />
        <main key={page} className="ra-scrollbar">{body}</main>
      </div>
    </div>
  );
}