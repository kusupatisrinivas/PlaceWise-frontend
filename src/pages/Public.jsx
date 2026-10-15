import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  GraduationCap,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Sparkles,
  LockKeyhole,
} from "lucide-react";
import { useAuth } from "../context";
import { errorMessage } from "../api";
import { Logo, CompanyMark, Field, FormError, branches } from "../components";

export function Home() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <nav className="public-nav">
        <Link to="/" className="brand-link">
          <Logo />
        </Link>
        <div>
          <a className="nav-text" href="#how-it-works">
            How it works
          </a>
          <Link className="btn secondary" to={user ? "/dashboard" : "/login"}>
            {user ? "My dashboard" : "Sign in"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>
      <main id="main-content">
        <section className="landing-hero">
          <div className="landing-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              CAMPUS PLACEMENT MANAGEMENT
            </div>
            <h1>
              Your career.
              <br />
              One clear <em>direction.</em>
            </h1>
            <p>
              Your campus, your skills, your next opportunity. Discover
              placement drives, find your fit, and take the first step toward a
              career that's yours.
            </p>
            <div className="hero-actions">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="btn primary large"
              >
                {user ? "Open your dashboard" : "Create your profile"}
                <ArrowRight size={19} />
              </Link>
              <Link to="/login?role=officer" className="text-link">
                I'm a placement officer
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-assurances">
              <span>
                <CheckCircle2 size={15} />
                One place for every opportunity
              </span>
              <span>
                <CheckCircle2 size={15} />
                Built for your campus
              </span>
            </div>
          </div>

          <div
            className="product-preview"
            aria-label="Sample placement workspace preview"
          >
            <div className="preview-top">
              <span className="preview-dots">
                <i />
                <i />
                <i />
              </span>
              <span>placewise / opportunities</span>
              <span className="preview-label">PREVIEW</span>
            </div>
            <div className="preview-body">
              <div className="preview-heading">
                <div>
                  <small>YOUR WORKSPACE</small>
                  <h2>Explore. Apply. Get hired.</h2>
                </div>
                <BriefcaseBusiness size={24} />
              </div>
              <div className="preview-stats">
                <div>
                  <strong>01</strong>
                  <span>Build your profile</span>
                </div>
                <div>
                  <strong>02</strong>
                  <span>Find your fit</span>
                </div>
                <div>
                  <strong>03</strong>
                  <span>Track progress</span>
                </div>
              </div>
              <div className="preview-section">
                <strong>Opportunity shortlist</strong>
                <span>Sample roles</span>
              </div>
              {[
                ["Accenture", "Associate Software Engineer", "Hyderabad"],
                ["TCS", "Graduate Software Engineer", "Chennai"],
                ["Microsoft", "Software Engineer Intern", "Hyderabad"],
              ].map(([name, role, city]) => (
                <div className="preview-role" key={name}>
                  <CompanyMark name={name} small />
                  <div>
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                  <small>{city}</small>
                  <ArrowUpRight size={16} />
                </div>
              ))}
              <div className="preview-footer">
                <ShieldCheck size={17} />
                <span>Eligibility checks built into every application</span>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="landing-features">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A CONNECTED PLACEMENT EXPERIENCE</div>
              <h2>A clear path to what comes next.</h2>
            </div>
            <span>Every step, in one place.</span>
          </div>
          <div className="feature-grid">
            {[
              [
                BriefcaseBusiness,
                "01",
                "Discover your fit",
                "Explore campus drives and see exactly where your skills match.",
              ],
              [
                GraduationCap,
                "02",
                "Put your best foot forward",
                "Build your profile and apply to opportunities you’re eligible for.",
              ],
              [
                ChartNoAxesCombined,
                "03",
                "Follow your progress",
                "From your first application to a selection, stay in the loop.",
              ],
            ].map(([Icon, n, title, copy]) => (
              <article key={n}>
                <div>
                  <Icon size={25} />
                  <span>{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <Logo />
        <span>Made for your next chapter.</span>
        <Link to="/login">
          Enter your workspace
          <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}
function AuthLayout({ children, register = false }) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Link to="/" className="brand-link">
          <Logo light />
        </Link>
        <div className="auth-story">
          <div className="eyebrow">FROM CAMPUS TO CAREER</div>
          <h1>
            Your potential.
            <br />A world of
            <br />
            <em>possibilities.</em>
          </h1>
          <p>
            One workspace to discover opportunities, make your move, and shape
            what comes next.
          </p>
          <div className="auth-art">
            <div />
            <ArrowUpRight size={120} strokeWidth={1} />
            <span>✦</span>
          </div>
        </div>
        <small>Placewise · Your next chapter starts here.</small>
      </aside>
      <main
        id="main-content"
        className={`auth-main ${register ? "register-main" : ""}`}
      >
        <Link to="/" className="auth-mobile-brand">
          <Logo />
        </Link>
        <div className="auth-form-wrap">{children}</div>
        <p className="auth-security">
          <LockKeyhole size={13} />
          Your campus account, securely connected.
        </p>
      </main>
    </div>
  );
}
function PasswordInput({
  value,
  onChange,
  autoComplete = "current-password",
  id,
  "aria-describedby": describedBy,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-wrap">
      <input
        id={id}
        aria-describedby={describedBy}
        type={visible ? "text" : "password"}
        required
        minLength={8}
        maxLength={64}
        autoComplete={autoComplete}
        placeholder="Enter your password"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
export function Login() {
  const { user, authenticate } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [connectionMessage, setConnectionMessage] = useState("");
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const officer =
    new URLSearchParams(location.search).get("role") === "officer";
  if (user)
    return <Navigate to={location.state?.from || "/dashboard"} replace />;
  async function submit(event) {
    event.preventDefault();
    await signIn(form);
  }
  async function signIn(credentials) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setError("");
    setBusy(true);
    try {
      await authenticate("/auth/login", credentials, {
        signal: controller.signal,
        onWaiting: setConnectionMessage,
      });
      if (!controller.signal.aborted)
        navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (e) {
      if (!controller.signal.aborted) setError(errorMessage(e));
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        setConnectionMessage("");
      }
    }
  }
  return (
    <AuthLayout>
      <div className="eyebrow">GOOD TO SEE YOU AGAIN</div>
      <h2>{officer ? "Placement officer sign in" : "Welcome back."}</h2>
      <p className="auth-subtitle">
        {officer
          ? "Manage companies, drives, and student applications."
          : "Sign in to your next opportunity."}
      </p>
      <form onSubmit={submit}>
        <FormError error={error} />
        {busy && connectionMessage && (
          <p className="auth-subtitle" role="status">
            {connectionMessage}
          </p>
        )}
        <Field label="Email address">
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={180}
            placeholder="you@college.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <button className="btn primary full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-switch">
        New to Placewise? <Link to="/register">Create your account</Link>
      </p>
      {import.meta.env.VITE_DEMO_MODE === "true" && (
        <div className="demo-panel">
          <span>
            <Sparkles size={15} />
            EXPLORE THE LOCAL DEMO
          </span>
          <p>Choose an account to sign in to the local demo.</p>
          <div>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                signIn({
                  email: "hemanth@placewise.edu",
                  password: "Student@123",
                })
              }
            >
              Student account
              <ArrowUpRight size={14} />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                signIn({ email: "admin@placewise.edu", password: "Admin@123" })
              }
            >
              Placement officer
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
export function Register() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    rollNumber: "",
    branch: "CSE",
    year: 4,
    cgpa: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  if (user) return <Navigate to="/dashboard" replace />;
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  async function submit(event) {
    event.preventDefault();
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError("");
    try {
      await authenticate(
        "/auth/register",
        {
          ...form,
          year: Number(form.year),
          cgpa: Number(form.cgpa),
        },
        { onWaiting: setConnectionMessage, signal: controller.signal },
      );
      if (!controller.signal.aborted) navigate("/dashboard");
    } catch (e) {
      if (!controller.signal.aborted) setError(errorMessage(e));
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        setConnectionMessage("");
      }
    }
  }
  return (
    <AuthLayout register>
      <div className="eyebrow">YOUR NEXT CHAPTER</div>
      <h2>Let's get you started.</h2>
      <p className="auth-subtitle">
        Create your student account. Opportunity awaits.
      </p>
      <form onSubmit={submit}>
        <FormError error={error} />
        {busy && connectionMessage && (
          <p className="auth-subtitle" role="status">
            {connectionMessage}
          </p>
        )}
        <div className="form-grid">
          <Field label="Full name" className="span-2">
            <input
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Your full name"
              value={form.fullName}
              onChange={change("fullName")}
            />
          </Field>
          <Field label="Email address" className="span-2">
            <input
              type="email"
              required
              maxLength={180}
              autoComplete="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={change("email")}
            />
          </Field>
          <Field
            label="Password"
            className="span-2"
            hint="At least 8 characters."
          >
            <PasswordInput
              value={form.password}
              onChange={change("password")}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Roll number">
            <input
              required
              pattern="[A-Za-z0-9-]{3,30}"
              title="3–30 letters, numbers or hyphens"
              placeholder="22CSE001"
              value={form.rollNumber}
              onChange={change("rollNumber")}
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              type="tel"
              autoComplete="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              title="Enter a 10-digit phone number"
              placeholder="9876543210"
              value={form.phone}
              onChange={change("phone")}
            />
          </Field>
          <Field label="Branch">
            <select value={form.branch} onChange={change("branch")}>
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <select value={form.year} onChange={change("year")}>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="CGPA" className="span-2">
            <input
              required
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="8.50"
              value={form.cgpa}
              onChange={change("cgpa")}
            />
          </Field>
        </div>
        <button className="btn primary full" disabled={busy}>
          {busy ? "Creating your account…" : "Create account"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
