import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, FileText } from "lucide-react";
import { useApi, useToast } from "../context";
import { api, errorMessage } from "../api";
import {
  PageHeader,
  PageState,
  ApplicationsTable,
  Empty,
  SearchInput,
  statuses,
  titleCase,
} from "../components";

export function Applications({ admin = false }) {
  const [params] = useSearchParams();
  const driveId = params.get("driveId");
  const resource = useApi(
    admin
      ? driveId
        ? "/applications/drive/" + driveId
        : "/applications"
      : "/applications/my",
  );
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const notify = useToast();
  async function changeStatus(id, next) {
    setUpdating(id);
    try {
      await api.put("/applications/" + id + "/status", { status: next });
      notify("Application moved to " + titleCase(next) + ".");
      resource.reload();
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setUpdating(null);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow={
          admin ? "CONNECT POTENTIAL WITH POSSIBILITY" : "EVERY STEP COUNTS"
        }
        title={admin ? "Application management" : "My applications"}
        subtitle={
          admin
            ? "Review candidates and manage each stage of recruitment."
            : "Track your applications from submission through selection."
        }
      >
        {admin && driveId ? (
          <Link className="btn secondary" to="/admin/applications">
            All applications
          </Link>
        ) : (
          !admin && (
            <Link className="btn primary" to="/drives">
              Explore more drives
              <ArrowUpRight size={17} />
            </Link>
          )
        )}
      </PageHeader>
      <PageState resource={resource}>
        {(all) => {
          const filtered = all.filter(
            (a) =>
              (!status || a.status === status) &&
              `${a.company} ${a.jobTitle} ${a.student.fullName} ${a.student.rollNumber}`
                .toLowerCase()
                .includes(search.toLowerCase()),
          );
          return (
            <>
              <div className="application-tabs">
                <button
                  className={!status ? "active" : ""}
                  onClick={() => setStatus("")}
                >
                  All applications<span>{all.length}</span>
                </button>
                {statuses.map((s) => (
                  <button
                    key={s}
                    className={status === s ? "active" : ""}
                    onClick={() => setStatus(s)}
                  >
                    {titleCase(s)}
                    <span>{all.filter((a) => a.status === s).length}</span>
                  </button>
                ))}
              </div>
              <section className="panel">
                <div className="table-toolbar">
                  <div>
                    <h2>
                      {admin ? "Candidate applications" : "Your applications"}
                    </h2>
                    <span>
                      {filtered.length}{" "}
                      {filtered.length === 1 ? "application" : "applications"}
                      {driveId && all[0]
                        ? ` · ${all[0].company} — ${all[0].jobTitle}`
                        : ""}
                    </span>
                  </div>
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={
                      admin
                        ? "Search candidate, company, or role…"
                        : "Search company or role…"
                    }
                  />
                </div>
                {filtered.length ? (
                  <ApplicationsTable
                    applications={filtered}
                    admin={admin}
                    onStatus={admin ? changeStatus : undefined}
                    updating={updating}
                  />
                ) : (
                  <Empty
                    title={
                      all.length
                        ? "No matching applications"
                        : "Your journey is just beginning"
                    }
                    text={
                      all.length
                        ? "Try another status or search term."
                        : admin
                          ? "New student applications will appear here."
                          : "Discover an eligible drive and send your first application."
                    }
                    action={
                      !admin &&
                      !all.length && (
                        <Link className="btn secondary" to="/drives">
                          Find an opportunity
                          <ArrowUpRight size={16} />
                        </Link>
                      )
                    }
                  />
                )}
              </section>
              {!admin && (
                <div className="application-note">
                  <FileText size={18} />
                  <p>
                    Your placement officer updates each stage. Check back after
                    assessments and interviews for the latest status.
                  </p>
                </div>
              )}
            </>
          );
        }}
      </PageState>
    </>
  );
}
