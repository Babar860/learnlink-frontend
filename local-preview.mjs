import http from "node:http";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LearnLink Local Preview</title>
  <style>
    * { box-sizing: border-box; }
    :root {
      --bg: #f4f7fb;
      --surface: #ffffff;
      --surface-soft: #eef4ff;
      --ink: #101827;
      --muted: #607089;
      --line: #d9e2ef;
      --brand: #2563eb;
      --brand-dark: #1d4ed8;
      --success: #0f766e;
      --warning: #b45309;
      --shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
    }
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--bg); color: var(--ink); }
    button, input, textarea, select { font: inherit; }
    button { border: 0; border-radius: 8px; background: var(--brand); color: white; padding: 10px 14px; cursor: pointer; font-weight: 650; }
    button:hover { background: var(--brand-dark); }
    button.secondary { background: white; border: 1px solid var(--line); color: var(--ink); }
    button.secondary:hover { background: #f8fafc; }
    input, textarea, select { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 11px 12px; margin-top: 7px; background: white; }
    textarea { min-height: 104px; resize: vertical; }
    .hidden { display: none !important; }
    .muted { color: var(--muted); }
    .badge { display: inline-flex; align-items: center; border-radius: 999px; background: #ecfdf5; color: var(--success); padding: 4px 10px; font-size: 12px; font-weight: 700; }
    .landing { min-height: 100vh; background: linear-gradient(135deg, #eef5ff 0%, #f8fbff 52%, #ffffff 100%); }
    .landing-nav { max-width: 1180px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: -0.02em; }
    .brand-mark { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; color: white; background: linear-gradient(135deg, #2563eb, #0f766e); box-shadow: var(--shadow); }
    .landing-main { max-width: 1180px; margin: 0 auto; padding: 38px 24px 64px; }
    .hero-panel { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr); gap: 26px; align-items: stretch; }
    .hero-copy { background: rgba(255,255,255,0.76); border: 1px solid var(--line); border-radius: 18px; padding: 34px; box-shadow: var(--shadow); }
    .hero-copy h1 { font-size: 52px; line-height: 1.02; margin: 10px 0 16px; letter-spacing: -0.04em; }
    .hero-copy p { max-width: 680px; line-height: 1.7; color: var(--muted); font-size: 17px; }
    .eyebrow { color: var(--brand); font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
    .hero-card { background: #0f172a; color: white; border-radius: 18px; padding: 24px; box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: space-between; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 22px; }
    .metric { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px; }
    .metric strong { display: block; font-size: 24px; }
    .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
    .feature-card, .card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 18px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); }
    .feature-card h3, .card h3 { margin: 0 0 10px; }
    .auth-card { max-width: 520px; margin: 42px auto; background: white; border: 1px solid var(--line); border-radius: 16px; padding: 24px; box-shadow: var(--shadow); }
    .app-shell { min-height: 100vh; display: grid; grid-template-columns: 260px minmax(0, 1fr); }
    .sidebar { background: #0f172a; color: white; padding: 18px; display: flex; flex-direction: column; gap: 18px; position: sticky; top: 0; height: 100vh; }
    .sidebar .brand { padding: 6px 4px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .side-nav { display: grid; gap: 7px; }
    .nav-item { width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; background: transparent; color: #cbd5e1; border: 1px solid transparent; padding: 11px 12px; }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active { background: white; color: #0f172a; border-color: white; }
    .sidebar-footer { margin-top: auto; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; color: #cbd5e1; font-size: 13px; }
    .workspace { min-width: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
    .topbar { height: 74px; background: rgba(255,255,255,0.88); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 2; }
    .topbar h1 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
    .search { max-width: 380px; width: 34vw; border: 1px solid var(--line); border-radius: 999px; padding: 10px 14px; color: var(--muted); background: #f8fafc; }
    .content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; padding: 22px; }
    .page-header { background: linear-gradient(135deg, #ffffff, #eef4ff); border: 1px solid var(--line); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
    .page-header h2 { margin: 0 0 8px; font-size: 28px; letter-spacing: -0.03em; }
    .composer { margin-bottom: 16px; }
    .feed-card { display: grid; gap: 10px; }
    .feed-card h3 { display: flex; align-items: center; gap: 10px; }
    .right-panel { display: grid; gap: 14px; align-content: start; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .stat-row:last-child { border-bottom: 0; }
    .list-grid { display: grid; gap: 12px; }
    .preview-item { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .preview-item strong { display: block; margin-bottom: 4px; }
    @media (max-width: 950px) {
      .app-shell { grid-template-columns: 1fr; }
      .sidebar { position: static; height: auto; }
      .side-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .content-grid, .hero-panel, .feature-grid { grid-template-columns: 1fr; }
      .search { display: none; }
    }
  </style>
</head>
<body>
  <section id="public-shell" class="landing">
    <nav class="landing-nav">
      <div class="brand"><span class="brand-mark">L</span><span>LearnLink</span></div>
      <div class="actions" id="public-actions"></div>
    </nav>
    <main class="landing-main">
      <section id="landing">
        <div class="hero-panel">
          <div class="hero-copy">
            <div class="eyebrow">AI-operated learning platform</div>
            <h1>Skills, community, classes, and jobs in one workspace.</h1>
            <p>LearnLink personalizes education and career growth while autonomous agents moderate posts, rank feeds, recommend courses, and assist live classes.</p>
            <div class="actions">
              <button data-auth-mode="signup">Create account</button>
              <button class="secondary" data-auth-mode="login">Login</button>
              <button class="secondary" data-auth-mode="admin">Admin Login</button>
            </div>
          </div>
          <aside class="hero-card">
            <div>
              <div class="eyebrow" style="color:#93c5fd">Platform snapshot</div>
              <h2>Ready for learners, teachers, recruiters, and admins.</h2>
              <p style="color:#cbd5e1;line-height:1.6">A local product preview with auth-gated feed and role-aware navigation.</p>
            </div>
            <div class="metric-grid">
              <div class="metric"><strong>8</strong><span>AI agents</span></div>
              <div class="metric"><strong>5</strong><span>App tabs</span></div>
              <div class="metric"><strong>24h</strong><span>Re-check cron</span></div>
              <div class="metric"><strong>FCM</strong><span>Notifications</span></div>
            </div>
          </aside>
        </div>
        <div class="feature-grid">
          <article class="feature-card"><h3>Personalized Learning</h3><p class="muted">Course recommendations, live classes, quizzes, roadmaps, and premium key points.</p></article>
          <article class="feature-card"><h3>Community and Channels</h3><p class="muted">Public communities, paid/private channels, follows, subscriptions, and AI moderation.</p></article>
          <article class="feature-card"><h3>Jobs and Growth</h3><p class="muted">Recruiter job posts, one-click apply, premium profile boost, and role-matched learning.</p></article>
        </div>
      </section>
      <section id="auth-panel" class="auth-card hidden">
        <h2 id="auth-title">Login</h2>
        <p class="muted">Use any local email to unlock the product preview.</p>
        <label>Name<input id="name" placeholder="Your name" /></label>
        <label>Email<input id="email" placeholder="you@example.com" /></label>
        <label>Role
          <select id="role">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <p class="actions">
          <button id="auth-submit">Continue</button>
          <button class="secondary" id="auth-cancel">Back</button>
        </p>
        <p id="auth-error" class="muted"></p>
      </section>
    </main>
  </section>

  <section id="app-shell" class="app-shell hidden">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">L</span><span>LearnLink</span></div>
      <div class="side-nav" id="side-nav"></div>
      <div class="sidebar-footer">
        <strong>Automation</strong>
        <p>Moderation, recommendations, eligibility, feed ranking, and grading run through AI agents.</p>
      </div>
    </aside>
    <section class="workspace">
      <header class="topbar">
        <div>
          <h1 id="page-title">Feed</h1>
          <span class="muted" id="page-subtitle">Personalized home feed</span>
        </div>
        <div class="search">Search courses, channels, jobs...</div>
        <button class="secondary" id="logout">Logout</button>
      </header>
      <main class="content-grid">
        <section id="main-panel"></section>
        <aside class="right-panel" id="right-panel"></aside>
      </main>
    </section>
  </section>

  <script>
    const gatewayUrl = "http://localhost:4000";
    let authMode = "login";
    let activeTab = "feed";
    let token = localStorage.getItem("learnlink_token");
    let user = JSON.parse(localStorage.getItem("learnlink_user") || "null");
    let feedPosts = [];

    const show = (id) => document.getElementById(id).classList.remove("hidden");
    const hide = (id) => document.getElementById(id).classList.add("hidden");
    const isAdmin = () => user && Array.isArray(user.roles) && user.roles.includes("admin");
    const tabLabels = { feed: "Feed", courses: "Courses", jobs: "Jobs", community: "Community", channels: "Channels", admin: "Admin" };
    const tabSubtitles = {
      feed: "Personalized posts and publishing",
      courses: "Recommended courses and live classes",
      jobs: "Search and apply to career opportunities",
      community: "Subscribed public communities",
      channels: "Creator and teacher broadcast spaces",
      admin: "Read-only operations dashboard"
    };

    function visibleTabs() {
      const tabs = ["feed", "courses", "jobs", "community", "channels"];
      if (isAdmin()) tabs.push("admin");
      return tabs;
    }

    function bindAuthButtons() {
      document.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          authMode = button.dataset.authMode;
          document.getElementById("auth-title").textContent = authMode === "signup" ? "Create account" : authMode === "admin" ? "Admin login" : "Login";
          document.getElementById("role").value = authMode === "admin" ? "admin" : "student";
          document.getElementById("name").value = authMode === "admin" ? "Admin User" : "";
          document.getElementById("email").value = authMode === "admin" ? "admin@learnlink.local" : "";
          hide("landing");
          show("auth-panel");
        });
      });
    }

    function renderShell() {
      if (token && user) {
        hide("public-shell");
        show("app-shell");
        document.getElementById("logout").onclick = logout;
        renderNav();
        renderActiveTab();
      } else {
        show("public-shell");
        hide("app-shell");
        show("landing");
        hide("auth-panel");
        document.getElementById("public-actions").innerHTML = '<button class="secondary" data-auth-mode="login">Login</button><button data-auth-mode="signup">Sign up</button><button class="secondary" data-auth-mode="admin">Admin Login</button>';
        bindAuthButtons();
      }
    }

    function renderNav() {
      document.getElementById("side-nav").innerHTML = visibleTabs().map((tab) => '<button class="nav-item ' + (tab === activeTab ? 'active' : '') + '" data-tab="' + tab + '"><span>' + tabLabels[tab] + '</span><span>›</span></button>').join("");
      document.querySelectorAll("[data-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          activeTab = button.dataset.tab;
          renderNav();
          renderActiveTab();
        });
      });
    }

    function setHeader(title, subtitle) {
      document.getElementById("page-title").textContent = title;
      document.getElementById("page-subtitle").textContent = subtitle;
    }

    function renderRightPanel() {
      document.getElementById("right-panel").innerHTML =
        '<div class="card"><h3>Account</h3><div class="stat-row"><span>Name</span><strong>' + user.name + '</strong></div><div class="stat-row"><span>Role</span><strong>' + user.roles.join(", ") + '</strong></div><div class="stat-row"><span>Gateway</span><strong>Online</strong></div></div>' +
        '<div class="card"><h3>Agent Health</h3><div class="stat-row"><span>Moderation</span><strong>Active</strong></div><div class="stat-row"><span>Ranking</span><strong>Session</strong></div><div class="stat-row"><span>Eligibility</span><strong>Nightly</strong></div></div>' +
        '<div class="card"><h3>Next Step</h3><p class="muted">Connect production APIs and replace preview data with persisted PostgreSQL records.</p></div>';
    }

    function renderActiveTab() {
      setHeader(tabLabels[activeTab], tabSubtitles[activeTab]);
      renderRightPanel();
      if (activeTab === "feed") return renderFeedTab();
      if (activeTab === "courses") return renderCards("Courses", [
        ["AI Career Foundations", "Recommended from onboarding answers.", "Open roadmap"],
        ["Live Class: Data Skills", "Organization and grade filters supported.", "Scheduled"],
        ["Premium Roadmap", "Unlocks roadmap plus 15 matching jobs.", "Premium"]
      ]);
      if (activeTab === "jobs") return renderCards("Jobs", [
        ["Junior Data Analyst", "Karachi - one-click apply.", "Apply"],
        ["Frontend Intern", "Remote - recruiter paid posting.", "Remote"],
        ["Product Associate", "Priority ranking for premium profiles.", "Boosted"]
      ]);
      if (activeTab === "community") return renderCards("Community", [
        ["AI and Data Community", "Public discussion space.", "Subscribed"],
        ["Career Switchers", "AI-moderated posts from subscribed members.", "Active"],
        ["Student Help Desk", "Ask questions and follow updates.", "Public"]
      ]);
      if (activeTab === "channels") return renderCards("Channels", [
        ["Product Careers Channel", "Free creator channel.", "Follow"],
        ["Premium Data Mentorship", "Paid private channel via Stripe.", "$"],
        ["Teacher Materials", "Async course-linked channel.", "Course"]
      ]);
      if (activeTab === "admin") return renderCards("Admin", [
        ["Moderation Log", "Read-only: pending, approved, rejected, removed.", "View"],
        ["Agent Health", "Queue depth, error rate, restart controls.", "Healthy"],
        ["Feature Flags", "Toggle emergency flags and thresholds.", "Config"]
      ]);
    }

    function renderCards(title, rows) {
      document.getElementById("main-panel").innerHTML =
        '<div class="page-header"><h2>' + title + '</h2><p class="muted">' + tabSubtitles[activeTab] + '</p></div>' +
        '<div class="list-grid">' + rows.map((row) => '<article class="card preview-item"><div><strong>' + row[0] + '</strong><p class="muted">' + row[1] + '</p></div><span class="badge">' + row[2] + '</span></article>').join("") + '</div>';
    }

    async function renderFeedTab() {
      await loadFeed();
      document.getElementById("main-panel").innerHTML =
        '<div class="page-header"><h2>Home Feed</h2><p class="muted">Approved posts from your followed sources. Create a post to send it through AI moderation.</p></div>' +
        '<div class="card composer"><h3>Create platform post</h3><textarea id="post" placeholder="Share an update with your network"></textarea><p><button id="submit">Submit for AI Review</button></p></div><div id="feed" class="list-grid"></div>';
      document.getElementById("submit").addEventListener("click", submitPost);
      renderFeedPosts();
    }

    function renderFeedPosts() {
      document.getElementById("feed").innerHTML = feedPosts.map((post) => '<article class="card feed-card"><h3>' + (post.author || post.author_id || "LearnLink user") + ' <span class="badge">' + (post.status || post.ai_moderation_status || "approved") + '</span></h3><p class="muted">' + (post.source || post.post_type || "Platform-wide") + '</p><p>' + post.content + '</p><p class="muted">' + (post.metrics || "Live API item") + '</p></article>').join("");
    }

    async function authenticate() {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const role = document.getElementById("role").value;
      const path = authMode === "signup" || authMode === "admin" ? "/auth/signup" : "/auth/login";
      const response = await fetch(gatewayUrl + path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, roles: [role] })
      });
      const data = await response.json();
      if (!response.ok) {
        document.getElementById("auth-error").textContent = data.error || "Authentication failed";
        return;
      }
      token = data.token;
      user = data.user;
      activeTab = role === "admin" ? "admin" : "feed";
      localStorage.setItem("learnlink_token", token);
      localStorage.setItem("learnlink_user", JSON.stringify(user));
      renderShell();
    }

    function logout() {
      token = null;
      user = null;
      activeTab = "feed";
      feedPosts = [];
      localStorage.removeItem("learnlink_token");
      localStorage.removeItem("learnlink_user");
      renderShell();
    }

    async function loadFeed() {
      const response = await fetch(gatewayUrl + "/community/feed/demo-user", { headers: { authorization: "Bearer " + token } });
      if (response.status === 401) return logout();
      const data = await response.json();
      feedPosts = data.posts || [];
    }

    async function submitPost() {
      const content = document.getElementById("post").value.trim();
      if (!content) return;
      await fetch(gatewayUrl + "/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token },
        body: JSON.stringify({ content, post_type: "platform_post" })
      });
      await renderFeedTab();
    }

    document.getElementById("auth-submit").addEventListener("click", authenticate);
    document.getElementById("auth-cancel").addEventListener("click", renderShell);
    bindAuthButtons();
    renderShell();
  </script>
</body>
</html>`;

http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}).listen(3000, "127.0.0.1", () => {
  console.log("learnlink local preview listening on http://127.0.0.1:3000");
});
