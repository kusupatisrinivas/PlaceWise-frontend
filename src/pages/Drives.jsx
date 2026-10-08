import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  CalendarDays,
  MapPin,
  IndianRupee,
  GraduationCap,
  BriefcaseBusiness,
  SlidersHorizontal,
  ExternalLink,
  Clock3,
  UsersRound,
} from "lucide-react";
import {
  useApi,
  useAuth,
  useDebounce,
  useToast,
  useSavedDrives,
} from "../context";
import { api, errorMessage } from "../api";
import {
  PageHeader,
  PageState,
  DriveCard,
  Empty,
  SearchInput,
  branches,
  CompanyMark,
  date,
  titleCase,
  FormError,
  SaveDriveButton,
  downloadDriveCalendar,
} from "../components";

export function Drives() {
  const [params, setParams] = useSearchParams();
  const { saved } = useSavedDrives();
  const { user } = useAuth();
  const admin = user.role === "ROLE_ADMIN";
  const view = params.get("view") || "all";
  const sort = params.get("sort") || "deadline";
  const [search, setSearch] = useState(params.get("search") || "");
  const debounced = useDebounce(search);
  const query = new URLSearchParams(params);
  query.delete("new");
  query.delete("view");
  query.delete("sort");
  if (debounced) query.set("search", debounced);
  else query.delete("search");
  if (!query.has("active")) query.set("active", "true");
  const resource = useApi("/drives?" + query.toString());
  function filter(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <>
      <PageHeader
        eyebrow="CAREER OPPORTUNITIES"
        title="Placement drives"
        subtitle="Compare opportunities, check your eligibility, and plan your next application."
      />
      <div className="drive-filter-panel">
        <div className="filter-top">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              filter("search", value);
            }}
            placeholder="Search by company, role, or location…"
          />
          <span className="filter-label">
            <SlidersHorizontal size={16} />
            Find your fit
          </span>
        </div>
        <div className="filter-row">
          <label>
            <span>Branch</span>
            <select
              value={params.get("branch") || ""}
              onChange={(e) => filter("branch", e.target.value)}
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Your CGPA</span>
            <select
              value={params.get("maxCgpa") || ""}
              onChange={(e) => filter("maxCgpa", e.target.value)}
            >
              <option value="">Any requirement</option>
              {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} or below
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Package</span>
            <select
              value={params.get("minPackage") || ""}
              onChange={(e) => filter("minPackage", e.target.value)}
            >
              <option value="">Any package</option>
              {[5, 8, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  ₹{n}+ LPA
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Job type</span>
            <select
              value={params.get("jobType") || ""}
              onChange={(e) => filter("jobType", e.target.value)}
            >
              <option value="">All job types</option>
              <option value="FULL_TIME">Full time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </label>
          <label>
            <span>Availability</span>
            <select
              value={params.get("active") ?? "true"}
              onChange={(e) => filter("active", e.target.value)}
            >
              <option value="true">Open drives</option>
              <option value="false">Closed drives</option>
            </select>
          </label>
          <button
            className="clear-filters"
            onClick={() => {
              setSearch("");
              setParams({});
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="drive-tools">
        <div className="drive-tabs" aria-label="Drive views">
          {[
            ["all", "All drives"],
            ...(!admin
              ? [
                  ["eligible", "Eligible for me"],
                  ["saved", "Saved (" + saved.length + ")"],
                ]
              : []),
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={view === value}
              className={view === value ? "active" : ""}
              onClick={() => filter("view", value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="sort-control">
          Sort by
          <select value={sort} onChange={(e) => filter("sort", e.target.value)}>
            <option value="deadline">Deadline: soonest</option>
            <option value="package">Package: highest</option>
            <option value="company">Company: A to Z</option>
          </select>
        </label>
      </div>
      <PageState resource={resource}>
        {(all) => {
          const drives = all
            .filter((d) =>
              view === "saved"
                ? saved.includes(d.id)
                : view === "eligible"
                  ? d.eligibility?.eligible && !d.applied
                  : true,
            )
            .sort((a, b) =>
              sort === "package"
                ? Number(b.salaryPackage) - Number(a.salaryPackage)
                : sort === "company"
                  ? a.company.name.localeCompare(b.company.name)
                  : a.deadline.localeCompare(b.deadline),
            );
          return (
            <>
              <div className="results-heading" aria-live="polite">
                <span>
                  <strong>{drives.length}</strong>{" "}
                  {drives.length === 1 ? "opportunity" : "opportunities"}
                </span>
                <span>
                  {view === "saved"
                    ? "Saved on this browser · current filters apply"
                    : "Eligibility is based on your current profile"}
                </span>
              </div>
              {drives.length ? (
                <div className="drive-grid listing-grid">
                  {drives.map((d) => (
                    <DriveCard key={d.id} drive={d} admin={admin} />
                  ))}
                </div>
              ) : (
                <div className="panel">
                  <Empty
                    title={
                      view === "saved"
                        ? "No saved drives match"
                        : "No matching opportunities"
                    }
                    text={
                      view === "saved"
                        ? "Bookmark a drive to revisit it here, or clear your filters."
                        : view === "eligible"
                          ? "Update your profile and skills, or explore all drives to check the requirements."
                          : "Try a different search or clear your filters."
                    }
                    action={
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setSearch("");
                          setParams({});
                        }}
                      >
                        Show all drives
                      </button>
                    }
                  />
                </div>
              )}
            </>
          );
        }}
      </PageState>
    </>
  );
}
export function DriveDetails() {
  const { id } = useParams();
  const resource = useApi("/drives/" + id);
  const { user } = useAuth();
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const admin = user.role === "ROLE_ADMIN";
  async function apply() {
    setBusy(true);
    setError("");
    try {
      await api.post("/applications", { driveId: Number(id) });
      notify("Application submitted. Your next chapter is in motion!");
      resource.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to={admin ? "/admin/drives" : "/drives"}>
        <ArrowLeft size={16} />
        All placement drives
      </Link>
      <PageState resource={resource}>
        {(drive) => (
          <>
            <div className="detail-heading">
              <CompanyMark name={drive.company.name} />
              <div>
                <div className="company-name">{drive.company.name}</div>
                <h1>{drive.jobTitle}</h1>
                <div className="detail-meta">
                  <span>
                    <MapPin size={15} />
                    {drive.location}
                  </span>
                  <span>
                    <BriefcaseBusiness size={15} />
                    {titleCase(drive.jobType)}
                  </span>
                  <span
                    className={`badge ${drive.active ? "status-selected" : "status-rejected"}`}
                  >
                    <i />
                    {drive.active ? "Applications open" : "Applications closed"}
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-actions">
              {!admin && <SaveDriveButton drive={drive} label />}
              <button
                className="btn secondary"
                onClick={() => downloadDriveCalendar(drive)}
              >
                <CalendarDays size={17} />
                Add to calendar
              </button>
              <span>Download drive and deadline dates to your calendar.</span>
            </div>
            <div className="details-grid">
              <div>
                <section className="panel job-description">
                  <h2>Your next opportunity</h2>
                  <div className="description-text">{drive.description}</div>
                  <h2>Skills you'll bring</h2>
                  <div className="chip-row">
                    {drive.requiredSkills.length ? (
                      drive.requiredSkills.map((s) => (
                        <span className="skill-chip" key={s}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="muted">
                        No specific skills required.
                      </span>
                    )}
                  </div>
                  <h2>About {drive.company.name}</h2>
                  <p>{drive.company.description}</p>
                  <a
                    className="text-link"
                    href={drive.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit company website
                    <ExternalLink size={14} />
                  </a>
                </section>
              </div>
              <aside>
                <section className="panel drive-summary">
                  <h2>The details</h2>
                  {[
                    [
                      IndianRupee,
                      "Annual package",
                      `₹${Number(drive.salaryPackage)} LPA`,
                    ],
                    [
                      CalendarDays,
                      "Drive date",
                      date(drive.driveDate, { year: "numeric" }),
                    ],
                    [
                      Clock3,
                      "Apply before",
                      date(drive.deadline, { year: "numeric" }),
                    ],
                    [GraduationCap, "Minimum CGPA", Number(drive.minCgpa)],
                    [
                      UsersRound,
                      "Eligible branches",
                      drive.eligibleBranches.join(", "),
                    ],
                  ].map(([Icon, label, value]) => (
                    <div className="summary-row" key={label}>
                      <Icon size={18} />
                      <div>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </div>
                    </div>
                  ))}
                  <p className="deadline-note">
                    Deadline: 11:59 PM IST on the listed day.
                  </p>
                </section>
                <section
                  className={`eligibility-panel ${drive.eligibility?.eligible || drive.applied ? "eligible" : ""}`}
                >
                  {admin ? (
                    <>
                      <h3>{drive.applicantCount} applicants</h3>
                      <p>
                        Review profiles and move candidates to their next stage.
                      </p>
                      <Link
                        className="btn primary full"
                        to={`/admin/applications?driveId=${id}`}
                      >
                        View applicants
                        <ArrowUpRight size={17} />
                      </Link>
                    </>
                  ) : drive.applied ? (
                    <>
                      <CheckCircle2 size={26} />
                      <h3>You're in the running.</h3>
                      <p>
                        Your application has been submitted. Keep an eye on what
                        comes next.
                      </p>
                      <Link className="btn secondary full" to="/applications">
                        Track application
                        <ArrowUpRight size={17} />
                      </Link>
                    </>
                  ) : (
                    <>
                      {drive.eligibility?.eligible ? (
                        <CheckCircle2 size={26} />
                      ) : (
                        <XCircle size={26} />
                      )}
                      <h3>
                        {drive.eligibility?.eligible
                          ? "You're eligible. Go for it!"
                          : "A few requirements to check."}
                      </h3>
                      {drive.eligibility?.eligible ? (
                        <p>
                          Your profile meets all the requirements for this
                          opportunity.
                        </p>
                      ) : (
                        <ul>
                          {drive.eligibility?.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      )}
                      <FormError error={error} />
                      <button
                        className="btn primary full"
                        onClick={apply}
                        disabled={
                          busy || !drive.eligibility?.eligible || !drive.active
                        }
                      >
                        {busy ? "Submitting…" : "Apply for this drive"}
                        <ArrowUpRight size={17} />
                      </button>
                      {!drive.eligibility?.eligible && (
                        <Link className="text-link" to="/profile">
                          Review your profile
                          <ArrowUpRight size={14} />
                        </Link>
                      )}
                    </>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </PageState>
    </>
  );
}
