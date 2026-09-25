import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import { endpoints } from "./lib/api";
import { supabase } from "./lib/supabase";
import { FreshJobs } from "./pages/FreshJobs";
import type {
  CandidateProfile,
  CurrentProfile,
  Health,
  IpRule,
  Resume,
  AuditEvent,
} from "./types";
import "./styles.css";

type Page =
  | "overview"
  | "resumes"
  | "profile"
  | "fresh-jobs"
  | "security"
  | "system"
  | "unavailable";
const pageFromHash = (): Page => {
  const value = location.hash.replace("#/", "").split("?")[0];
  const routes: Record<string, Page> = {
    "": "overview",
    overview: "overview",
    resumes: "resumes",
    profile: "profile",
    "candidate-profile": "profile",
    security: "security",
    "ip-security": "security",
    system: "system",
    "system-health": "system",
    unavailable: "unavailable",
    "fresh-jobs": "fresh-jobs",
    "recommended-jobs": "unavailable",
    tracking: "unavailable",
  };
  return routes[value] ?? "overview";
};
const fmtDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
const fmtBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function App() {
  const [session, setSession] = useState(Boolean(supabase));
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [page, setPage] = useState<Page>(pageFromHash());
  const [dark, setDark] = useState(
    localStorage.getItem("hnt-theme") === "dark",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("hnt-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(Boolean(next)),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (session)
      endpoints
        .me()
        .then(setProfile)
        .catch(() => setProfile(null));
    else setProfile(null);
  }, [session]);
  if (!supabase) return <SetupScreen />;
  if (!session) return <Login onLogin={() => setSession(true)} />;
  const client = supabase;
  return (
    <Shell
      profile={profile}
      page={page}
      dark={dark}
      setDark={setDark}
      onLogout={async () => {
        await client.auth.signOut();
        setSession(false);
      }}
    />
  );
}

function SetupScreen() {
  return (
    <main className="center-screen">
      <div className="setup-card">
        <Logo />
        <h1>Connect your workspace</h1>
        <p>
          Add <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> to the frontend environment, then
          restart Vite.
        </p>
        <p className="muted">
          The browser only needs the public Supabase key. The backend secret
          stays server-side.
        </p>
      </div>
    </main>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">H</span>
      <span>
        Hire<span>And</span>Tech
      </span>
    </div>
  );
}
function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await supabase!.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    else onLogin();
    setBusy(false);
  };
  return (
    <main className="auth-screen">
      <div className="auth-panel">
        <Logo />
        <div className="eyebrow">Private workspace</div>
        <h1>Welcome back.</h1>
        <p className="lead">
          Your hiring intelligence workspace, grounded in your real candidate
          profile.
        </p>
        <form onSubmit={submit} className="stack">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="primary full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
          </button>
        </form>
        <p className="muted tiny">
          Accounts are managed through Supabase Auth. There is no public signup
          endpoint in the backend.
        </p>
      </div>
      <div className="auth-art">
        <div className="orb" />
        <div className="art-copy">
          <span>FOUNDATION PHASE</span>
          <strong>
            Build your next
            <br />
            career move.
          </strong>
        </div>
      </div>
    </main>
  );
}

function Shell({
  profile,
  page,
  dark,
  setDark,
  onLogout,
}: {
  profile: CurrentProfile | null;
  page: Page;
  dark: boolean;
  setDark: (v: boolean) => void;
  onLogout: () => void;
}) {
  const [mobile, setMobile] = useState(false);
  const nav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Fresh jobs", icon: BriefcaseBusiness },
    { label: "Resumes", icon: FileText },
    { label: "Candidate profile", icon: UserRound },
  ];
  const future = [
    { label: "Recommended jobs", icon: Search },
    { label: "Tracking", icon: Activity },
  ];
  return (
    <div className="app-shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="icon-button mobile-close"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Workspace</div>
          {nav.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={page === item.label.toLowerCase().replaceAll(" ", "-")}
            />
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-label">Planned product areas</div>
          {future.map((item) => (
            <NavItem key={item.label} {...item} active={false} />
          ))}
        </div>
        {profile?.role === "admin" && (
          <div className="nav-group">
            <div className="nav-label">Administration</div>
            <NavItem
              label="IP security"
              icon={ShieldCheck}
              active={page === "security"}
            />
            <NavItem
              label="System health"
              icon={Fingerprint}
              active={page === "system"}
            />
          </div>
        )}
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            <span>{dark ? "Light theme" : "Dark theme"}</span>
          </button>
          <button className="profile-chip" onClick={onLogout}>
            <span className="avatar">
              {profile?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="profile-meta">
              <b>{profile?.email ?? "Loading profile…"}</b>
              <small>{profile?.role ?? "workspace member"}</small>
            </span>
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobile(true)}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
            Workspace <ChevronRight size={14} /> <span>{pageTitle(page)}</span>
          </div>
          <div className="top-status">
            <span className="status-dot" /> Backend connected
          </div>
        </header>
        <main className="content">
          {page === "resumes" ? (
            <Resumes />
          ) : page === "profile" ? (
            <Profile />
          ) : page === "fresh-jobs" ? (
            <FreshJobs />
          ) : page === "security" ? (
            <Security />
          ) : page === "system" ? (
            <System />
          ) : page === "unavailable" ? (
            <Unavailable />
          ) : (
            <Overview profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}
function pageTitle(page: Page) {
  return (
    {
      overview: "Overview",
      resumes: "Resumes",
      profile: "Candidate profile",
      "fresh-jobs": "Fresh jobs",
      security: "IP security",
      system: "System health",
      unavailable: "Product areas",
    } as Record<Page, string>
  )[page];
}
function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <a
      href={
        label === "Overview"
          ? "#/"
          : `#/${label.toLowerCase().replaceAll(" ", "-")}`
      }
      className={active ? "nav-item active" : "nav-item"}
    >
      <Icon size={17} />
      <span>{label}</span>
      {!active && label === "Recommended jobs" && (
        <span className="soon">Soon</span>
      )}
    </a>
  );
}
function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Overview({ profile }: { profile: CurrentProfile | null }) {
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => {
    endpoints
      .health()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}${profile?.email ? `, ${profile.email.split("@")[0]}` : ""}.`}
        description="Your HireAndTech foundation is ready for the next product phases."
      />
      <div className="hero-grid">
        <div className="hero-card">
          <div className="hero-icon">
            <FileText size={22} />
          </div>
          <div>
            <span className="card-label">Start here</span>
            <h2>Build your candidate profile</h2>
            <p>
              Upload a PDF resume and the backend will validate, parse, and
              persist your structured profile.
            </p>
            <a className="text-link" href="#/resumes">
              Manage resumes <ArrowRight size={15} />
            </a>
          </div>
        </div>
        <div className="metric-card">
          <span className="card-label">API status</span>
          <div className={health ? "metric-value positive" : "metric-value"}>
            {health ? "Operational" : "Unavailable"}
          </div>
          <p>
            {health
              ? `${health.service} · v${health.version}`
              : "Check your backend connection."}
          </p>
          <span className="status-line">
            <span className="status-dot" /> Live liveness check
          </span>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Product roadmap</span>
          <h2>What’s available today</h2>
        </div>
      </div>
      <div className="roadmap-grid">
        <RoadmapCard
          icon={FileText}
          title="Resume management"
          text="Upload, parse, replace, list, and delete private PDF resumes."
          href="#/resumes"
          available
        />
        <RoadmapCard
          icon={UserRound}
          title="Candidate profile"
          text="Review deterministic profile data extracted by the backend parser."
          href="#/profile"
          available
        />
        <RoadmapCard
          icon={BriefcaseBusiness}
          title="Fresh jobs"
          text="Browse fresh jobs collected continuously into the global canonical job database."
          href="#/fresh-jobs"
          available
        />
      </div>
    </>
  );
}
function RoadmapCard({
  icon: Icon,
  title,
  text,
  href,
  available,
}: {
  icon: typeof FileText;
  title: string;
  text: string;
  href?: string;
  available?: boolean;
}) {
  const inner = (
    <>
      <div className="roadmap-icon">
        <Icon size={19} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className={available ? "badge success" : "badge"}>
        {available ? "Connected" : "Backend phase pending"}
      </span>
    </>
  );
  return href ? (
    <a className="roadmap-card" href={href}>
      {inner}
    </a>
  ) : (
    <div className="roadmap-card">{inner}</div>
  );
}

function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const load = () => {
    setLoading(true);
    endpoints
      .resumes()
      .then((r) => {
        setResumes(r.items);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const upload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted by the backend.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      await endpoints.upload(file);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await endpoints.deleteResume(id);
      setSelected(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Private documents"
        title="Resumes"
        description="Manage the resumes used to create your structured candidate profile."
        action={
          <label className="primary upload-button">
            <UploadCloud size={17} />{" "}
            {uploading ? "Uploading…" : "Upload resume"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
        }
      />
      {error && (
        <div className="alert error">
          {error}
          <button onClick={() => setError("")}>
            <X size={15} />
          </button>
        </div>
      )}
      <div className="info-banner">
        <ShieldCheck size={19} />
        <div>
          <b>Private by design</b>
          <span>
            Files are owner-scoped and stored privately. Parsing happens in the
            backend; the browser never extracts resume text.
          </span>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Your library</span>
          <h2>
            {loading
              ? "Loading resumes…"
              : `${resumes.length} resume${resumes.length === 1 ? "" : "s"}`}
          </h2>
        </div>
      </div>
      {loading ? (
        <div className="skeleton-list">
          <div />
          <div />
        </div>
      ) : resumes.length === 0 ? (
        <Empty
          title="No resume uploaded yet"
          text="Upload a PDF to create your persistent candidate profile."
        />
      ) : (
        <div className="resume-layout">
          <div className="resume-list">
            {resumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                selected={selected?.resume_id === r.id}
                onProfile={() =>
                  endpoints
                    .profile(r.id)
                    .then(setSelected)
                    .catch((e) => setError(e.message))
                }
                onDelete={() => remove(r.id)}
              />
            ))}
          </div>
          {selected && <CandidateCard profile={selected} />}
        </div>
      )}
    </>
  );
}
function ResumeCard({
  resume,
  selected,
  onProfile,
  onDelete,
}: {
  resume: Resume;
  selected: boolean;
  onProfile: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={selected ? "resume-card selected" : "resume-card"}>
      <div className="file-icon">
        <FileText size={20} />
      </div>
      <div className="resume-main">
        <div className="resume-title">
          <b>{resume.original_filename}</b>
          <span
            className={`badge ${resume.status === "parsed" ? "success" : resume.status === "parse_failed" ? "danger" : ""}`}
          >
            {resume.status.replace("_", " ")}
          </span>
        </div>
        <span className="muted">
          {fmtBytes(resume.size_bytes)} · Added {fmtDate(resume.created_at)}
        </span>
        {resume.parse_error_code && (
          <span className="error-text">
            Parser error: {resume.parse_error_code}
          </span>
        )}
      </div>
      <button className="secondary compact" onClick={onProfile}>
        View profile
      </button>
      <button
        className="icon-button danger-icon"
        title="Delete resume"
        onClick={onDelete}
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
function CandidateCard({ profile }: { profile: CandidateProfile }) {
  return (
    <div className="candidate-card">
      <div className="candidate-head">
        <div className="avatar large">{profile.full_name?.[0] ?? "C"}</div>
        <div>
          <span className="eyebrow">Parsed candidate profile</span>
          <h2>{profile.full_name ?? "Candidate profile"}</h2>
          <p>
            {profile.current_title ?? "Role not detected"}
            {profile.location ? ` · ${profile.location}` : ""}
          </p>
        </div>
      </div>
      {profile.professional_summary && (
        <p className="summary">{profile.professional_summary}</p>
      )}
      <div className="profile-facts">
        <Fact
          label="Experience"
          value={
            profile.years_of_experience
              ? `${profile.years_of_experience} years`
              : "Not detected"
          }
        />
        <Fact label="Email" value={profile.email ?? "Not detected"} />
        <Fact label="Phone" value={profile.phone ?? "Not detected"} />
      </div>
      <ProfileSection title="Skills">
        {profile.skills.length ? (
          <div className="skill-list">
            {profile.skills.map((skill) => (
              <span className="skill" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <span className="muted">No skills detected.</span>
        )}
      </ProfileSection>
      {profile.employment_history.length > 0 && (
        <ProfileSection title="Experience history">
          {profile.employment_history.map((job, i) => (
            <div className="timeline-item" key={i}>
              <b>{job.title ?? "Role"}</b>
              <span>
                {job.company ?? "Company"}
                {job.location ? ` · ${job.location}` : ""}
              </span>
              <small>
                {job.start_date ?? "?"} — {job.end_date ?? "Present"}
              </small>
            </div>
          ))}
        </ProfileSection>
      )}
      {profile.education.length > 0 && (
        <ProfileSection title="Education">
          {profile.education.map((ed, i) => (
            <div className="education-row" key={i}>
              <b>{ed.qualification ?? ed.field_of_study ?? "Education"}</b>
              <span>{ed.institution ?? "Institution not detected"}</span>
            </div>
          ))}
        </ProfileSection>
      )}
    </div>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="profile-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Profile() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    endpoints
      .resumes()
      .then((r) => {
        setResumes(r.items);
        const parsed = r.items.find((item) => item.status === "parsed");
        if (parsed)
          endpoints
            .profile(parsed.id)
            .then(setProfile)
            .catch((e) => setError(e.message));
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Source of truth"
        title="Candidate profile"
        description="This profile is parsed and persisted by the backend from your active resume."
      />
      {error && <div className="alert error">{error}</div>}
      {!resumes.some((r) => r.status === "parsed") ? (
        <Empty
          title="No parsed profile yet"
          text="Upload a resume and wait for the backend parser to finish."
          href="#/resumes"
          action="Upload resume"
        />
      ) : profile ? (
        <CandidateCard profile={profile} />
      ) : (
        <div className="loading-box">Loading parsed profile…</div>
      )}
    </>
  );
}
function Empty({
  title,
  text,
  href,
  action,
}: {
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <FileText size={22} />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {href && (
        <a href={href} className="primary">
          {action}
        </a>
      )}
    </div>
  );
}

function Security() {
  const [rules, setRules] = useState<IpRule[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [form, setForm] = useState({
    cidr: "",
    label: "",
    description: "",
    enabled: true,
  });
  const [error, setError] = useState("");
  const load = () => {
    Promise.all([endpoints.ipRules(), endpoints.audit()])
      .then(([r, a]) => {
        setRules(r.items);
        setAudit(a.items);
      })
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : "Unable to load security data",
        ),
      );
  };
  useEffect(() => {
    load();
  }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await endpoints.createRule(form);
      setForm({ cidr: "", label: "", description: "", enabled: true });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create rule");
    }
  };
  const toggle = async (rule: IpRule) => {
    try {
      await endpoints.updateRule(rule.id, { enabled: !rule.enabled });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update rule");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Administrator controls"
        title="IP security"
        description="Manage the backend allowlist and inspect security audit events."
      />
      <div className="admin-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Access policy</span>
              <h2>IP / CIDR rules</h2>
            </div>
            <ShieldCheck size={21} />
          </div>
          {error && <div className="alert error">{error}</div>}
          <form className="rule-form" onSubmit={create}>
            <input
              placeholder="192.168.1.0/24"
              value={form.cidr}
              onChange={(e) => setForm({ ...form, cidr: e.target.value })}
              required
            />
            <input
              placeholder="Office network"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <button className="primary" type="submit">
              <Plus size={16} /> Add rule
            </button>
          </form>
          {rules.length === 0 ? (
            <p className="muted">No rules configured.</p>
          ) : (
            <div className="table">
              {rules.map((rule) => (
                <div className="table-row" key={rule.id}>
                  <div>
                    <b>{rule.label}</b>
                    <span>{rule.cidr}</span>
                  </div>
                  <span className={rule.enabled ? "badge success" : "badge"}>
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    className="secondary compact"
                    onClick={() => toggle(rule)}
                  >
                    {rule.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="icon-button danger-icon"
                    onClick={() =>
                      endpoints
                        .deleteRule(rule.id)
                        .then(load)
                        .catch((e) =>
                          setError(
                            e instanceof Error
                              ? e.message
                              : "Unable to delete rule",
                          ),
                        )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Immutable history</span>
              <h2>Audit events</h2>
            </div>
            <Fingerprint size={21} />
          </div>
          {audit.length === 0 ? (
            <p className="muted">No audit events yet.</p>
          ) : (
            <div className="audit-list">
              {audit.map((event) => (
                <div className="audit-item" key={event.id}>
                  <span className="status-dot" />
                  <div>
                    <b>{event.event_type.replaceAll("_", " ")}</b>
                    <span>
                      {event.request_ip ?? "IP unavailable"} ·{" "}
                      {fmtDate(event.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function System() {
  const [health, setHealth] = useState<Health | null>(null);
  const [ready, setReady] = useState<Health | null>(null);
  const [error, setError] = useState("");
  const refresh = () => {
    Promise.all([endpoints.health(), endpoints.readiness()])
      .then(([h, r]) => {
        setHealth(h);
        setReady(r);
      })
      .catch((e) => setError(e.message));
  };
  useEffect(refresh, []);
  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Health & readiness"
        description="Live signals exposed by the backend. Infrastructure details remain intentionally minimal."
        action={
          <button className="secondary" onClick={refresh}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />
      {error && <div className="alert error">{error}</div>}
      <div className="health-grid">
        <HealthCard
          title="API liveness"
          value={health ? "Operational" : "Unavailable"}
          text={
            health
              ? `${health.service} · version ${health.version}`
              : "The API did not return a liveness response."
          }
        />
        <HealthCard
          title="Database readiness"
          value={ready ? "Ready" : "Unavailable"}
          text={
            ready
              ? "The API can reach its database."
              : "Readiness checks the database connection."
          }
        />
      </div>
    </>
  );
}
function HealthCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="health-card">
      <div
        className={
          value === "Operational" || value === "Ready"
            ? "health-icon ok"
            : "health-icon"
        }
      >
        <Activity size={21} />
      </div>
      <div>
        <span className="card-label">{title}</span>
        <h2>{value}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Unavailable() {
  return (
    <>
      <PageHeader
        eyebrow="Product roadmap"
        title="Jobs & tracking"
        description="These product areas will appear when their backend contracts are available."
      />
      <div className="unavailable">
        <div className="empty-icon">
          <BriefcaseBusiness size={22} />
        </div>
        <h2>Not available in the current backend</h2>
        <p>
          Global jobs, recommendations, search, matching, status tracking,
          scheduler CRUD, and dashboard metrics are not implemented yet. This UI
          does not call scraper endpoints or create mock data.
        </p>
        <a className="secondary" href="#/">
          Return to overview
        </a>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
