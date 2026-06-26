"use client";

import { useEffect, useState } from "react";

type FeedPost = {
  id?: string;
  author?: string;
  author_id?: string;
  source?: string;
  status?: string;
  content: string;
  metrics?: string;
  ai_moderation_status?: string;
  post_type?: string;
};

type LocalUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

const featureCards = [
  {
    title: "Personalized Learning",
    description: "Resume and onboarding-aware course recommendations, teacher uploads, quizzes, roadmaps, and live classes."
  },
  {
    title: "Community and Channels",
    description: "Public communities, creator channels, paid subscriptions, follows, and autonomous AI moderation before posts go live."
  },
  {
    title: "Jobs and Growth",
    description: "Recruiter job posts, job search, one-click apply, premium profile boosts, and role-matched learning paths."
  }
];

const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4000";

export default function Home() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showAuth, setShowAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedToken = window.localStorage.getItem("learnlink_token");
    const savedUser = window.localStorage.getItem("learnlink_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as LocalUser);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadFeed(token);
    }
  }, [token]);

  async function loadFeed(activeToken: string) {
    const response = await fetch(`${gatewayUrl}/community/feed/demo-user`, {
      headers: { authorization: `Bearer ${activeToken}` }
    });

    if (response.status === 401) {
      logout();
      return;
    }

    const data = (await response.json()) as { posts?: FeedPost[] };
    setPosts(data.posts ?? []);
  }

  async function authenticate() {
    setMessage("");
    const response = await fetch(`${gatewayUrl}/auth/${authMode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, roles: [role] })
    });
    const data = (await response.json()) as { token?: string; user?: LocalUser; error?: string };

    if (!response.ok || !data.token || !data.user) {
      setMessage(data.error ?? "Authentication failed");
      return;
    }

    window.localStorage.setItem("learnlink_token", data.token);
    window.localStorage.setItem("learnlink_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setActiveTab(data.user.roles.includes("admin") ? "admin" : "feed");
    setShowAuth(false);
  }

  async function createPost() {
    if (!token || !content.trim()) return;
    await fetch(`${gatewayUrl}/community/posts`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ content, post_type: "platform_post" })
    });
    setContent("");
    await loadFeed(token);
  }

  function logout() {
    window.localStorage.removeItem("learnlink_token");
    window.localStorage.removeItem("learnlink_user");
    setToken(null);
    setUser(null);
    setPosts([]);
    setActiveTab("feed");
  }

  function openAuth(mode: "login" | "signup" | "admin") {
    setAuthMode(mode === "admin" ? "login" : mode);
    setRole(mode === "admin" ? "admin" : "student");
    setName(mode === "admin" ? "LearnLink Admin" : "");
    setEmail(mode === "admin" ? "admin@learnlink.local" : "");
    setPassword("");
    setMessage("");
    setShowAuth(true);
  }

  const tabs = ["feed", "courses", "jobs", "community", "channels", ...(user?.roles.includes("admin") ? ["admin"] : [])];

  if (!token || !user) {
    return (
      <main className="min-h-screen bg-paper text-ink">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-xl font-semibold">LearnLink</h1>
              <p className="text-sm text-slate-600">AI-operated education, community, and jobs</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-line px-4 py-2" onClick={() => openAuth("login")}>Login</button>
              <button className="rounded-md bg-brand px-4 py-2 text-white" onClick={() => openAuth("signup")}>Sign up</button>
              <button className="rounded-md border border-line px-4 py-2" onClick={() => openAuth("admin")}>Admin Login</button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-10">
          {!showAuth ? (
            <>
              <div className="max-w-3xl py-8">
                <h2 className="text-4xl font-semibold">LearnLink</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Build skills, join AI-moderated communities, attend live classes, and find career opportunities from one connected learning platform.
                </p>
                <div className="mt-6 flex gap-3">
                  <button className="rounded-md bg-brand px-4 py-2 text-white" onClick={() => openAuth("signup")}>Create account</button>
                  <button className="rounded-md border border-line px-4 py-2" onClick={() => openAuth("login")}>Login</button>
                  <button className="rounded-md border border-line px-4 py-2" onClick={() => openAuth("admin")}>Admin Login</button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {featureCards.map((feature) => (
                  <article key={feature.title} className="rounded-lg border border-line bg-white p-5">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <section className="max-w-xl rounded-lg border border-line bg-white p-5">
              <h2 className="text-2xl font-semibold">{authMode === "signup" ? "Create account" : "Login"}</h2>
              <p className="mt-2 text-slate-600">A local dev account unlocks the preview feed.</p>
              <label className="mt-4 block text-sm font-medium">Name<input className="mt-2 w-full rounded-md border border-line p-3" value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="mt-4 block text-sm font-medium">Email<input className="mt-2 w-full rounded-md border border-line p-3" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label className="mt-4 block text-sm font-medium">Password<input type="password" className="mt-2 w-full rounded-md border border-line p-3" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <label className="mt-4 block text-sm font-medium">Role
                <select className="mt-2 w-full rounded-md border border-line p-3" value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="mt-5 flex gap-2">
                <button className="rounded-md bg-brand px-4 py-2 text-white" onClick={authenticate}>Continue</button>
                <button className="rounded-md border border-line px-4 py-2" onClick={() => setShowAuth(false)}>Back</button>
              </div>
              {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
            </section>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">LearnLink</h1>
            <p className="text-sm text-slate-600">Signed in as {user.name}</p>
          </div>
          <button className="rounded-md border border-line px-4 py-2" onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`rounded-md border border-line px-4 py-2 ${activeTab === tab ? "bg-brand text-white" : "bg-white"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "feed" ? (
          <>
            <div className="rounded-lg border border-line bg-white p-4">
            <h2 className="font-semibold">Create platform post</h2>
            <p className="mt-1 text-sm text-slate-600">Only logged-in users can create or view posts.</p>
            <textarea className="mt-3 min-h-28 w-full rounded-md border border-line p-3" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a local test post" />
            <button className="mt-3 rounded-md bg-brand px-4 py-2 text-white" onClick={createPost}>Submit for AI Review</button>
            </div>

            {posts.map((post) => {
            const status = post.status ?? post.ai_moderation_status ?? "approved";
            return (
              <article key={`${post.id ?? post.author ?? post.author_id}-${post.content}`} className="rounded-lg border border-line bg-white p-4">
                <h2 className="font-semibold">{post.author ?? post.author_id ?? "LearnLink user"} <span className="ml-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-success">{status}</span></h2>
                <p className="mt-3 text-sm text-slate-600">{post.source ?? post.post_type ?? "Platform-wide"}</p>
                <p className="mt-4 leading-7">{post.content}</p>
                <p className="mt-4 text-sm text-slate-600">{post.metrics ?? "Live API item"}</p>
              </article>
            );
            })}
          </>
          ) : (
            <section className="rounded-lg border border-line bg-white p-5">
              <h2 className="text-2xl font-semibold">{activeTab[0].toUpperCase() + activeTab.slice(1)}</h2>
              <p className="mt-2 text-slate-600">
                {activeTab === "admin"
                  ? "Admin oversight dashboard: moderation log, agent health, feature flags, and user activity."
                  : `Preview tab for LearnLink ${activeTab}. Full service data will render here when the production API is connected.`}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="font-semibold">Account</h2>
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
            <p className="mt-1 text-sm text-slate-600">{user.roles.join(", ")}</p>
          </section>
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="font-semibold">Feed source</h2>
            <p className="mt-2 text-sm text-slate-600">Local backend</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
