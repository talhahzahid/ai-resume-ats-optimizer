import { useState, useRef, useEffect } from "react";
import { Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { registerUser } from "../services/api.js";

const STEPS = [
  { label: "Upload your resume", sub: "PDF, any format" },
  { label: "AI analyses every line", sub: "ATS score + breakdown" },
  { label: "Get targeted fixes", sub: "Before & after for each issue" },
];

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: "8+ characters",         pass: password.length >= 8       },
    { label: "Uppercase letter",       pass: /[A-Z]/.test(password)     },
    { label: "Number or symbol",       pass: /[\d\W]/.test(password)    },
  ];
  const score = checks.filter((c) => c.pass).length;
  const bar   = ["", "auth-strength-weak", "auth-strength-fair", "auth-strength-strong"][score];
  const label = ["", "Weak", "Fair", "Strong"][score];

  return (
    <div className="auth-strength-wrap">
      <div className="auth-strength-bars">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`auth-strength-bar ${i < score ? bar : ""}`} />
        ))}
      </div>
      {score > 0 && <span className={`auth-strength-label ${bar}`}>{label}</span>}
    </div>
  );
}

export default function Register({ onAuth, onSwitchToLogin }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await registerUser({ name, email, password });
      onAuth(user);
    } catch (err) {
      setError(err.message || "Could not create account. Please try again.");
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
            <h1>Your resume,<br />optimized in minutes.</h1>
            <p>
              Create a free account and get your first ATS analysis instantly.
              No credit card. No fluff.
            </p>
          </div>

          {/* How it works steps */}
          <div className="auth-steps">
            <p className="auth-steps-label">How it works</p>
            <ol className="auth-step-list">
              {STEPS.map((s, i) => (
                <li key={s.label} className="auth-step">
                  <div className="auth-step-num">{i + 1}</div>
                  <div>
                    <div className="auth-step-title">{s.label}</div>
                    <div className="auth-step-sub">{s.sub}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Social proof */}
          <div className="auth-social-proof">
            <div className="auth-avatars">
              {["AK", "JS", "MR", "TL"].map((init) => (
                <div key={init} className="auth-avatar-chip">{init}</div>
              ))}
            </div>
            <p>Join <strong>hundreds of job seekers</strong> already using ResumeAI</p>
          </div>

        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-right-inner">

          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon" style={{ width: 28, height: 28 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M6 12h12M12 6v12"/>
              </svg>
            </div>
            <span className="auth-logo-name">ResumeAI</span>
          </div>

          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">

            {/* Name */}
            <div className="auth-field">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                className="auth-input"
              />
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
                className="auth-input"
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  className="auth-input"
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
              <PasswordStrength password={password} />
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
              disabled={loading || !name || !email || !password}
              className="auth-submit"
            >
              {loading ? (
                <Loader2 size={16} className="ra-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="auth-terms">
              By creating an account you agree to our{" "}
              <button type="button" className="auth-terms-link">Terms of Service</button>
              {" "}and{" "}
              <button type="button" className="auth-terms-link">Privacy Policy</button>.
            </p>

          </form>

          {/* Switch */}
          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="auth-switch-btn">
              Log in
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
