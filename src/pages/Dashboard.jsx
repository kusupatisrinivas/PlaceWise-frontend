import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  CheckCheck,
  Trophy,
  UsersRound,
  Building2,
  CalendarDays,
  Sparkles,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { useAuth, useApi } from "../context";
import {
  PageState,
  PageHeader,
  StatCard,
  SectionHeader,
  DriveCard,
  ApplicationsTable,
  Empty,
  date,
  CompanyMark,
} from "../components";

function Upcoming({ drives }) {
  return (
    <section className="panel schedule-panel">
      <SectionHeader
        title="Upcoming drives"
        subtitle="Your campus placement calendar"
      />
      {drives.length ? (
        drives.map((d) => (
          <Link to={`/drives/${d.id}`} className="schedule-item" key={d.id}>
            <div className="date-tile">
              <strong>{new Date(d.driveDate + "T12:00:00").getDate()}</strong>
              <span>
                {new Date(d.driveDate + "T12:00:00").toLocaleString("en-IN", {
                  month: "short",
                })}
              </span>
            </div>
            <div>
              <strong>{d.company.name}</strong>
              <small>{d.jobTitle}</small>
              <span>
                <span className="live-dot" />
                Campus drive
              </span>
            </div>
            <ArrowUpRight size={16} />
          </Link>
        ))
      ) : (
        <Empty
          title="A clear calendar"
          text="New drive dates will appear here."
        />
      )}
      <div className="schedule-note">
        <CalendarDays size={16} />
        <span>Deadlines close at the end of the listed day (IST).</span>
      </div>
    </section>
  );
}
export function StudentDashboard() {
  const resource = useApi("/dashboard/student");
  const { user } = useAuth();
  return (
    <PageState resource={resource}>
      {(data) => (
        <>
          <PageHeader
            title={`Welcome back, ${user.fullName.split(" ")[0]}`}
            subtitle="Track your applications, deadlines, and upcoming opportunities."
          >
            <span className="date-label">
              <CalendarDays size={16} />
              {date(new Date().toISOString(), {
                weekday: "short",
                year: "numeric",
              })}
            </span>
          </PageHeader>
          <section className="welcome-banner">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                YOUR CAREER WORKSPACE
              </div>
              <h2>Your next opportunity starts here.</h2>
              <p>
                Explore open roles, save your shortlist, and apply with
                confidence.
              </p>
              <Link to="/drives" className="btn primary">
                Explore placement drives
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="banner-orbit" />
              <div className="banner-arrow">
                <ArrowUpRight size={70} strokeWidth={1.5} />
              </div>
              <span className="banner-spark one">✦</span>
              <span className="banner-spark two">✧</span>
              <div className="banner-tag">
                <Sparkles size={14} />
                Plan. Apply. Progress.
              </div>
            </div>
          </section>
          <div className="stats-grid">
            <StatCard
              label="Available drives"
              value={data.availableDrives}
              icon={BriefcaseBusiness}
              foot="Open for applications"
            />
            <StatCard
              label="My applications"
              value={data.applications}
              icon={FileText}
              tone="blue"
              foot="Steps toward your next chapter"
            />
            <StatCard
              label="Shortlisted"
              value={data.shortlisted}
              icon={CheckCheck}
              tone="amber"
              foot="You're on their radar"
            />
            <StatCard
              label="Selected"
              value={data.selected}
              icon={Trophy}
              tone="purple"
              foot={
                data.selected
                  ? "Your hard work is paying off!"
                  : "Your opportunity is ahead"
              }
            />
          </div>
          <section className="section-block">
            <SectionHeader
              title="Find your next opportunity"
              subtitle="Fresh possibilities from your campus placement cell."
              to="/drives"
              label="Browse all drives"
            />
            {data.upcomingDrives.length ? (
              <div className="drive-grid">
                {data.upcomingDrives.map((d) => (
                  <DriveCard key={d.id} drive={d} />
                ))}
              </div>
            ) : (
              <div className="panel">
                <Empty
                  title="You're all caught up"
                  text="Check back for new placement drives."
                />
              </div>
            )}
          </section>
          <div className="dashboard-bottom">
            <section className="panel">
              <SectionHeader
                title="Your application journey"
                subtitle="Your latest applications and recruitment stages."
                to="/applications"
                label="View all"
              />
              {data.recentApplications.length ? (
                <ApplicationsTable applications={data.recentApplications} />
              ) : (
                <Empty
                  title="Your journey starts here"
                  text="Apply to an eligible drive to start tracking your progress."
                  action={
                    <Link className="btn secondary" to="/drives">
                      Explore drives
                      <ArrowRight size={15} />
                    </Link>
                  }
                />
              )}
            </section>
            <Upcoming drives={data.upcomingDrives} />
          </div>
          <div className="profile-nudge">
            <span className="nudge-icon">
              <GraduationCap size={22} />
            </span>
            <div>
              <strong>A profile that opens doors.</strong>
              <p>
                {data.student.branch} · Year {data.student.year} ·{" "}
                {Number(data.student.cgpa)} CGPA · {data.student.skills.length}{" "}
                skills added
              </p>
            </div>
            <Link className="text-link" to="/profile">
              Keep it up to date
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </>
      )}
    </PageState>
  );
}
function BarChart({ items, color = "green" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return items.length ? (
    <div className={`bar-chart ${color}`}>
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <span>{item.label}</span>
          <div>
            <i style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  ) : (
    <Empty
      title="No applications yet"
      text="Application data will appear as students apply."
    />
  );
}
export function AdminDashboard() {
  const resource = useApi("/dashboard/admin");
  return (
    <PageState resource={resource}>
      {(data) => (
        <>
          <PageHeader
            eyebrow="THE BIG PICTURE"
            title="Every student. A brighter future."
            subtitle="Your campus placement activity, all in one place."
          >
            <Link className="btn primary" to="/admin/drives?new=true">
              Create a drive
              <ArrowUpRight size={17} />
            </Link>
          </PageHeader>
          <div className="stats-grid admin-stats">
            <StatCard
              label="Total students"
              value={data.totalStudents}
              icon={UsersRound}
              foot="Registered with your campus"
            />
            <StatCard
              label="Partner companies"
              value={data.totalCompanies}
              icon={Building2}
              tone="blue"
              foot="Connections that create careers"
            />
            <StatCard
              label="Active drives"
              value={data.activeDrives}
              icon={BriefcaseBusiness}
              tone="amber"
              foot="Accepting applications"
            />
            <StatCard
              label="Applications"
              value={data.totalApplications}
              icon={FileText}
              tone="purple"
              foot="Opportunities in motion"
            />
            <StatCard
              label="Selected students"
              value={data.selectedStudents}
              icon={Trophy}
              foot="Distinct students with an offer"
            />
          </div>
          <div className="analytics-grid">
            <section className="panel">
              <SectionHeader
                title="Applications by company"
                subtitle="Where your students are making their move."
              />
              <BarChart items={data.applicationsByCompany} />
            </section>
            <section className="panel outcomes">
              <SectionHeader
                title="Student outcomes"
                subtitle="Every selection is a new beginning."
              />
              <div className="donut-wrap">
                <div
                  className="donut"
                  role="img"
                  aria-label={`${data.selectedStudents} of ${data.totalStudents} students selected`}
                  style={{
                    "--percent": `${data.totalStudents ? (data.selectedStudents / data.totalStudents) * 100 : 0}%`,
                  }}
                >
                  <div>
                    <strong>{data.selectedStudents}</strong>
                    <span>students selected</span>
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <span>
                  <i />
                  {data.selectedStudents} selected
                </span>
                <span>
                  <i />
                  {data.totalStudents - data.selectedStudents} awaiting
                  selection
                </span>
              </div>
            </section>
          </div>
          <div className="analytics-grid second">
            <section className="panel">
              <SectionHeader
                title="Applications by branch"
                subtitle="Participation across your campus."
              />
              <BarChart items={data.applicationsByBranch} color="blue" />
            </section>
            <Upcoming drives={data.upcomingDrives} />
          </div>
          <section className="panel section-block">
            <SectionHeader
              title="Recent applications"
              subtitle="Meet the students taking their next step."
              to="/admin/applications"
              label="Review applications"
            />
            {data.recentApplications.length ? (
              <ApplicationsTable applications={data.recentApplications} admin />
            ) : (
              <Empty title="No applications yet" />
            )}
          </section>
        </>
      )}
    </PageState>
  );
}
