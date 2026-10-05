import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiZap, FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setToast({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (formData.password.length < 6) {
      setToast({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setSubmitting(true);
    try {
      await signup(formData);
      setToast({ type: "success", message: "Account created! Redirecting to workspace..." });
      setTimeout(() => {
        navigate("/app/dashboard", { replace: true });
      }, 600);
    } catch (err) {
      setToast({ type: "error", message: "Registration failed. Please try again." });
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
            <h2>Join the AI-Powered Support Platform</h2>
            <p>Deploy intelligent sentiment analysis, automated ticket resolution, and vector RAG knowledge in minutes.</p>

            <div className="auth-feature-list">
              <div className="feature-item"><FiCheckCircle /> <span>Free 14-day Enterprise Trial</span></div>
              <div className="feature-item"><FiCheckCircle /> <span>Unlimited AI Conversations</span></div>
              <div className="feature-item"><FiCheckCircle /> <span>PostgreSQL & ChromaDB Support</span></div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © {new Date().getFullYear()} AssistIQ Platform Inc.
          </div>
        </div>

        {/* Right Form Column */}
        <div className="auth-form-col">
          <div className="auth-form-header">
            <h2>Create your workspace account</h2>
            <p>Get started with AssistIQ customer intelligence today.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label><FiUser /> Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label><FiMail /> Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label><FiBriefcase /> Organization</label>
                <input
                  type="text"
                  placeholder="TechCorp Inc."
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label><FiLock /> Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label><FiLock /> Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-lbl">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                />
                <span>I agree to the Terms of Service & Privacy Policy</span>
              </label>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary-lg full-width">
              {submitting ? "Creating Account..." : <><FiArrowRight /> Create Workspace Account</>}
            </button>
          </form>

          <p className="auth-bottom-text">
            Already have an account? <Link to="/signin" className="bold-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
