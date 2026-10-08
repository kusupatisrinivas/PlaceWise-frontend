import { useState } from "react";
import {
  Save,
  ShieldCheck,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { useApi, useAuth, useToast } from "../context";
import { api, errorMessage } from "../api";
import {
  PageHeader,
  PageState,
  Field,
  FormError,
  SkillInput,
  branches,
  initials,
} from "../components";

export function ProfileForm({ student, onSave, onCancel }) {
  const [form, setForm] = useState({
    fullName: student.fullName,
    rollNumber: student.rollNumber,
    branch: student.branch,
    year: student.year,
    cgpa: student.cgpa,
    phone: student.phone,
    skills: student.skills,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...form,
        year: Number(form.year),
        cgpa: Number(form.cgpa),
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <FormError error={error} />
      <h3 className="form-section-title">Personal & academic details</h3>
      <div className="form-grid">
        <Field label="Full name">
          <input
            required
            maxLength={100}
            value={form.fullName}
            onChange={change("fullName")}
          />
        </Field>
        <Field
          label="Email address"
          hint="Your email is your account identifier."
        >
          <input type="email" disabled value={student.email} />
        </Field>
        <Field label="Roll number">
          <input
            required
            pattern="[A-Za-z0-9-]{3,30}"
            value={form.rollNumber}
            onChange={change("rollNumber")}
          />
        </Field>
        <Field label="Phone number">
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            maxLength={10}
            title="Enter 10 digits"
            value={form.phone}
            onChange={change("phone")}
          />
        </Field>
        <Field label="Branch">
          <select value={form.branch} onChange={change("branch")}>
            {[...new Set([...branches, form.branch])].map((b) => (
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
        <Field label="CGPA" hint="Your latest cumulative grade point average.">
          <input
            required
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={form.cgpa}
            onChange={change("cgpa")}
          />
        </Field>
      </div>
      <div className="form-divider" />
      <h3 className="form-section-title">Your skills</h3>
      <p className="form-description">
        Add skills you've learned. These help us check your eligibility for
        drives.
      </p>
      <SkillInput
        values={form.skills}
        onChange={(skills) => setForm({ ...form, skills })}
      />
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        )}
        <button className="btn primary" disabled={busy}>
          <Save size={16} />
          {busy ? "Saving changes…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
export function Profile() {
  const resource = useApi("/students/profile");
  const { updateName } = useAuth();
  const notify = useToast();
  async function save(values) {
    await api.put("/students/profile", values);
    updateName(values.fullName);
    notify("Your profile is up to date.");
    resource.reload();
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR STORY STARTS HERE"
        title="A profile full of potential."
        subtitle="Help the right opportunities find you. Keep your details current."
      />
      <PageState resource={resource}>
        {(student) => (
          <div className="profile-grid">
            <aside>
              <section className="panel profile-card">
                <span className="avatar profile-avatar">
                  {initials(student.fullName)}
                </span>
                <h2>{student.fullName}</h2>
                <p>{student.rollNumber}</p>
                <span
                  className={`badge ${student.placed ? "status-selected" : "status-shortlisted"}`}
                >
                  <i />
                  {student.placed
                    ? "Selected for a role"
                    : "Open to opportunities"}
                </span>
                <div className="profile-facts">
                  <div>
                    <GraduationCap size={17} />
                    {student.branch} · Year {student.year}
                  </div>
                  <div>
                    <Mail size={17} />
                    {student.email}
                  </div>
                  <div>
                    <Phone size={17} />
                    {student.phone}
                  </div>
                </div>
                <div className="profile-numbers">
                  <div>
                    <strong>{Number(student.cgpa)}</strong>
                    <span>CGPA</span>
                  </div>
                  <div>
                    <strong>{student.skills.length}</strong>
                    <span>Skills added</span>
                  </div>
                </div>
              </section>
              <div className="profile-tip">
                <ShieldCheck size={22} />
                <div>
                  <strong>Your details matter.</strong>
                  <p>
                    Eligibility is checked against your latest profile every
                    time you apply.
                  </p>
                </div>
              </div>
            </aside>
            <section className="panel profile-form">
              <ProfileForm student={student} onSave={save} />
            </section>
          </div>
        )}
      </PageState>
    </>
  );
}
