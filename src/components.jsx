import { useEffect, useRef, useId, cloneElement } from "react";
import { Link } from "react-router-dom";
import { useSavedDrives } from "./context";
import {
  ArrowUpRight,
  MapPin,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  BriefcaseBusiness,
  X,
  AlertCircle,
  IndianRupee,
  LoaderCircle,
  Search,
  Bookmark,
} from "lucide-react";

export const branches = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "AIML",
  "AIDS",
];
export const statuses = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];
export const titleCase = (value = "") =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
export const date = (value, options = {}) =>
  value
    ? new Date(
        value.length === 10 ? value + "T12:00:00" : value,
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        ...options,
      })
    : "—";
export const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export function Logo({ light = false }) {
  return (
    <span className={`brand ${light ? "light" : ""}`}>
      <span className="brand-mark">
        <ArrowUpRight size={24} strokeWidth={3} />
      </span>
      placewise<span className="brand-dot">.</span>
    </span>
  );
}
export function CompanyMark({ name, small = false }) {
  const colors = {
    Google: "google",
    Microsoft: "microsoft",
    Atlassian: "atlassian",
    Deloitte: "deloitte",
    Infosys: "infosys",
    TCS: "tcs",
    Amazon: "amazon",
    Accenture: "accenture",
  };
  return (
    <span
      aria-hidden="true"
      className={`company-mark ${colors[name] || "generic"} ${small ? "small" : ""}`}
    >
      {name === "Microsoft" ? (
        <span className="ms-grid">
          <i />
          <i />
          <i />
          <i />
        </span>
      ) : name === "Atlassian" ? (
        "A"
      ) : name === "Deloitte" ? (
        <>
          D<span>.</span>
        </>
      ) : name === "Google" ? (
        "G"
      ) : (
        initials(name)
      )}
    </span>
  );
}
export function StatusBadge({ status }) {
  return (
    <span className={`badge status-${status?.toLowerCase()}`}>
      <i />
      {titleCase(status)}
    </span>
  );
}
export function Empty({
  title = "Nothing here yet",
  text = "Your next opportunity is just around the corner.",
  action,
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <BriefcaseBusiness size={28} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={25} />
      <span>Getting everything ready…</span>
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={24} />
      <p>{message}</p>
      {retry && (
        <button className="btn secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function PageState({ resource, children }) {
  if (resource.loading) return <Loading />;
  if (resource.error)
    return <ErrorState message={resource.error} retry={resource.reload} />;
  return children(resource.data);
}
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}
export function SectionHeader({
  title,
  subtitle,
  to,
  label = "View all",
  children,
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {to ? (
        <Link className="text-link" to={to}>
          {label}
          <ChevronRight size={16} />
        </Link>
      ) : (
        children
      )}
    </div>
  );
}
export function StatCard({ label, value, icon: Icon, tone = "green", foot }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong>{value ?? 0}</strong>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}
export function DriveCard({ drive, admin = false }) {
  return (
    <article className="drive-card">
      <div className="drive-card-top">
        <CompanyMark name={drive.company.name} />
        <div className="drive-card-actions">
          <span className="job-type">{titleCase(drive.jobType)}</span>
          {!admin && <SaveDriveButton drive={drive} />}
        </div>
      </div>
      <p className="company-name">{drive.company.name}</p>
      <h3>
        <Link to={`/drives/${drive.id}`}>{drive.jobTitle}</Link>
      </h3>
      <div className="muted-row">
        <MapPin size={14} />
        {drive.location}
      </div>
      <div className="drive-pay">
        <strong>
          ₹{Number(drive.salaryPackage)} <span>LPA</span>
        </strong>
        <span>Min. {Number(drive.minCgpa)} CGPA</span>
      </div>
      <div className="chip-row">
        {drive.requiredSkills.slice(0, 3).map((s) => (
          <span className="skill-chip" key={s}>
            {s}
          </span>
        ))}
      </div>
      <div className="drive-card-bottom">
        <span
          className={`eligibility-label ${drive.applied ? "applied" : drive.eligibility?.eligible ? "yes" : ""}`}
        >
          {drive.applied ? (
            <>
              <CheckCircle2 size={14} />
              Applied
            </>
          ) : admin ? (
            `${drive.applicantCount} applicants`
          ) : drive.eligibility?.eligible ? (
            <>
              <CheckCircle2 size={14} />
              You're eligible
            </>
          ) : drive.active ? (
            "Check requirements"
          ) : (
            "Applications closed"
          )}
        </span>
        <Link
          to={`/drives/${drive.id}`}
          aria-label={`View ${drive.jobTitle} at ${drive.company.name}`}
          className="arrow-button"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="drive-deadline">
        <CalendarDays size={13} /> Apply by {date(drive.deadline)}
      </div>
    </article>
  );
}
export function ApplicationsTable({
  applications,
  admin = false,
  onStatus,
  updating,
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{admin ? "Student" : "Company & role"}</th>
            {admin && <th>Company & role</th>}
            <th>{admin ? "Branch" : "Package"}</th>
            <th>Applied on</th>
            <th>Status</th>
            <th>
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id}>
              <td>
                {admin ? (
                  <div className="person-cell">
                    <span className="avatar mini">
                      {initials(a.student.fullName)}
                    </span>
                    <div>
                      <strong>{a.student.fullName}</strong>
                      <small>{a.student.rollNumber}</small>
                    </div>
                  </div>
                ) : (
                  <div className="company-cell">
                    <CompanyMark name={a.company} small />
                    <div>
                      <strong>{a.company}</strong>
                      <small>{a.jobTitle}</small>
                    </div>
                  </div>
                )}
              </td>
              {admin && (
                <td>
                  <strong>{a.company}</strong>
                  <small>{a.jobTitle}</small>
                </td>
              )}
              <td>
                {admin ? a.student.branch : `₹${Number(a.salaryPackage)} LPA`}
              </td>
              <td>{date(a.appliedAt, { year: "numeric" })}</td>
              <td>
                {onStatus ? (
                  <select
                    aria-label={`Status for ${a.student.fullName} at ${a.company}`}
                    className={`status-select status-${a.status.toLowerCase()}`}
                    value={a.status}
                    disabled={updating === a.id}
                    onChange={(e) => onStatus(a.id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {titleCase(s)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={a.status} />
                )}
              </td>
              <td>
                <Link
                  className="table-arrow"
                  to={`/drives/${a.driveId}`}
                  aria-label={`View ${a.company} drive`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const cancel = (event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", cancel);
    document.body.style.overflow = "hidden";
    return () => {
      dialog.removeEventListener("cancel", cancel);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Confirm({ title, message, onConfirm, onClose, busy }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-copy">{message}</p>
      <div className="form-actions">
        <button className="btn secondary" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button className="btn danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Deleting…" : "Delete permanently"}
        </button>
      </div>
    </Modal>
  );
}
export function Field({ label, children, hint, ...props }) {
  const id = useId();
  return (
    <div className={`field ${props.className || ""}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        "aria-describedby": hint ? id + "-hint" : undefined,
      })}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search-input">
      <Search size={18} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
export function FormError({ error }) {
  return error ? (
    <div className="form-error" role="alert">
      <AlertCircle size={18} />
      <span>{error}</span>
    </div>
  ) : null;
}
export function SkillInput({ values, onChange }) {
  return (
    <div className="skill-input">
      <div className="chip-row">
        {values.map((skill) => (
          <span key={skill} className="skill-chip">
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() => onChange(values.filter((s) => s !== skill))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        aria-label="Add a skill"
        maxLength={50}
        placeholder="Type a skill and press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = e.currentTarget.value.trim().toLowerCase();
            if (value && !values.includes(value) && values.length < 30)
              onChange([...values, value]);
            e.currentTarget.value = "";
          }
        }}
        onBlur={(e) => {
          const value = e.target.value.trim().toLowerCase();
          if (value && !values.includes(value) && values.length < 30)
            onChange([...values, value]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function SaveDriveButton({ drive, label = false }) {
  const { saved, toggle } = useSavedDrives();
  const selected = saved.includes(drive.id);
  return (
    <button
      type="button"
      className={label ? "btn secondary" : "save-drive"}
      aria-label={
        (selected ? "Unsave " : "Save ") +
        drive.jobTitle +
        " at " +
        drive.company.name
      }
      aria-pressed={selected}
      title={selected ? "Remove from saved drives" : "Save on this browser"}
      onClick={() => toggle(drive.id)}
    >
      <Bookmark size={17} fill={selected ? "currentColor" : "none"} />
      {label && (selected ? "Drive saved" : "Save drive")}
    </button>
  );
}
export function downloadDriveCalendar(drive) {
  const escape = (value) =>
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const compact = (value) => value.replace(/-/g, "");
  const nextDay = (value) => {
    const next = new Date(value + "T12:00:00Z");
    next.setUTCDate(next.getUTCDate() + 1);
    return compact(next.toISOString().slice(0, 10));
  };
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const events = [
    [drive.deadline, "Application deadline"],
    [drive.driveDate, "Placement drive"],
  ].flatMap(([day, title], i) => [
    "BEGIN:VEVENT",
    "UID:drive-" + drive.id + "-" + i + "@placewise.local",
    "DTSTAMP:" + stamp,
    "DTSTART;VALUE=DATE:" + compact(day),
    "DTEND;VALUE=DATE:" + nextDay(day),
    "SUMMARY:" + escape(title + ": " + drive.company.name),
    "DESCRIPTION:" +
      escape(
        drive.jobTitle +
          ". Application deadline closes at 11:59 PM IST on " +
          drive.deadline +
          ". Check Placewise for updates.",
      ),
    "LOCATION:" + escape(drive.location),
    "END:VEVENT",
  ]);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Placewise//Placement Calendar//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ];
  const fold = (line) => {
    let result = "",
      bytes = 0;
    for (const char of line) {
      const size = new TextEncoder().encode(char).length;
      if (bytes + size > 75) {
        result += "\r\n ";
        bytes = 1;
      }
      result += char;
      bytes += size;
    }
    return result;
  };
  const url = URL.createObjectURL(
    new Blob([lines.map(fold).join("\r\n") + "\r\n"], {
      type: "text/calendar;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "placewise-drive-" + drive.id + ".ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
