import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  MapPin,
  Building2,
  ExternalLink,
  Pause,
  Play,
  Eye,
  UsersRound,
  CheckCircle2,
} from "lucide-react";
import { useApi, useDebounce, useToast } from "../context";
import { api, errorMessage } from "../api";
import {
  PageHeader,
  PageState,
  Empty,
  SearchInput,
  CompanyMark,
  Modal,
  Confirm,
  Field,
  FormError,
  SkillInput,
  branches,
  date,
  titleCase,
  initials,
} from "../components";
import { ProfileForm } from "./Profile";

function useDelete(resource, endpoint) {
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();
  async function remove() {
    setBusy(true);
    try {
      await api.delete(endpoint + "/" + target.id);
      notify("Record deleted.");
      setTarget(null);
      resource.reload();
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  }
  return { target, setTarget, busy, remove };
}
function CompanyForm({ company, onSave, onCancel }) {
  const [form, setForm] = useState(
    company
      ? {
          name: company.name,
          description: company.description,
          website: company.website,
          industry: company.industry,
          location: company.location,
        }
      : {
          name: "",
          description: "",
          website: "",
          industry: "Technology",
          location: "",
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <FormError error={error} />
      <div className="form-grid">
        <Field label="Company name" className="span-2">
          <input
            autoFocus
            required
            maxLength={100}
            placeholder="e.g. Microsoft"
            value={form.name}
            onChange={change("name")}
          />
        </Field>
        <Field label="Industry">
          <input
            required
            maxLength={100}
            value={form.industry}
            onChange={change("industry")}
          />
        </Field>
        <Field label="Location">
          <input
            required
            maxLength={100}
            placeholder="e.g. Hyderabad"
            value={form.location}
            onChange={change("location")}
          />
        </Field>
        <Field label="Website" className="span-2">
          <input
            required
            type="url"
            maxLength={300}
            pattern="https?://.+"
            placeholder="https://company.com"
            value={form.website}
            onChange={change("website")}
          />
        </Field>
        <Field label="About the company" className="span-2">
          <textarea
            required
            rows={4}
            maxLength={3000}
            placeholder="What makes this company a great place to grow?"
            value={form.description}
            onChange={change("description")}
          />
        </Field>
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : company ? "Save company" : "Add company"}
        </button>
      </div>
    </form>
  );
}
export function Companies() {
  const resource = useApi("/companies");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const deletion = useDelete(resource, "/companies");
  const notify = useToast();
  async function save(values) {
    await (editing.id
      ? api.put("/companies/" + editing.id, values)
      : api.post("/companies", values));
    notify(editing.id ? "Company updated." : "A new campus connection added.");
    setEditing(null);
    resource.reload();
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR CAMPUS CONNECTIONS"
        title="Great companies. Greater possibilities."
        subtitle="Build and manage the partnerships that open doors for students."
      >
        <button className="btn primary" onClick={() => setEditing({})}>
          <Plus size={17} />
          Add company
        </button>
      </PageHeader>
      <div className="management-search">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search companies or industries…"
        />
      </div>
      <PageState resource={resource}>
        {(all) => {
          const companies = all.filter((c) =>
            `${c.name} ${c.industry} ${c.location}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          );
          return (
            <>
              <div className="results-heading">
                <span>
                  <strong>{companies.length}</strong> campus partners
                </span>
              </div>
              {companies.length ? (
                <div className="company-grid">
                  {companies.map((company) => (
                    <article className="panel company-card" key={company.id}>
                      <div className="company-card-top">
                        <CompanyMark name={company.name} />
                        <span className="job-type">{company.industry}</span>
                      </div>
                      <h2>
                        <button
                          className="plain-button"
                          onClick={() => setViewing(company)}
                        >
                          {company.name}
                        </button>
                      </h2>
                      <div className="muted-row">
                        <MapPin size={14} />
                        {company.location}
                      </div>
                      <p>{company.description}</p>
                      <Link
                        className="text-link"
                        to={`/admin/drives?companyId=${company.id}`}
                      >
                        {company.driveCount} placement{" "}
                        {company.driveCount === 1 ? "drive" : "drives"}
                        <ArrowUpRight size={15} />
                      </Link>
                      <div className="company-card-actions">
                        <button
                          className="btn secondary small-btn"
                          onClick={() => setEditing(company)}
                        >
                          <Pencil size={14} />
                          Edit company
                        </button>
                        <button
                          className="icon-btn danger-text"
                          aria-label={`Delete ${company.name}`}
                          onClick={() => deletion.setTarget(company)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="panel">
                  <Empty
                    title={
                      search
                        ? "No matching partners"
                        : "Your next partnership starts here"
                    }
                    text={
                      search
                        ? "Try another company name or industry."
                        : "Add a company to create your first placement drive."
                    }
                  />
                </div>
              )}
            </>
          );
        }}
      </PageState>
      {editing && (
        <Modal
          title={editing.id ? "Edit company" : "Add a campus partner"}
          onClose={() => setEditing(null)}
        >
          <CompanyForm
            company={editing.id ? editing : null}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)}>
          <p className="company-modal-description">{viewing.description}</p>
          <p className="muted">
            {viewing.industry} · {viewing.location}
          </p>
          <div className="form-actions">
            <a
              className="btn secondary"
              href={viewing.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
              <ExternalLink size={15} />
            </a>
            <Link
              className="btn primary"
              to={`/admin/drives?companyId=${viewing.id}`}
            >
              View drives
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Modal>
      )}
      {deletion.target && (
        <Confirm
          title={`Delete ${deletion.target.name}?`}
          message="This permanently deletes the company, its drives, and all related applications. Active drives must be paused first."
          busy={deletion.busy}
          onConfirm={deletion.remove}
          onClose={() => !deletion.busy && deletion.setTarget(null)}
        />
      )}
    </>
  );
}

function DriveForm({ drive, companies, onSave, onCancel }) {
  const [form, setForm] = useState(
    drive
      ? {
          companyId: drive.company.id,
          jobTitle: drive.jobTitle,
          description: drive.description,
          salaryPackage: drive.salaryPackage,
          location: drive.location,
          driveDate: drive.driveDate,
          deadline: drive.deadline,
          minCgpa: drive.minCgpa,
          eligibleBranches: drive.eligibleBranches,
          requiredSkills: drive.requiredSkills,
          jobType: drive.jobType,
          active: drive.enabled,
        }
      : {
          companyId: companies[0]?.id || "",
          jobTitle: "",
          description: "",
          salaryPackage: "",
          location: "",
          driveDate: "",
          deadline: "",
          minCgpa: 7,
          eligibleBranches: ["CSE", "IT"],
          requiredSkills: [],
          jobType: "FULL_TIME",
          active: true,
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...form,
        companyId: Number(form.companyId),
        salaryPackage: Number(form.salaryPackage),
        minCgpa: Number(form.minCgpa),
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!companies.length)
    return (
      <Empty
        title="Start with a company"
        text="Add a company before creating a placement drive."
        action={
          <Link className="btn primary" to="/admin/companies">
            Manage companies
            <ArrowUpRight size={15} />
          </Link>
        }
      />
    );
  return (
    <form onSubmit={submit}>
      <FormError error={error} />
      <div className="form-grid">
        <Field label="Company">
          <select
            required
            value={form.companyId}
            onChange={change("companyId")}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Job title">
          <input
            autoFocus
            required
            maxLength={150}
            placeholder="e.g. Software Engineer"
            value={form.jobTitle}
            onChange={change("jobTitle")}
          />
        </Field>
        <Field label="Package (LPA)">
          <input
            required
            type="number"
            min="0"
            max="999999"
            step="0.01"
            placeholder="8.5"
            value={form.salaryPackage}
            onChange={change("salaryPackage")}
          />
        </Field>
        <Field label="Job location">
          <input
            required
            maxLength={100}
            placeholder="e.g. Bengaluru"
            value={form.location}
            onChange={change("location")}
          />
        </Field>
        <Field label="Job type">
          <select value={form.jobType} onChange={change("jobType")}>
            <option value="FULL_TIME">Full time</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </Field>
        <Field label="Minimum CGPA">
          <input
            required
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={form.minCgpa}
            onChange={change("minCgpa")}
          />
        </Field>
        <Field label="Application deadline">
          <input
            required
            type="date"
            max={form.driveDate || undefined}
            value={form.deadline}
            onChange={change("deadline")}
          />
        </Field>
        <Field label="Drive date">
          <input
            required
            type="date"
            min={form.deadline || undefined}
            value={form.driveDate}
            onChange={change("driveDate")}
          />
        </Field>
        <Field label="Job description" className="span-2">
          <textarea
            required
            rows={5}
            maxLength={6000}
            placeholder="Role overview, responsibilities, and selection process…"
            value={form.description}
            onChange={change("description")}
          />
        </Field>
      </div>
      <fieldset className="branch-fieldset">
        <legend>Eligible branches</legend>
        <div className="branch-checkboxes">
          {[...new Set([...branches, ...form.eligibleBranches])].map(
            (branch) => (
              <label key={branch}>
                <input
                  type="checkbox"
                  checked={form.eligibleBranches.includes(branch)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eligibleBranches: e.target.checked
                        ? [...form.eligibleBranches, branch]
                        : form.eligibleBranches.filter((b) => b !== branch),
                    })
                  }
                />
                {branch}
              </label>
            ),
          )}
        </div>
      </fieldset>
      <h3 className="form-section-title">Required skills</h3>
      <p className="form-description">
        Students must have every listed skill. Leave empty if none are required.
      </p>
      <SkillInput
        values={form.requiredSkills}
        onChange={(requiredSkills) => setForm({ ...form, requiredSkills })}
      />
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Activate this drive for applications
      </label>
      <div className="form-actions">
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn primary"
          disabled={busy || !form.eligibleBranches.length}
        >
          {busy ? "Saving…" : drive ? "Save drive" : "Create drive"}
        </button>
      </div>
    </form>
  );
}
export function ManageDrives() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const companyId = params.get("companyId");
  const query = new URLSearchParams();
  const debounced = useDebounce(search);
  if (debounced) query.set("search", debounced);
  if (companyId) query.set("companyId", companyId);
  if (active) query.set("active", active);
  const resource = useApi("/drives?" + query.toString());
  const companyResource = useApi("/companies");
  const [editing, setEditing] = useState(params.get("new") ? {} : null);
  const [toggling, setToggling] = useState(null);
  const deletion = useDelete(resource, "/drives");
  const notify = useToast();
  const closeEditor = () => {
    setEditing(null);
    if (params.has("new")) {
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  };
  async function save(values) {
    await (editing.id
      ? api.put("/drives/" + editing.id, values)
      : api.post("/drives", values));
    notify(
      editing.id
        ? "Placement drive updated."
        : "Your new placement drive is ready.",
    );
    closeEditor();
    resource.reload();
    companyResource.reload();
  }
  async function toggle(drive) {
    setToggling(drive.id);
    try {
      await api.patch("/drives/" + drive.id + "/active", {
        active: !drive.enabled,
      });
      notify(
        drive.enabled
          ? "Drive paused."
          : "Drive enabled. Past deadlines remain closed.",
      );
      resource.reload();
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setToggling(null);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="TURN CONNECTIONS INTO CAREERS"
        title="Opportunities, in the making."
        subtitle="Create drives, set eligibility, and bring your campus closer to its next chapter."
      >
        <button className="btn primary" onClick={() => setEditing({})}>
          <Plus size={17} />
          Create drive
        </button>
      </PageHeader>
      <section className="panel">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search company, role, or location…"
          />
          <div className="toolbar-selects">
            <select
              aria-label="Filter company"
              value={companyId || ""}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                e.target.value
                  ? next.set("companyId", e.target.value)
                  : next.delete("companyId");
                setParams(next);
              }}
            >
              <option value="">All companies</option>
              {companyResource.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter drive availability"
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              <option value="">All drives</option>
              <option value="true">Active</option>
              <option value="false">Closed / paused</option>
            </select>
          </div>
        </div>
        <PageState resource={resource}>
          {(drives) =>
            drives.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Company & role</th>
                      <th>Package</th>
                      <th>Deadline</th>
                      <th>Applicants</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drives.map((d) => (
                      <tr key={d.id}>
                        <td>
                          <div className="company-cell">
                            <CompanyMark name={d.company.name} small />
                            <div>
                              <Link
                                className="table-title-link"
                                to={`/drives/${d.id}`}
                              >
                                {d.company.name}
                              </Link>
                              <small>{d.jobTitle}</small>
                            </div>
                          </div>
                        </td>
                        <td>₹{Number(d.salaryPackage)} LPA</td>
                        <td>{date(d.deadline, { year: "numeric" })}</td>
                        <td>
                          <Link
                            className="text-link"
                            to={`/admin/applications?driveId=${d.id}`}
                          >
                            {d.applicantCount}
                            <ArrowUpRight size={13} />
                          </Link>
                        </td>
                        <td>
                          <span
                            className={`badge ${d.active ? "status-selected" : d.enabled ? "status-rejected" : "status-applied"}`}
                          >
                            <i />
                            {d.active
                              ? "Active"
                              : d.enabled
                                ? "Expired"
                                : "Paused"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              title="Edit drive"
                              aria-label={`Edit ${d.jobTitle} at ${d.company.name}`}
                              onClick={() => setEditing(d)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="icon-btn"
                              title={d.enabled ? "Pause drive" : "Enable drive"}
                              aria-label={`${d.enabled ? "Pause" : "Enable"} ${d.company.name} drive`}
                              disabled={toggling === d.id}
                              onClick={() => toggle(d)}
                            >
                              {d.enabled ? (
                                <Pause size={15} />
                              ) : (
                                <Play size={15} />
                              )}
                            </button>
                            <button
                              className="icon-btn danger-text"
                              title="Delete drive"
                              aria-label={`Delete ${d.jobTitle} at ${d.company.name}`}
                              onClick={() => deletion.setTarget(d)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="No drives to show"
                text="Create a placement drive or try another filter."
              />
            )
          }
        </PageState>
      </section>
      {editing && (
        <Modal
          title={
            editing.id ? "Edit placement drive" : "Create a placement drive"
          }
          wide
          onClose={closeEditor}
        >
          <PageState resource={companyResource}>
            {(companies) => (
              <DriveForm
                drive={editing.id ? editing : null}
                companies={companies}
                onSave={save}
                onCancel={closeEditor}
              />
            )}
          </PageState>
        </Modal>
      )}
      {deletion.target && (
        <Confirm
          title="Delete this placement drive?"
          message={`This permanently removes ${deletion.target.jobTitle} at ${deletion.target.company.name} and all related student applications.`}
          onClose={() => !deletion.busy && deletion.setTarget(null)}
          onConfirm={deletion.remove}
          busy={deletion.busy}
        />
      )}
    </>
  );
}
export function Students() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const resource = useApi("/students?search=" + encodeURIComponent(debounced));
  const [editing, setEditing] = useState(null);
  const deletion = useDelete(resource, "/students");
  const notify = useToast();
  async function save(values) {
    await api.put("/students/" + editing.id, values);
    notify("Student profile updated.");
    setEditing(null);
    resource.reload();
  }
  return (
    <>
      <PageHeader
        eyebrow="POTENTIAL, MEET POSSIBILITY"
        title="The people behind the progress."
        subtitle="Manage student profiles, academic details, and placement readiness."
      />
      <section className="panel">
        <div className="table-toolbar">
          <div>
            <h2>Campus directory</h2>
            <span>{resource.data?.length ?? "—"} students</span>
          </div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, roll number, or branch…"
          />
        </div>
        <PageState resource={resource}>
          {(students) =>
            students.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll number</th>
                      <th>Branch / year</th>
                      <th>CGPA</th>
                      <th>Placement</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="person-cell">
                            <span className="avatar mini">
                              {initials(s.fullName)}
                            </span>
                            <div>
                              <strong>{s.fullName}</strong>
                              <small>{s.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{s.rollNumber}</td>
                        <td>
                          {s.branch} · Year {s.year}
                        </td>
                        <td>
                          <strong>{Number(s.cgpa).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${s.placed ? "status-selected" : "status-shortlisted"}`}
                          >
                            <i />
                            {s.placed ? "Selected" : "In progress"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              aria-label={`Edit ${s.fullName}`}
                              onClick={() => setEditing(s)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-btn danger-text"
                              aria-label={`Delete ${s.fullName}`}
                              onClick={() => deletion.setTarget(s)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="No students found"
                text="Registered students will appear here. Try a different search."
              />
            )
          }
        </PageState>
      </section>
      {editing && (
        <Modal
          title={`Edit ${editing.fullName}`}
          wide
          onClose={() => setEditing(null)}
        >
          <ProfileForm
            student={editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {deletion.target && (
        <Confirm
          title={`Delete ${deletion.target.fullName}?`}
          message="This permanently removes the student's account, profile, and all applications. The student will no longer be able to sign in."
          busy={deletion.busy}
          onConfirm={deletion.remove}
          onClose={() => !deletion.busy && deletion.setTarget(null)}
        />
      )}
    </>
  );
}
