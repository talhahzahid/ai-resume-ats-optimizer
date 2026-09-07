import { useState, useRef, useEffect } from "react";
import { Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginUser } from "../services/api.js";

const FEATURES = [
  "Real ATS score from actual parsing engines",
  "Line-by-line AI improvement suggestions",
  "Before & after comparison for every fix",
  "Track every version of your resume",
];

export default function Login({ onAuth, onSwitchToRegister }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const emailRef = useRef(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const user = await loginUser({ email, password });
      onAuth(user);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">

      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M6 12h12M12 6v12"/>
              </svg>
            </div>
            <span className="auth-logo-name">ResumeAI</span>
          </div>

          {/* Headline */}
          <div className="auth-left-headline">
            <h1>Get past the ATS.<br />Land the interview.</h1>
            <p>
              Most resumes are rejected before a human ever reads them.
              ResumeAI shows you exactly why — and how to fix it.
            </p>
          </div>

          {/* Feature list */}
          <ul className="auth-feature-list">
            {FEATURES.map((f) => (
              <li key={f}>
                <CheckCircle2 size={15} className="auth-feature-icon" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="auth-testimonial">
            <p className="auth-testimonial-quote">
              "Went from 0 callbacks to 4 interviews in two weeks after using the suggestions."
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">SR</div>
              <div>
                <div className="auth-testimonial-name">Sara R.</div>
                <div className="auth-testimonial-role">Software Engineer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-right-inner">

          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M6 12h12M12 6v12"/>
              </svg>
            </div>
            <span className="auth-logo-name">ResumeAI</span>
          </div>

          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Log in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
                className={error ? "auth-input auth-input-error" : "auth-input"}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-forgot"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  className={error ? "auth-input auth-input-error" : "auth-input"}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="auth-submit"
            >
              {loading ? (
                <Loader2 size={16} className="ra-spin" />
              ) : (
                <>
                  Log in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Switch */}
          <p className="auth-switch">
            Don't have an account?{" "}
            <button type="button" onClick={onSwitchToRegister} className="auth-switch-btn">
              Create one
            </button>
          </p>

          {/* Demo credentials */}
          <div className="auth-demo">
            <p className="auth-demo-label">Try with demo account</p>
            <div className="auth-demo-row">
              <div className="auth-demo-field">
                <span className="auth-demo-key">Email</span>
                <button
                  type="button"
                  className="auth-demo-value"
                  onClick={() => { setEmail("demo@example.com"); setError(""); }}
                  title="Click to fill"
                >
                  demo@example.com
                </button>
              </div>
              <div className="auth-demo-divider" />
              <div className="auth-demo-field">
                <span className="auth-demo-key">Password</span>
                <button
                  type="button"
                  className="auth-demo-value"
                  onClick={() => { setPassword("Demo@123"); setError(""); }}
                  title="Click to fill"
                >
                  Demo@123
                </button>
              </div>
            </div>
            <p className="auth-demo-hint">Click any value to fill it in</p>
          </div>

        </div>
      </div>
    </div>
  );
}
