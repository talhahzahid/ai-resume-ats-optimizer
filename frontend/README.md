# ResumeAI — AI Resume Analyzer (Frontend)

A premium AI SaaS-style frontend for an AI-powered resume analyzer, built with React + Vite + Tailwind CSS + lucide-react.

## Run it

```bash
npm i
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/      Sidebar, MobileTopBar
    ui/          Badge, CircularScore, MiniRing
  pages/         Dashboard, UploadResume, Analyzing, Results, Suggestions, Resumes, Settings
  data/          mockData.js — mock analysis/suggestions/history + helpers
  App.jsx        page state + routing between screens
  index.css      design tokens, fonts, animations (Tailwind)
```

## Notes

- Currently wired to mock data in `src/data/mockData.js`, matching the analysis response shape:
  `{ atsScore, breakdown, strengths, improvements, suggestions }`. Swap the mock imports for real API calls when the backend is ready — the components don't need to change.
- Navigation between screens is done with local React state in `App.jsx` (no router needed for this flow). Add `react-router-dom` if you want real URLs per page.
- Design concept: an "optical scan" motif — the AI analysis loader has a signature scan-line sweep, and score rings/accents echo it in teal.
