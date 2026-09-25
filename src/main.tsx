import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Fingerprint,
  GripVertical,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Trophy,
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
  | "job-search"
  | "security"
  | "system"
  | "tracking"
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
    tracking: "tracking",
    "stats-tracking": "tracking",
    "job-search": "job-search",
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
    { label: "Job search", icon: Search },
    { label: "Resumes", icon: FileText },
    { label: "Candidate profile", icon: UserRound },
    { label: "Tracking", icon: Activity },
  ];
  const future = [
    { label: "Recommended jobs", icon: Search },
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
          ) : page === "job-search" ? (
            <JobSearch />
          ) : page === "security" ? (
            <Security />
          ) : page === "system" ? (
            <System />
          ) : page === "tracking" ? (
            <StatsTracking />
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
      "job-search": "Job search",
      security: "IP security",
      system: "System health",
      tracking: "Stats & Tracking",
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

/* ── upload queue item ── */
type QueueStatus = "pending" | "uploading" | "done" | "error";
interface QueueItem { id: string; file: File; status: QueueStatus; error?: string; }

const ACTIVE_RESUME_KEY = "hnt-active-resume";

function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<CandidateProfile | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_RESUME_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  const load = useCallback(() => {
    setLoading(true);
    endpoints
      .resumes()
      .then((r) => { setResumes(r.items); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  /* Persist active resume to localStorage */
  const markActive = (id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_RESUME_KEY, id);
  };

  /* Sequential queue processor */
  const processQueue = useCallback(async (items: QueueItem[]) => {
    if (processingRef.current) return;
    processingRef.current = true;
    for (const item of items) {
      if (item.status !== "pending") continue;
      setQueue((prev) =>
        prev.map((q) => q.id === item.id ? { ...q, status: "uploading" } : q),
      );
      try {
        await endpoints.upload(item.file);
        setQueue((prev) =>
          prev.map((q) => q.id === item.id ? { ...q, status: "done" } : q),
        );
      } catch (e) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: e instanceof Error ? e.message : "Upload failed" }
              : q,
          ),
        );
      }
    }
    processingRef.current = false;
    load();
  }, [load]);

  const enqueue = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const pdfs = arr.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    const nonPdfs = arr.length - pdfs.length;
    if (nonPdfs > 0) setError(`${nonPdfs} non-PDF file(s) skipped. Only PDF files are accepted.`);
    if (pdfs.length === 0) return;
    const newItems: QueueItem[] = pdfs.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}`,
      file: f,
      status: "pending",
    }));
    setQueue((prev) => {
      const combined = [...prev, ...newItems];
      processQueue(combined);
      return combined;
    });
  }, [processQueue]);

  const clearDoneQueue = () =>
    setQueue((prev) => prev.filter((q) => q.status !== "done"));

  const remove = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await endpoints.deleteResume(id);
      if (activeId === id) {
        setActiveId(null);
        localStorage.removeItem(ACTIVE_RESUME_KEY);
      }
      if (selectedResumeId === id) setSelected(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) enqueue(e.dataTransfer.files);
  };

  const activeResume = resumes.find((r) => r.id === activeId);
  const uploadingCount = queue.filter((q) => q.status === "uploading" || q.status === "pending").length;
  const doneCount = queue.filter((q) => q.status === "done").length;

  return (
    <>
      <PageHeader
        eyebrow="Private documents"
        title="Resumes"
        description="Upload multiple PDF resumes and select one as your active profile for job matching."
        action={
          <label className="primary upload-button">
            <UploadCloud size={17} />
            {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : "Upload resumes"}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              disabled={uploadingCount > 0}
              onChange={(e) => e.target.files && enqueue(e.target.files)}
            />
          </label>
        }
      />

      {error && (
        <div className="alert error">
          {error}
          <button onClick={() => setError("")}><X size={15} /></button>
        </div>
      )}

      {/* Active resume banner */}
      {activeResume && (
        <div className="info-banner resume-active-banner">
          <CheckCircle2 size={19} />
          <div>
            <b>Active resume: {activeResume.original_filename}</b>
            <span>This resume is used for job matching and recommendations.</span>
          </div>
          <button
            className="secondary compact"
            style={{ marginLeft: "auto", flexShrink: 0 }}
            onClick={() => setSelected(null)}
          >
            Change
          </button>
        </div>
      )}

      {/* Drag-and-drop zone */}
      <div
        className={`resume-drop-zone${dragOver ? " resume-drop-zone--over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Drop PDF resumes here or click to browse"
      >
        <UploadCloud size={28} />
        <span>
          <b>Drop PDF files here</b> or <span className="text-link">click to browse</span>
        </span>
        <span className="muted" style={{ fontSize: 11 }}>Supports multiple files at once</span>
      </div>

      {/* Upload queue */}
      {queue.length > 0 && (
        <div className="resume-queue">
          <div className="resume-queue-header">
            <span className="eyebrow">Upload queue</span>
            {doneCount > 0 && (
              <button className="secondary compact" onClick={clearDoneQueue}>
                Clear done ({doneCount})
              </button>
            )}
          </div>
          {queue.map((item) => (
            <div key={item.id} className={`resume-queue-item rq-${item.status}`}>
              <FileText size={14} />
              <span className="resume-queue-name">{item.file.name}</span>
              <span className="resume-queue-size">{fmtBytes(item.file.size)}</span>
              <span className="resume-queue-status">
                {item.status === "pending" && "Waiting…"}
                {item.status === "uploading" && <><RefreshCw size={12} className="spin" /> Uploading</>}
                {item.status === "done" && <><Check size={12} /> Done</>}
                {item.status === "error" && <span title={item.error}>Failed</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Library section */}
      <div className="info-banner" style={{ marginTop: 8 }}>
        <ShieldCheck size={19} />
        <div>
          <b>Private by design</b>
          <span>Files are owner-scoped and stored privately. Parsing happens in the backend.</span>
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
        {resumes.length > 0 && (
          <span className="muted" style={{ fontSize: 12 }}>
            Click <b>Set active</b> on a resume to use it for job matching
          </span>
        )}
      </div>

      {loading ? (
        <div className="skeleton-list"><div /><div /></div>
      ) : resumes.length === 0 ? (
        <Empty
          title="No resume uploaded yet"
          text="Upload one or more PDFs above to create your persistent candidate profile."
        />
      ) : (
        <div className="resume-library">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              resume={r}
              isActive={r.id === activeId}
              isProfileOpen={selectedResumeId === r.id}
              onSetActive={() => markActive(r.id)}
              onProfile={() => {
                if (selectedResumeId === r.id) {
                  setSelected(null);
                  setSelectedResumeId(null);
                  return;
                }
                setSelectedResumeId(r.id);
                endpoints
                  .profile(r.id)
                  .then(setSelected)
                  .catch((e) => setError(e.message));
              }}
              onDelete={() => remove(r.id)}
            />
          ))}
          {selectedResumeId && selected && (
            <CandidateCard profile={selected} />
          )}
        </div>
      )}
    </>
  );
}

function ResumeCard({
  resume,
  isActive,
  isProfileOpen,
  onSetActive,
  onProfile,
  onDelete,
}: {
  resume: Resume;
  isActive: boolean;
  isProfileOpen: boolean;
  onSetActive: () => void;
  onProfile: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`resume-card resume-card-v2${isActive ? " resume-card-active" : ""}${isProfileOpen ? " resume-card-open" : ""}`}>
      {/* Active indicator strip */}
      {isActive && <div className="resume-active-strip" />}

      <div className="file-icon">
        <FileText size={20} />
      </div>

      <div className="resume-main">
        <div className="resume-title">
          <b>{resume.original_filename}</b>
          <span
            className={`badge ${
              resume.status === "parsed" ? "success" :
              resume.status === "parse_failed" ? "danger" : ""
            }`}
          >
            {resume.status.replace("_", " ")}
          </span>
          {isActive && (
            <span className="badge badge-active">
              <Check size={9} /> Active
            </span>
          )}
        </div>
        <span className="muted">
          {fmtBytes(resume.size_bytes)} · Added {fmtDate(resume.created_at)}
        </span>
        {resume.parse_error_code && (
          <span className="error-text">Parser error: {resume.parse_error_code}</span>
        )}
      </div>

      <div className="resume-card-actions">
        {!isActive && (
          <button className="primary compact" onClick={onSetActive} title="Use this resume for matching">
            <CheckCircle2 size={13} /> Set active
          </button>
        )}
        <button className="secondary compact" onClick={onProfile}>
          {isProfileOpen ? "Hide profile" : "View profile"}
        </button>
        <button className="icon-button danger-icon" title="Delete resume" onClick={onDelete}>
          <Trash2 size={17} />
        </button>
      </div>
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
/* ── Job Search ── */

function TagInput({
  label,
  placeholder,
  hint,
  tags,
  onChange,
}: {
  label: string;
  placeholder: string;
  hint: string;
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setVal("");
  };
  return (
    <div className="search-tag-group">
      <div className="search-tag-label">{label}</div>
      <div className="search-tag-input-row">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="search-tag-input"
        />
        <button type="button" className="secondary compact" onClick={add}>
          <Plus size={16} />
        </button>
      </div>
      <div className="search-tag-hint">{hint}</div>
      {tags.length > 0 && (
        <div className="search-tag-list">
          {tags.map((t) => (
            <span key={t} className="search-tag-chip">
              {t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function JobSearch() {
  const [activeResumeId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_RESUME_KEY)
  );
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [domains, setDomains] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [postedDate, setPostedDate] = useState("Any time");
  const [experience, setExperience] = useState("");
  const [remotePref, setRemotePref] = useState({
    onsite: false,
    remote: false,
    hybrid: false,
  });
  const [jobType, setJobType] = useState({
    fulltime: false,
    parttime: false,
    contract: false,
    internship: false,
    temporary: false,
  });

  // Load active profile and infer defaults
  useEffect(() => {
    if (!activeResumeId) return;
    setLoading(true);
    
    Promise.all([
      endpoints.profile(activeResumeId).catch((e) => {
        console.error("Failed to load profile", e);
        return null;
      }),
      endpoints.resumes().then(res => res.items.find(r => r.id === activeResumeId)).catch(() => null)
    ])
      .then(([p, r]) => {
        if (r) setResumeName(r.original_filename);
        if (p) {
          setProfile(p);
          // Infer domains
          const inferredDomains = [];
          if (p.current_title) inferredDomains.push(p.current_title);
          if (p.skills && p.skills.length > 0) {
             // just take a couple top skills as examples if no title
             if (inferredDomains.length === 0) {
               inferredDomains.push(...p.skills.slice(0, 2));
             }
          }
          setDomains(inferredDomains);
  
          // Infer locations
          if (p.location) setLocations([p.location]);
  
          // Infer experience
          if (p.years_of_experience !== null && p.years_of_experience !== undefined) {
             const yoe = Number(p.years_of_experience);
             if (!isNaN(yoe)) {
               if (yoe < 2) setExperience("Entry Level");
               else if (yoe < 6) setExperience("Mid Level");
               else if (yoe < 10) setExperience("Senior Level");
               else setExperience("Executive");
             }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [activeResumeId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct query parameters
    const params = new URLSearchParams();
    if (domains.length > 0) params.set("query", domains.join(" "));
    if (locations.length > 0) params.set("location", locations.join(","));
    if (remotePref.remote) params.set("remote", "true");
    
    let typeStr = "";
    if (jobType.fulltime) typeStr = "fulltime";
    else if (jobType.parttime) typeStr = "parttime";
    else if (jobType.contract) typeStr = "contract";
    if (typeStr) params.set("employment_type", typeStr);

    // Navigate to fresh-jobs with filters
    window.location.hash = `#/fresh-jobs?${params.toString()}`;
  };

  const remotePrefError = !remotePref.onsite && !remotePref.remote && !remotePref.hybrid;
  const jobTypeError = !jobType.fulltime && !jobType.parttime && !jobType.contract && !jobType.internship && !jobType.temporary;

  return (
    <>
      <PageHeader
        title="Job Search"
        description="Configure and start your job search"
      />

      <div className="search-panel">
        <div className="search-panel-header">
          <FileText size={18} />
          <h3>Resume Selection</h3>
        </div>
        <div className="search-panel-content">
          <div className="search-field-group">
            <label className="search-label">Select from Saved Resumes</label>
            {loading ? (
              <div className="skeleton-line" style={{ height: 42, borderRadius: 8 }} />
            ) : resumeName ? (
              <div className="search-active-resume-box">
                <FileText size={16} className="muted" />
                <span>{resumeName}</span>
                <span className="badge success" style={{ marginLeft: "auto" }}>Selected</span>
              </div>
            ) : (
              <div className="search-active-resume-box" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
                <span className="muted">No active resume selected</span>
                <a href="#/resumes" className="secondary compact" style={{ marginLeft: "auto" }}>Go select one</a>
              </div>
            )}
          </div>
          <div className="search-field-group" style={{ marginTop: 20 }}>
            <label className="search-label">Or Upload New Resume</label>
            <div className="search-file-upload-mock">
               <span className="muted">Choose File</span> No file chosen
            </div>
            <div className="search-tag-hint">Supported format: PDF only (Max 5MB)</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <div className="search-panel">
          <div className="search-panel-header">
            <SlidersHorizontal size={18} />
            <h3>Search Criteria</h3>
          </div>
          <div className="search-panel-content search-criteria-grid">
            {/* Left Column */}
            <div className="search-col">
              <TagInput
                label="Job Domains * (Multiple)"
                placeholder="e.g., DevOps Engineer, SRE, Cloud Engineer"
                hint="Add multiple job titles/domains. Press Enter or click + to add each one."
                tags={domains}
                onChange={setDomains}
              />
              <TagInput
                label="Locations * (Multiple)"
                placeholder="e.g., New York, Texas, Remote, California"
                hint="Add multiple locations. Searches will run sequentially (2-sec gap). Press Enter or click + to add each one."
                tags={locations}
                onChange={setLocations}
              />
              <div className="search-field-group">
                <label className="search-label">Posted Date</label>
                <select
                  className="search-select"
                  value={postedDate}
                  onChange={(e) => setPostedDate(e.target.value)}
                >
                  <option>Any time</option>
                  <option>Past 24 hours</option>
                  <option>Past week</option>
                  <option>Past month</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="search-col">
              <div className="search-field-group">
                <label className="search-label">Experience Level</label>
                <div className="search-radio-grid">
                  <label className="search-radio-label">
                    <input type="radio" name="exp" checked={experience === "Entry Level"} onChange={() => setExperience("Entry Level")} /> Entry Level
                  </label>
                  <label className="search-radio-label">
                    <input type="radio" name="exp" checked={experience === "Mid Level"} onChange={() => setExperience("Mid Level")} /> Mid Level
                  </label>
                  <label className="search-radio-label">
                    <input type="radio" name="exp" checked={experience === "Senior Level"} onChange={() => setExperience("Senior Level")} /> Senior Level
                  </label>
                  <label className="search-radio-label">
                    <input type="radio" name="exp" checked={experience === "Executive"} onChange={() => setExperience("Executive")} /> Executive
                  </label>
                </div>
              </div>

              <div className="search-field-group">
                <label className="search-label">Remote Preference *</label>
                <div className="search-check-grid">
                  <label className="search-radio-label">
                    <input type="checkbox" checked={remotePref.onsite} onChange={(e) => setRemotePref({...remotePref, onsite: e.target.checked})} /> On-site
                  </label>
                  <label className="search-radio-label">
                    <input type="checkbox" checked={remotePref.remote} onChange={(e) => setRemotePref({...remotePref, remote: e.target.checked})} /> Remote
                  </label>
                  <label className="search-radio-label">
                    <input type="checkbox" checked={remotePref.hybrid} onChange={(e) => setRemotePref({...remotePref, hybrid: e.target.checked})} /> Hybrid
                  </label>
                </div>
                {remotePrefError && <div className="search-error-text">Please select at least one remote preference</div>}
              </div>

              <div className="search-field-group">
                <label className="search-label">Job Type *</label>
                <div className="search-check-grid">
                  <label className="search-radio-label">
                    <input type="checkbox" checked={jobType.fulltime} onChange={(e) => setJobType({...jobType, fulltime: e.target.checked})} /> Full-time
                  </label>
                  <label className="search-radio-label">
                    <input type="checkbox" checked={jobType.parttime} onChange={(e) => setJobType({...jobType, parttime: e.target.checked})} /> Part-time
                  </label>
                  <label className="search-radio-label">
                    <input type="checkbox" checked={jobType.contract} onChange={(e) => setJobType({...jobType, contract: e.target.checked})} /> Contract
                  </label>
                  <label className="search-radio-label">
                    <input type="checkbox" checked={jobType.internship} onChange={(e) => setJobType({...jobType, internship: e.target.checked})} /> Internship
                  </label>
                  <label className="search-radio-label">
                    <input type="checkbox" checked={jobType.temporary} onChange={(e) => setJobType({...jobType, temporary: e.target.checked})} /> Temporary
                  </label>
                </div>
                {jobTypeError && <div className="search-error-text">Please select at least one job type</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="search-actions">
          <button
            type="submit"
            className="primary"
            disabled={remotePrefError || jobTypeError || domains.length === 0 || locations.length === 0}
            style={{ padding: "12px 24px", fontSize: 14 }}
          >
            <Search size={18} style={{ marginRight: 8 }} /> Start Job Search
          </button>
        </div>
      </form>
    </>
  );
}

/* ── Stats & Tracking types ── */
type TrackingStage = "applied" | "interviewing" | "offer" | "rejected";
interface TrackedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  stage: TrackingStage;
  score: number;
  appliedAt: string;
}

const STAGE_LABELS: Record<TrackingStage, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

const STAGE_ORDER: TrackingStage[] = ["applied", "interviewing", "offer", "rejected"];

function StatsTracking() {
  const [resumeFilter, setResumeFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TrackingStage | null>(null);

  const doRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const moveJob = (id: string, stage: TrackingStage) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, stage } : j)));
  };

  /* Derived stats */
  const total = jobs.length;
  const applied = jobs.filter((j) => j.stage === "applied").length;
  const interviewing = jobs.filter((j) => j.stage === "interviewing").length;
  const offers = jobs.filter((j) => j.stage === "offer").length;
  const avgScore =
    total > 0
      ? Math.round(jobs.reduce((s, j) => s + j.score, 0) / total)
      : 0;

  const statCards = [
    { label: "Total Jobs", value: total, icon: <BriefcaseBusiness size={20} /> },
    { label: "Applied", value: applied, icon: <Send size={20} /> },
    { label: "Interviewing", value: interviewing, icon: <UserRound size={20} /> },
    { label: "Offers", value: offers, icon: <Trophy size={20} /> },
    { label: "Avg Score", value: avgScore, icon: <Target size={20} /> },
  ];

  return (
    <>
      <div className="tracking-topbar">
        <PageHeader
          eyebrow="Pipeline"
          title="Stats & Tracking"
          description="Track your job application pipeline – drag cards to move between stages"
          action={
            <button
              className="secondary"
              onClick={doRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? "spin" : ""} />
              Refresh
            </button>
          }
        />
      </div>

      {/* Filter row */}
      <div className="tracking-filter-row">
        <label className="tracking-filter-label">
          Filter by Resume:
          <select
            className="tracking-select"
            value={resumeFilter}
            onChange={(e) => setResumeFilter(e.target.value)}
          >
            <option value="">All Resumes</option>
            <option value="r1">Software Engineer Resume</option>
            <option value="r2">Full Stack Developer Resume</option>
            <option value="r3">Data Scientist Resume</option>
          </select>
        </label>
        <span className="tracking-drag-hint">
          <GripVertical size={13} /> Drag cards to move between stages
        </span>
      </div>

      {/* Stat cards */}
      <div className="tracking-stat-grid">
        {statCards.map((s) => (
          <div key={s.label} className="tracking-stat-card">
            <div className="tracking-stat-icon hero-icon">{s.icon}</div>
            <div className="tracking-stat-val">{s.value}</div>
            <div className="card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline board */}
      <div className="panel tracking-pipeline-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Kanban view</span>
            <h2>Job Application Pipeline</h2>
          </div>
          <Activity size={21} />
        </div>

        {total === 0 ? (
          /* ── Empty state ── */
          <div className="empty">
            <div className="empty-icon hero-icon">
              <BriefcaseBusiness size={22} />
            </div>
            <h2>No jobs found</h2>
            <p>Start a job search to see your pipeline here.</p>
            <a className="primary" href="#/fresh-jobs">
              Start Job Search <ArrowRight size={15} />
            </a>
          </div>
        ) : (
          /* ── Board columns ── */
          <div className="tracking-board">
            {STAGE_ORDER.map((stage) => (
              <div
                key={stage}
                className={`tracking-col${
                  dragOver === stage ? " tracking-col--over" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(stage);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging) moveJob(dragging, stage);
                  setDragging(null);
                  setDragOver(null);
                }}
              >
                <div className="tracking-col-header">
                  <span className="eyebrow">{STAGE_LABELS[stage]}</span>
                  <span className="badge">
                    {jobs.filter((j) => j.stage === stage).length}
                  </span>
                </div>
                <div className="tracking-col-cards">
                  {jobs
                    .filter((j) => j.stage === stage)
                    .map((job) => (
                      <div
                        key={job.id}
                        className="tracking-job-card"
                        draggable
                        onDragStart={() => setDragging(job.id)}
                        onDragEnd={() => setDragging(null)}
                      >
                        <div className="tracking-job-title">{job.title}</div>
                        <div className="tracking-job-company">{job.company}</div>
                        <div className="tracking-job-meta">
                          <span>{job.location}</span>
                          <span className="badge success">Score: {job.score}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo add button */}
        {total === 0 && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button
              className="secondary compact"
              onClick={() =>
                setJobs([
                  {
                    id: "demo-1",
                    title: "Frontend Engineer",
                    company: "Acme Corp",
                    location: "Remote",
                    stage: "applied",
                    score: 87,
                    appliedAt: new Date().toISOString(),
                  },
                  {
                    id: "demo-2",
                    title: "Full Stack Developer",
                    company: "StartupXY",
                    location: "New York, NY",
                    stage: "interviewing",
                    score: 74,
                    appliedAt: new Date().toISOString(),
                  },
                  {
                    id: "demo-3",
                    title: "Backend Engineer",
                    company: "BigTech Inc",
                    location: "San Francisco, CA",
                    stage: "offer",
                    score: 92,
                    appliedAt: new Date().toISOString(),
                  },
                ])
              }
            >
              Load demo data
            </button>
          </div>
        )}
      </div>
    </>
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
