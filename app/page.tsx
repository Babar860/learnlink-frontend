const posts = [
  {
    author: "Ayesha Khan",
    source: "AI and Data Community",
    status: "approved",
    content: "Built a small classifier today and want feedback on model evaluation.",
    metrics: "42 likes · 11 comments"
  },
  {
    author: "Bilal Ahmed",
    source: "Product Careers Channel",
    status: "approved",
    content: "Shared a roadmap for moving from support into junior product roles.",
    metrics: "28 likes · 6 comments"
  },
  {
    author: "Sara Noor",
    source: "Platform-wide",
    status: "pending",
    content: "Draft post is waiting for autonomous AI moderation before it appears.",
    metrics: "Moderation queue"
  }
];

const panels = [
  ["Courses", "Resume-aware course discovery, teacher uploads, quizzes, live classes, premium key points."],
  ["Community", "Public communities, free and paid channels, follows, AI-moderated posts."],
  ["Jobs", "Paid recruiter posting, keyword/location search, one-click apply, premium profile boosts."],
  ["Admin", "Read-only automation dashboard for moderation logs, agent health, revenue, and flags."]
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold tracking-normal">LearnLink</h1>
            <p className="text-sm text-slate-600">Home feed · courses · jobs · community</p>
          </div>
          <nav className="flex gap-2 text-sm">
            <a className="rounded-md border border-line px-3 py-2" href="#feed">Feed</a>
            <a className="rounded-md border border-line px-3 py-2" href="#portals">Portals</a>
            <a className="rounded-md bg-brand px-3 py-2 text-white" href="#create">Post</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <div id="feed" className="space-y-4">
          <div id="create" className="rounded-lg border border-line bg-white p-4">
            <label className="text-sm font-medium" htmlFor="post">Create platform post</label>
            <textarea
              id="post"
              className="mt-2 min-h-28 w-full rounded-md border border-line p-3"
              placeholder="Share an update. It will be reviewed by the content-moderation-agent before publishing."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-md bg-brand px-4 py-2 text-white">Submit for AI Review</button>
              <button className="rounded-md border border-line px-4 py-2">Add media</button>
            </div>
          </div>

          {posts.map((post) => (
            <article key={`${post.author}-${post.content}`} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{post.author}</h2>
                  <p className="text-sm text-slate-600">{post.source}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${post.status === "approved" ? "bg-emerald-50 text-success" : "bg-slate-100 text-slate-700"}`}>
                  {post.status}
                </span>
              </div>
              <p className="mt-4 text-base leading-7">{post.content}</p>
              <p className="mt-4 text-sm text-slate-600">{post.metrics}</p>
            </article>
          ))}
        </div>

        <aside id="portals" className="space-y-3">
          {panels.map(([title, description]) => (
            <section key={title} className="rounded-lg border border-line bg-white p-4">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </section>
          ))}
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="font-semibold">Agent Health</h2>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-600">Moderation</dt>
              <dd className="font-medium">Autonomous</dd>
              <dt className="text-slate-600">Ranking</dt>
              <dd className="font-medium">Per session</dd>
              <dt className="text-slate-600">Eligibility</dt>
              <dd className="font-medium">Nightly</dd>
            </dl>
          </section>
        </aside>
      </section>
    </main>
  );
}

