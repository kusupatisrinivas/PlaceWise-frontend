import {
  Navigate,
  Route,
  Routes,
  Outlet,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  UserRound,
  Building2,
  UsersRound,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  GraduationCap,
  CalendarDays,
  CircleHelp,
} from "lucide-react";
import { useAuth } from "./context";
import { Logo, initials } from "./components";
import { Home, Login, Register } from "./pages/Public";
import { StudentDashboard, AdminDashboard } from "./pages/Dashboard";
import { Drives, DriveDetails } from "./pages/Drives";
import { Profile } from "./pages/Profile";
import { Applications } from "./pages/Applications";
import { Companies, Students, ManageDrives } from "./pages/Admin";

function RequireAuth({ role }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
function Shell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const admin = user.role === "ROLE_ADMIN";
  const nav = admin
    ? [
        ["/dashboard", "Overview", LayoutDashboard],
        ["/admin/students", "Students", UsersRound],
        ["/admin/companies", "Companies", Building2],
        ["/admin/drives", "Placement drives", BriefcaseBusiness],
        ["/admin/applications", "Applications", FileText],
      ]
    : [
        ["/dashboard", "Overview", LayoutDashboard],
        ["/drives", "Placement drives", BriefcaseBusiness],
        ["/applications", "My applications", FileText],
      ];
  const current =
    nav.find(([path]) => path === location.pathname)?.[1] ||
    (location.pathname === "/profile" ? "My profile" : "Drive details");
  return (
    <div className="app-shell">
      {open && (
        <button
          className="sidebar-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link
          to="/dashboard"
          className="brand-link"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>
        <button
          className="mobile-close icon-btn"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">
          <span className="workspace-icon">
            <GraduationCap size={18} />
          </span>
          <div>
            <strong>Campus workspace</strong>
            <small>{admin ? "Placement office" : "Student portal"}</small>
          </div>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end onClick={() => setOpen(false)}>
              <Icon size={19} />
              <span>{label}</span>
              {path === "/drives" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        {!admin && (
          <>
            <div className="nav-caption account-caption">ACCOUNT</div>
            <nav aria-label="Account navigation">
              <NavLink to="/profile" onClick={() => setOpen(false)}>
                <UserRound size={19} />
                My profile
              </NavLink>
            </nav>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-spark">✦</span>
            <h3>
              {admin ? "Placement operations." : "Keep your profile ready."}
            </h3>
            <p>
              {admin
                ? "Connect your students with their next chapter."
                : "Keep your skills up to date to find your perfect fit."}
            </p>
            <Link
              to={admin ? "/admin/drives" : "/profile"}
              onClick={() => setOpen(false)}
            >
              {admin ? "Manage opportunities" : "Update your profile"}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="sidebar-user">
            <span className="avatar">{initials(user.fullName)}</span>
            <div>
              <strong>{user.fullName}</strong>
              <small>{admin ? "Administrator" : "Student account"}</small>
            </div>
            <button
              className="icon-btn"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <span className="academic-year">
              <span />
              Placement season {new Date().getFullYear()}
            </span>
            <Link
              to={admin ? "/admin/students" : "/profile"}
              className="top-avatar"
              aria-label={admin ? "View students" : "View your profile"}
            >
              {initials(user.fullName)}
            </Link>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Your campus. Your career.</span>
          <span>Placewise · Campus placements, connected.</span>
        </footer>
      </div>
    </div>
  );
}
export default function App() {
  const { user } = useAuth();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route element={<Shell />}>
            <Route
              path="/dashboard"
              element={
                user?.role === "ROLE_ADMIN" ? (
                  <AdminDashboard />
                ) : (
                  <StudentDashboard />
                )
              }
            />
            <Route path="/drives" element={<Drives />} />
            <Route path="/drives/:id" element={<DriveDetails />} />
            <Route element={<RequireAuth role="ROLE_STUDENT" />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/applications" element={<Applications />} />
            </Route>
            <Route element={<RequireAuth role="ROLE_ADMIN" />}>
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/companies" element={<Companies />} />
              <Route path="/admin/drives" element={<ManageDrives />} />
              <Route
                path="/admin/applications"
                element={<Applications admin />}
              />
            </Route>
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <div className="not-found">
              <Logo />
              <h1>This page took a different path.</h1>
              <p>Let's get you back to your next opportunity.</p>
              <Link className="btn primary" to={user ? "/dashboard" : "/"}>
                Back to {user ? "dashboard" : "home"}
              </Link>
            </div>
          }
        />
      </Routes>
    </>
  );
}
