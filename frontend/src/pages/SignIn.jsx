import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiZap, FiMail, FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const SignIn = () => {
  const [email, setEmail] = useState("agent@assistiq.io");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || "/app/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ type: "error", message: "Please enter your email and password." });
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      setToast({ type: "success", message: "Sign in successful! Redirecting to workspace..." });
      setTimeout(() => {
        navigate(fromPath, { replace: true });
      }, 600);
    } catch (err) {
      setToast({ type: "error", message: "Invalid credentials. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="auth-card-two-col">
        {/* Left Branding Column */}
        <div className="auth-brand-col">
          <Link to="/" className="auth-logo">
            <div className="logo-icon"><FiZap /></div>
            <span>AssistIQ</span>
          </Link>

          <div className="auth-brand-message">
            <h2>AI-Powered Customer Support Workspace</h2>
            <p>Sign in to access real-time sentiment analysis, live escalated tickets, and multi-turn AI conversations.</p>

            <div className="auth-feature-list">
              <div className="feature-item"><FiCheckCircle /> <span>Multi-Agent LangGraph Pipeline</span></div>
              <div className="feature-item"><FiCheckCircle /> <span>ChromaDB Vector RAG Embeddings</span></div>
              <div className="feature-item"><FiCheckCircle /> <span>Smart Human Escalation & SLA Queue</span></div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © {new Date().getFullYear()} AssistIQ Platform Inc.
          </div>
        </div>

        {/* Right Form Column */}
        <div className="auth-form-col">
          <div className="auth-form-header">
            <h2>Sign in to your account</h2>
            <p>Welcome back! Please enter your workspace credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label><FiMail /> Work Email</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="label-flex">
                <label><FiLock /> Password</label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-lbl">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary-lg full-width">
              {submitting ? "Signing in..." : <><FiArrowRight /> Sign In to Workspace</>}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or demo workspace</span>
          </div>

          <button
            onClick={() => {
              setEmail("agent@assistiq.io");
              setPassword("password123");
            }}
            className="btn-secondary-md full-width"
          >
            Use Demo Agent Credentials
          </button>

          <p className="auth-bottom-text">
            Don't have an account? <Link to="/signup" className="bold-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
