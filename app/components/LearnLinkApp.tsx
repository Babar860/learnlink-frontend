"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Section = "feed" | "my-posts" | "courses" | "jobs" | "community" | "channels" | "admin";

type LocalUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  organization_id?: string | null;
  grade?: string | null;
};

type FeedPost = {
  id?: string;
  author?: string;
  author_id?: string;
  source?: string;
  status?: string;
  content: string;
  ai_moderation_status?: string;
  post_type?: string;
  media_urls?: string[];
};

type CourseRecord = {
  id: string;
  title: string;
  description?: string;
  teacher_name?: string;
  is_paid?: boolean;
  price?: number;
  rank_reason?: string;
};

type LiveClassRecord = {
  id: string;
  title: string;
  status?: string;
  teacher_name?: string;
  course_title?: string;
  is_open?: boolean;
  has_quiz?: boolean;
  quiz_count?: number;
  enrollment_count?: number;
  organization_id?: string | null;
  grade?: string | null;
};

const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4000";

const tabs: Array<{ id: Section; label: string; href: string }> = [
  { id: "feed", label: "Feed", href: "/feed" },
  { id: "my-posts", label: "My Posts", href: "/my-posts" },
  { id: "courses", label: "Courses", href: "/courses" },
  { id: "jobs", label: "Jobs", href: "/jobs" },
  { id: "community", label: "Community", href: "/community" },
  { id: "channels", label: "Channels", href: "/channels" },
  { id: "admin", label: "Admin", href: "/admin" }
];

export function LearnLinkApp({ section }: { section: Section }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authMessage, setAuthMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", organization_id: "", grade: "" });
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postContent, setPostContent] = useState("");
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassRecord[]>([]);
  const [courseWizard, setCourseWizard] = useState<"course" | "live" | "">("");
  const [wizardMessage, setWizardMessage] = useState("");
  const [wizard, setWizard] = useState({
    title: "",
    description: "",
    video_url: "",
    video_size_bytes: 0,
    scheduled_at: "",
    organization_id: "",
    grade: "",
    is_paid: false,
    price: 0,
    quiz_prompt: "",
    bank_details: ""
  });
  const [apiItems, setApiItems] = useState<Array<Record<string, unknown>>>([]);

  const isTeacher = user?.roles.includes("teacher");
  const isAdmin = user?.roles.includes("admin");
  const visibleTabs = useMemo(() => tabs.filter((tab) => tab.id !== "admin" || isAdmin), [isAdmin]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("learnlink_token");
    const savedUser = window.localStorage.getItem("learnlink_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as LocalUser);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    if (section === "feed" || section === "my-posts") void loadFeed(token);
    if (section === "courses") void loadCourses(token);
    if (["jobs", "community", "channels", "admin"].includes(section)) void loadSection(section, token);
  }, [section, token]);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(`${gatewayUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {})
      }
    });
    if (response.status === 401) logout();
    return response;
  }

  async function authenticate() {
    setAuthMessage("");
    const body = authMode === "signup"
      ? { name: form.name, email: form.email, password: form.password, roles: [form.role], organization_id: form.organization_id, grade: form.grade }
      : { email: form.email, password: form.password };
    const response = await fetch(`${gatewayUrl}/auth/${authMode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok || !data.token || !data.user) {
      setAuthMessage(data.message ?? data.error ?? "Authentication failed");
      return;
    }
    window.localStorage.setItem("learnlink_token", data.token);
    window.localStorage.setItem("learnlink_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function providerAuth(provider: "google" | "github") {
    const synthetic = {
      name: provider === "google" ? "Google Learner" : "GitHub Learner",
      email: `${provider}-learner@learnlink.local`,
      password: `${provider}_local_preview_secret`
    };
    setForm((current) => ({ ...current, ...synthetic }));
    const response = await fetch(`${gatewayUrl}/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...synthetic, roles: [form.role], organization_id: form.organization_id, grade: form.grade })
    });
    const data = await response.json();
    if (!response.ok || !data.token || !data.user) {
      setAuthMessage(data.error ?? "Provider login needs OAuth client configuration.");
      return;
    }
    window.localStorage.setItem("learnlink_token", data.token);
    window.localStorage.setItem("learnlink_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function loadFeed(activeToken: string) {
    const response = await fetch(`${gatewayUrl}/community/feed/demo-user`, { headers: { authorization: `Bearer ${activeToken}` } });
    if (!response.ok) return;
    const data = await response.json();
    setPosts(data.posts ?? []);
  }

  async function createPost() {
    if (!postContent.trim()) return;
    await api("/community/posts", {
      method: "POST",
      body: JSON.stringify({ content: postContent, post_type: "platform_post" })
    });
    setPostContent("");
    if (token) await loadFeed(token);
  }

  async function loadCourses(activeToken: string) {
    const response = await fetch(`${gatewayUrl}/courses`, { headers: { authorization: `Bearer ${activeToken}` } });
    if (!response.ok) return;
    const data = await response.json();
    setCourses(data.courses ?? []);
    setLiveClasses(data.live_classes ?? []);
  }

  async function submitCourseWizard() {
    setWizardMessage("");
    const path = courseWizard === "live" ? "/courses/live-classes" : "/courses";
    const body = courseWizard === "live"
      ? {
          title: wizard.title,
          description: wizard.description,
          scheduled_at: wizard.scheduled_at,
          organization_id: wizard.organization_id,
          grade: wizard.grade,
          quiz_prompt: wizard.quiz_prompt,
          bank_details: wizard.bank_details
        }
      : {
          title: wizard.title,
          description: wizard.description,
          is_paid: wizard.is_paid,
          price: Number(wizard.price || 0),
          bank_details: wizard.bank_details,
          access_restrictions: { organizations: wizard.organization_id ? [wizard.organization_id] : [] },
          sections: [
            {
              title: "Section 1",
              order: 1,
              lessons: [
                { title: wizard.title || "Lesson", order: 1, video_url: wizard.video_url, video_size_bytes: Number(wizard.video_size_bytes || 0), quiz_prompt: wizard.quiz_prompt }
              ]
            }
          ]
        };
    const response = await api(path, { method: "POST", body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setWizardMessage(data.message ?? data.error ?? "Creation failed");
      return;
    }
    const price = data.upload_billing?.estimated_fee ?? data.quiz_billing?.estimated_fee;
    setWizardMessage(price ? `Created. Estimated platform price: ${price} ${data.upload_billing?.currency ?? data.quiz_billing?.currency ?? "PKR"}.` : "Created successfully.");
    setCourseWizard("");
    if (token) await loadCourses(token);
  }

  async function loadSection(current: Section, activeToken: string) {
    const pathBySection: Partial<Record<Section, string>> = {
      jobs: "/jobs",
      community: "/community/communities",
      channels: "/community/channels",
      admin: "/admin"
    };
    const path = pathBySection[current];
    if (!path) return;
    const response = await fetch(`${gatewayUrl}${path}`, { headers: { authorization: `Bearer ${activeToken}` } });
    if (!response.ok) return;
    const data = await response.json();
    setApiItems(data.jobs ?? data.communities ?? data.channels ?? data.moderation_log ?? []);
  }

  function logout() {
    window.localStorage.removeItem("learnlink_token");
    window.localStorage.removeItem("learnlink_user");
    setToken(null);
    setUser(null);
    setPosts([]);
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
            <Link href="/" className="text-xl font-black">LearnLink</Link>
            <div className="flex gap-3">
              <button className="rounded-lg border border-white/20 px-4 py-2" onClick={() => setAuthMode("login")}>Login</button>
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-bold" onClick={() => setAuthMode("signup")}>Create account</button>
            </div>
          </div>
        </header>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">AI-operated education platform</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">Learn, teach, hire, post, and meet live in one routed product.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Routes are now split across feed, courses, jobs, community, channels, admin, and live classroom pages.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["AI moderation", "Live classes", "Course uploads"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 font-bold">{item}</div>)}
            </div>
          </div>
          <section className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl">
            <h2 className="text-2xl font-black">{authMode === "signup" ? "Create account" : "Login"}</h2>
            <div className="mt-5 grid gap-3">
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <select className="rounded-lg border border-white/10 bg-slate-950 p-3" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="recruiter">Recruiter</option>
              </select>
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Organization for student visibility" value={form.organization_id} onChange={(event) => setForm({ ...form, organization_id: event.target.value })} />
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Grade/year" value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} />
              <button className="rounded-lg bg-violet-600 p-3 font-black" onClick={authenticate}>Continue</button>
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="rounded-lg border border-white/10 p-3 font-bold" onClick={() => providerAuth("google")}>Continue with Google</button>
                <button className="rounded-lg border border-white/10 p-3 font-bold" onClick={() => providerAuth("github")}>Continue with GitHub</button>
              </div>
              {authMessage ? <p className="text-sm text-amber-200">{authMessage}</p> : null}
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950 p-5 lg:block">
        <Link href="/feed" className="flex items-center gap-3 text-xl font-black"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500">L</span>LearnLink</Link>
        <nav className="mt-8 grid gap-2">
          {visibleTabs.map((tab) => (
            <Link key={tab.id} href={tab.href} className={`rounded-lg px-4 py-3 font-bold ${section === tab.id ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}>
              {tab.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-5 py-4 backdrop-blur">
          <div>
            <h1 className="text-2xl font-black">{visibleTabs.find((tab) => tab.id === section)?.label ?? "LearnLink"}</h1>
            <p className="text-sm text-slate-400">Signed in as {user.name} ({user.roles.join(", ")})</p>
          </div>
          <button className="rounded-lg border border-white/10 px-4 py-2 font-bold" onClick={logout}>Logout</button>
        </header>
        <div className="grid gap-5 p-5 xl:grid-cols-[1fr_320px]">
          <section className="min-w-0">{renderSection()}</section>
          <aside className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-black">Account</h3>
              <p className="mt-2 text-sm text-slate-300">{user.email}</p>
              <p className="text-sm text-slate-400">{user.organization_id || "No organization"} {user.grade ? `- ${user.grade}` : ""}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-black">Gateway</h3>
              <p className="mt-2 text-sm text-emerald-300">{gatewayUrl}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );

  function renderSection() {
    if (section === "feed") {
      return (
        <div className="space-y-4">
          <section className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl font-black">Create post</h2>
            <textarea className="mt-4 min-h-28 w-full rounded-lg border border-white/10 bg-slate-950 p-3" value={postContent} onChange={(event) => setPostContent(event.target.value)} placeholder="Share news, learning updates, or discussion" />
            <button className="mt-4 rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={createPost}>Submit for AI Review</button>
          </section>
          {posts.map((post) => <PostCard key={post.id ?? post.content} post={post} />)}
        </div>
      );
    }

    if (section === "courses") {
      return (
        <div className="space-y-4">
          {isTeacher ? (
            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-2xl font-black">Teacher Course Studio</h2>
              <p className="mt-2 text-slate-400">Only your uploaded courses and created live classes are listed here.</p>
              <div className="mt-4 flex gap-3">
                <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={() => setCourseWizard("course")}>Upload course</button>
                <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={() => setCourseWizard("live")}>Create live class</button>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-2xl font-black">Student Courses Portal</h2>
              <p className="mt-2 text-slate-400">Courses and live classes are filtered by your organization and grade, with open classes visible to all students.</p>
            </section>
          )}
          {courseWizard ? <CourseWizard mode={courseWizard} /> : null}
          <section className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-black">Courses</h2>
            <div className="mt-4 grid gap-3">
              {courses.map((course) => <article key={course.id} className="rounded-xl border border-white/10 bg-slate-950 p-4"><h3 className="font-black">{course.title}</h3><p className="mt-2 text-slate-400">{course.description}</p></article>)}
            </div>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-black">Live Classes</h2>
            <div className="mt-4 grid gap-3">
              {liveClasses.map((liveClass) => (
                <article key={liveClass.id} className="rounded-xl border border-white/10 bg-slate-950 p-4">
                  <h3 className="font-black">{liveClass.title} <span className="rounded-full bg-emerald-300 px-2 py-1 text-xs text-slate-950">{liveClass.status ?? "scheduled"}</span></h3>
                  <p className="mt-2 text-sm text-slate-400">{liveClass.course_title ?? "No linked course"} | {liveClass.is_open ? "Open" : `${liveClass.organization_id ?? "Org"} ${liveClass.grade ?? ""}`}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="rounded-lg bg-violet-600 px-4 py-2 font-black" href={`/live/${liveClass.id}`}>Join class</Link>
                    {liveClass.has_quiz || Number(liveClass.quiz_count ?? 0) > 0 ? <span className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold">Quiz enabled</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      );
    }

    return (
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-2xl font-black">{visibleTabs.find((tab) => tab.id === section)?.label}</h2>
        <p className="mt-2 text-slate-400">This is now a routed page. Data is loaded from the gateway when available.</p>
        <div className="mt-5 grid gap-3">
          {apiItems.slice(0, 10).map((item, index) => <pre key={index} className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">{JSON.stringify(item, null, 2)}</pre>)}
        </div>
      </section>
    );
  }

  function CourseWizard({ mode }: { mode: "course" | "live" }) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-black">{mode === "course" ? "Upload Course" : "Create Live Class"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Name" value={wizard.title} onChange={(event) => setWizard({ ...wizard, title: event.target.value })} />
          <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Description" value={wizard.description} onChange={(event) => setWizard({ ...wizard, description: event.target.value })} />
          {mode === "course" ? (
            <>
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Video URL or uploaded video URL" value={wizard.video_url} onChange={(event) => setWizard({ ...wizard, video_url: event.target.value })} />
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" type="file" accept="video/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setWizard({ ...wizard, video_url: `local-upload://${file.name}`, video_size_bytes: file.size });
              }} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={wizard.is_paid} onChange={(event) => setWizard({ ...wizard, is_paid: event.target.checked })} /> Paid course</label>
              <input className="rounded-lg border border-white/10 bg-slate-950 p-3" type="number" placeholder="Price" value={wizard.price} onChange={(event) => setWizard({ ...wizard, price: Number(event.target.value) })} />
            </>
          ) : (
            <input className="rounded-lg border border-white/10 bg-slate-950 p-3" type="datetime-local" value={wizard.scheduled_at} onChange={(event) => setWizard({ ...wizard, scheduled_at: event.target.value })} />
          )}
          <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Organization, empty means open to all" value={wizard.organization_id} onChange={(event) => setWizard({ ...wizard, organization_id: event.target.value })} />
          <input className="rounded-lg border border-white/10 bg-slate-950 p-3" placeholder="Grade/year" value={wizard.grade} onChange={(event) => setWizard({ ...wizard, grade: event.target.value })} />
          <textarea className="rounded-lg border border-white/10 bg-slate-950 p-3 md:col-span-2" placeholder="Optional quiz prompt. Bank details required if quiz billing applies." value={wizard.quiz_prompt} onChange={(event) => setWizard({ ...wizard, quiz_prompt: event.target.value })} />
          <input className="rounded-lg border border-white/10 bg-slate-950 p-3 md:col-span-2" placeholder="Bank details for paid course/quiz billing" value={wizard.bank_details} onChange={(event) => setWizard({ ...wizard, bank_details: event.target.value })} />
        </div>
        <button className="mt-4 rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={submitCourseWizard}>{mode === "course" ? "Create course" : "Create live class"}</button>
        {wizardMessage ? <p className="mt-3 text-sm text-emerald-300">{wizardMessage}</p> : null}
      </section>
    );
  }
}

function PostCard({ post }: { post: FeedPost }) {
  const status = post.status ?? post.ai_moderation_status ?? "approved";
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-black">{post.author ?? post.author_id ?? "LearnLink user"} <span className="rounded-full bg-emerald-300 px-2 py-1 text-xs text-slate-950">{status}</span></h3>
      <p className="mt-3 text-sm text-slate-400">{post.source ?? post.post_type ?? "Platform post"}</p>
      <p className="mt-4 leading-7">{post.content}</p>
      <div className="mt-4 flex gap-3 text-sm text-slate-400">
        <button className="rounded-lg border border-white/10 px-3 py-2">Like</button>
        <button className="rounded-lg border border-white/10 px-3 py-2">Comment</button>
        <button className="rounded-lg border border-white/10 px-3 py-2">Share</button>
      </div>
    </article>
  );
}
