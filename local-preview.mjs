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
      --bg: #08111f;
      --surface: #111b2f;
      --surface-soft: #17243d;
      --ink: #f8fafc;
      --muted: #9fb0c8;
      --line: #263653;
      --brand: #7c3aed;
      --brand-dark: #5b21b6;
      --success: #0f766e;
      --warning: #b45309;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
    }
    body.light {
      --bg: #f4f7fb;
      --surface: #ffffff;
      --surface-soft: #eef4ff;
      --ink: #101827;
      --muted: #607089;
      --line: #d9e2ef;
      --brand: #2563eb;
      --brand-dark: #1d4ed8;
      --shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
    }
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--bg); color: var(--ink); }
    button, input, textarea, select { font: inherit; }
    button { border: 0; border-radius: 8px; background: var(--brand); color: white; padding: 10px 14px; cursor: pointer; font-weight: 650; }
    button:hover { background: var(--brand-dark); }
    button.secondary { background: var(--surface); border: 1px solid var(--line); color: var(--ink); }
    button.secondary:hover { background: var(--surface-soft); }
    input, textarea, select { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 11px 12px; margin-top: 7px; background: #0d1729; color: var(--ink); }
    body.light input, body.light textarea, body.light select { background: white; color: var(--ink); }
    textarea { min-height: 104px; resize: vertical; }
    .hidden { display: none !important; }
    .muted { color: var(--muted); }
    .badge { display: inline-flex; align-items: center; border-radius: 999px; background: #ecfdf5; color: var(--success); padding: 4px 10px; font-size: 12px; font-weight: 700; }
    .landing { min-height: 100vh; background: radial-gradient(circle at 20% 10%, rgba(124, 58, 237, 0.22), transparent 32%), linear-gradient(135deg, #080d1a 0%, #101a31 52%, #08111f 100%); }
    body.light .landing { background: linear-gradient(135deg, #eef5ff 0%, #f8fbff 52%, #ffffff 100%); }
    .landing-nav { max-width: 1180px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: -0.02em; }
    .brand-mark { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; color: white; background: linear-gradient(135deg, #2563eb, #0f766e); box-shadow: var(--shadow); }
    .landing-main { max-width: 1180px; margin: 0 auto; padding: 38px 24px 64px; }
    .hero-panel { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr); gap: 26px; align-items: stretch; }
    .hero-copy { background: rgba(17,27,47,0.78); border: 1px solid var(--line); border-radius: 18px; padding: 34px; box-shadow: var(--shadow); }
    body.light .hero-copy { background: rgba(255,255,255,0.76); }
    .hero-copy h1 { font-size: 52px; line-height: 1.02; margin: 10px 0 16px; letter-spacing: -0.04em; }
    .hero-copy p { max-width: 680px; line-height: 1.7; color: var(--muted); font-size: 17px; }
    .eyebrow { color: var(--brand); font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
    .hero-card { background: #0f172a; color: white; border-radius: 18px; padding: 24px; box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: space-between; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 22px; }
    .metric { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px; }
    .metric strong { display: block; font-size: 24px; }
    .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
    .feature-card, .card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 18px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16); }
    .feature-card h3, .card h3 { margin: 0 0 10px; }
    .auth-card { max-width: 560px; margin: 42px auto; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 24px; box-shadow: var(--shadow); }
    .app-shell { min-height: 100vh; display: grid; grid-template-columns: 260px minmax(0, 1fr); }
    .sidebar { background: #0f172a; color: white; padding: 18px; display: flex; flex-direction: column; gap: 18px; position: sticky; top: 0; height: 100vh; }
    .sidebar .brand { padding: 6px 4px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .side-nav { display: grid; gap: 7px; }
    .nav-item { width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; background: transparent; color: #cbd5e1; border: 1px solid transparent; padding: 11px 12px; }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active { background: white; color: #0f172a; border-color: white; }
    .sidebar-footer { margin-top: auto; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; color: #cbd5e1; font-size: 13px; }
    .workspace { min-width: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
    .topbar { height: 74px; background: rgba(8,17,31,0.9); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 2; }
    body.light .topbar { background: rgba(255,255,255,0.88); }
    .topbar h1 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
    .search { max-width: 380px; width: 34vw; border: 1px solid var(--line); border-radius: 999px; padding: 10px 14px; color: var(--muted); background: #101a2f; }
    body.light .search { background: #f8fafc; }
    .search input { border: 0; margin: 0; padding: 0; background: transparent; outline: 0; }
    .content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; padding: 22px; }
    .page-header { background: linear-gradient(135deg, var(--surface), var(--surface-soft)); border: 1px solid var(--line); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
    .page-header h2 { margin: 0 0 8px; font-size: 28px; letter-spacing: -0.03em; }
    .composer { margin-bottom: 16px; }
    .feed-card { display: grid; gap: 10px; }
    .feed-card h3 { display: flex; align-items: center; gap: 10px; }
    .media-tools { display: grid; gap: 10px; margin-top: 12px; }
    .upload-box { border: 1px dashed var(--line); border-radius: 10px; padding: 14px; background: rgba(255,255,255,0.03); }
    .upload-box input { margin-top: 8px; padding: 8px; }
    .media-preview { display: flex; gap: 10px; overflow-x: auto; padding: 4px 0; }
    .media-preview img { width: 92px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid var(--line); flex: 0 0 auto; }
    .media-carousel { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 0 8px; }
    .media-slide { min-width: min(540px, 86%); scroll-snap-align: start; position: relative; }
    .post-media { width: 100%; max-height: 360px; object-fit: cover; border-radius: 10px; border: 1px solid var(--line); display: block; background: #020617; }
    .media-count { position: absolute; top: 10px; right: 10px; background: rgba(2, 6, 23, 0.78); color: white; border-radius: 999px; padding: 4px 8px; font-size: 12px; font-weight: 700; }
    .post-actions { display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--line); padding-top: 10px; }
    .post-actions button { background: transparent; color: var(--muted); border: 1px solid var(--line); padding: 7px 10px; }
    .post-actions button.active, .post-actions button:hover { color: white; background: var(--brand); border-color: var(--brand); }
    .comments { border-top: 1px solid var(--line); padding-top: 10px; display: grid; gap: 8px; }
    .comment-row { background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; }
    .comment-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: end; }
    .form-grid { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 12px; }
    .status-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .badge.pending { background: #fff7ed; color: var(--warning); }
    .badge.rejected { background: #fef2f2; color: #b91c1c; }
    .right-panel { display: grid; gap: 14px; align-content: start; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .stat-row:last-child { border-bottom: 0; }
    .list-grid { display: grid; gap: 12px; }
    .preview-item { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .preview-item strong { display: block; margin-bottom: 4px; }
    .auth-options { display: grid; gap: 12px; margin-top: 18px; }
    .oauth-button { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #0d1729; border: 1px solid var(--line); color: var(--ink); }
    .oauth-button:hover { background: #17243d; }
    .auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; color: var(--muted); font-size: 13px; }
    .auth-divider::before, .auth-divider::after { content: ""; height: 1px; background: var(--line); flex: 1; }
    .pill-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
    .mini-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; }
    .target-panel { margin-top: 12px; padding: 14px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,0.03); }
    .theme-toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
    .section-separator { border: 0; border-top: 1px solid var(--line); margin: 22px 0; }
    .section-label { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 10px 0 12px; }
    .section-label h3 { margin: 0; }
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
        <h2 id="auth-title">Login to LearnLink</h2>
        <p class="muted">Use your LearnLink account or continue with a connected provider.</p>
        <label>Name<input id="auth-name" placeholder="Your full name" /></label>
        <label>Email<input id="auth-email" placeholder="you@example.com" /></label>
        <label>Password<input id="auth-password" type="password" placeholder="At least 8 characters" /></label>
        <label>Profile type
          <select id="auth-role">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </label>
        <p class="actions">
          <button id="login-submit">Login</button>
          <button class="secondary" id="signup-submit">Create account</button>
        </p>
        <div class="auth-divider">or continue with</div>
        <div class="auth-options">
          <button class="oauth-button" data-provider="google">G Continue with Google</button>
          <button class="oauth-button" data-provider="github">GitHub Continue with GitHub</button>
        </div>
        <p class="actions"><button class="secondary" id="auth-cancel">Back</button></p>
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
        <div class="theme-toggle"><span>Theme</span><button class="secondary" id="theme-toggle">Dark</button></div>
      </div>
    </aside>
    <section class="workspace">
      <header class="topbar">
        <div>
          <h1 id="page-title">Feed</h1>
          <span class="muted" id="page-subtitle">Personalized home feed</span>
        </div>
        <div class="search"><input id="global-search" placeholder="Search posts, courses, channels, jobs..." /></div>
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
    let myPosts = [];
    let myChannels = [];
    let postableCommunities = [];
    let ownerReviewPosts = [];
    let searchQuery = "";
    let postMode = "community_post";
    let theme = localStorage.getItem("learnlink_theme") || "dark";
    let selectedPostImages = [];

    const show = (id) => document.getElementById(id).classList.remove("hidden");
    const hide = (id) => document.getElementById(id).classList.add("hidden");
    const isAdmin = () => user && Array.isArray(user.roles) && user.roles.includes("admin");
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    const normalized = (value) => String(value ?? "").toLowerCase();
    const matchesQuery = (item, fields) => !searchQuery || fields.some((field) => normalized(item[field]).includes(searchQuery));
    const normalizeMedia = (value) => Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []);
    const postKey = (post) => String(post.id || post.created_at || post.content || "post").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
    const interactionKey = (post, suffix) => "learnlink_post_" + postKey(post) + "_" + suffix;
    const tabLabels = { feed: "Feed", my_posts: "My Posts", courses: "Courses", jobs: "Jobs", community: "Community", channels: "Channels", admin: "Admin" };
    const tabSubtitles = {
      feed: "Approved posts from your followed communities and channels",
      my_posts: "Create posts, manage review states, and track approvals",
      courses: "Recommended courses and live classes",
      jobs: "Search and apply to career opportunities",
      community: "Subscribed public communities",
      channels: "Creator and teacher broadcast spaces",
      admin: "Read-only operations dashboard"
    };

    function visibleTabs() {
      const tabs = ["feed", "my_posts", "courses", "jobs", "community", "channels"];
      if (isAdmin()) tabs.push("admin");
      return tabs;
    }

    function bindAuthButtons() {
      document.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          authMode = button.dataset.authMode;
          document.getElementById("auth-title").textContent = authMode === "signup" ? "Create LearnLink account" : "Login to LearnLink";
          document.getElementById("auth-error").textContent = "";
          document.getElementById("auth-name").value = "";
          document.getElementById("auth-email").value = "";
          document.getElementById("auth-password").value = "";
          document.getElementById("auth-role").value = "student";
          hide("landing");
          show("auth-panel");
        });
      });
      document.getElementById("login-submit").onclick = () => authenticateCredentials("login");
      document.getElementById("signup-submit").onclick = () => authenticateCredentials("signup");
      document.querySelectorAll("[data-provider]").forEach((button) => {
        button.addEventListener("click", () => authenticateProvider(button.dataset.provider));
      });
    }

    function renderShell() {
      document.body.classList.toggle("light", theme === "light");
      if (token && user) {
        hide("public-shell");
        show("app-shell");
        document.getElementById("logout").onclick = logout;
        const themeButton = document.getElementById("theme-toggle");
        themeButton.textContent = theme === "light" ? "Light" : "Dark";
        themeButton.onclick = () => {
          theme = theme === "light" ? "dark" : "light";
          localStorage.setItem("learnlink_theme", theme);
          renderShell();
        };
        const search = document.getElementById("global-search");
        search.value = searchQuery;
        search.oninput = () => {
          searchQuery = search.value.trim().toLowerCase();
          renderActiveTab();
        };
        renderNav();
        renderActiveTab();
      } else {
        show("public-shell");
        hide("app-shell");
        show("landing");
        hide("auth-panel");
        document.getElementById("public-actions").innerHTML = '<button class="secondary" data-auth-mode="login">Login</button><button data-auth-mode="signup">Sign up</button>';
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
        '<div class="card"><h3>Account</h3><div class="stat-row"><span>Name</span><strong>' + escapeHtml(user.name) + '</strong></div><div class="stat-row"><span>Role</span><strong>' + escapeHtml(user.roles.join(", ")) + '</strong></div><div class="stat-row"><span>Gateway</span><strong>Online</strong></div></div>' +
        '<div class="card"><h3>Agent Health</h3><div class="stat-row"><span>Moderation</span><strong>Active</strong></div><div class="stat-row"><span>Ranking</span><strong>Session</strong></div><div class="stat-row"><span>Eligibility</span><strong>Nightly</strong></div></div>' +
        '<div class="card"><h3>Posting Rules</h3><p class="muted">Community and channel posts enter your review queue first. Approved posts appear in feeds; rejected posts show the reason.</p></div>';
    }

    function renderActiveTab() {
      setHeader(tabLabels[activeTab], tabSubtitles[activeTab]);
      renderRightPanel();
      if (activeTab === "feed") return renderFeedTab();
      if (activeTab === "my_posts") return renderMyPostsTab();
      if (activeTab === "courses") return renderApiCards("Courses", "/courses", "courses", (item) => [item.title, item.description || item.category || "Course record", item.is_paid ? "Paid" : "Free"]);
      if (activeTab === "jobs") return renderApiCards("Jobs", "/jobs", "jobs", (item) => [item.title, (item.company || "Company") + " - " + (item.location || "Location TBD"), item.is_active === false ? "Draft" : "Active"]);
      if (activeTab === "community") return renderCommunityTab();
      if (activeTab === "channels") return renderChannelsTab();
      if (activeTab === "admin") return renderAdminTab();
    }

    function renderCards(title, rows, composerType) {
      const filteredRows = rows.filter((row) => !searchQuery || row.join(" ").toLowerCase().includes(searchQuery));
      const composer = composerType ? renderInlineComposer(composerType) : "";
      document.getElementById("main-panel").innerHTML =
        '<div class="page-header"><h2>' + title + '</h2><p class="muted">' + tabSubtitles[activeTab] + '</p></div>' +
        composer +
        '<div class="list-grid">' + (filteredRows.length ? filteredRows : [["No results", "Try a different search term or create a new post.", "Empty"]]).map((row) => '<article class="card preview-item"><div><strong>' + escapeHtml(row[0]) + '</strong><p class="muted">' + escapeHtml(row[1]) + '</p></div><span class="badge">' + escapeHtml(row[2]) + '</span></article>').join("") + '</div>';
      if (composerType) bindInlineComposer(composerType);
    }

    async function renderApiCards(title, endpoint, key, mapRow, composerType) {
      document.getElementById("main-panel").innerHTML = '<div class="page-header"><h2>' + title + '</h2><p class="muted">Loading records...</p></div>';
      const response = await fetch(gatewayUrl + endpoint, { headers: { authorization: "Bearer " + token } });
      if (response.status === 401) return logout();
      const payload = await response.json();
      const rows = (payload[key] || []).map(mapRow);
      renderCards(title, rows.length ? rows : [["No records yet", "Create records from the owning service API.", "Empty"]], composerType);
    }

    async function renderCommunityTab() {
      document.getElementById("main-panel").innerHTML = '<div class="page-header"><h2>Community</h2><p class="muted">Loading communities...</p></div>';
      const response = await fetch(gatewayUrl + "/community/communities", { headers: { authorization: "Bearer " + token } });
      if (response.status === 401) return logout();
      const payload = await response.json();
      const communities = payload.communities || [];
      renderGroupedDirectory({
        title: "Community",
        intro: "Your communities are shown first. Public communities from all around the world are listed below.",
        mineTitle: "Your Communities",
        worldTitle: "All Around World Communities",
        items: communities,
        emptyMine: "You have not created a community yet. Create one from My Posts.",
        emptyWorld: "No public communities found.",
        badge: (item) => item.allows_public_posts ? "public posting" : "owner curated",
        description: (item) => item.description || "Community record"
      });
    }

    async function renderChannelsTab() {
      document.getElementById("main-panel").innerHTML = '<div class="page-header"><h2>Channels</h2><p class="muted">Loading channels...</p></div>';
      const response = await fetch(gatewayUrl + "/community/channels", { headers: { authorization: "Bearer " + token } });
      if (response.status === 401) return logout();
      const payload = await response.json();
      const channels = payload.channels || [];
      renderGroupedDirectory({
        title: "Channels",
        intro: "Your channels are shown first. Creator channels from all around the world are listed below.",
        mineTitle: "Your Channels",
        worldTitle: "All Around World Channels",
        items: channels,
        emptyMine: "You have not created a channel yet. Create one from My Posts before posting.",
        emptyWorld: "No global channels found.",
        badge: (item) => item.is_paid ? "paid" : "free",
        description: (item) => item.description || "Channel record"
      });
    }

    function renderGroupedDirectory({ title, intro, mineTitle, worldTitle, items, emptyMine, emptyWorld, badge, description }) {
      const filtered = items.filter((item) => !searchQuery || (String(item.name || "") + " " + String(item.description || "")).toLowerCase().includes(searchQuery));
      const mine = filtered.filter((item) => String(item.owner_id || "") === String(user.id || ""));
      const world = filtered.filter((item) => String(item.owner_id || "") !== String(user.id || ""));
      document.getElementById("main-panel").innerHTML =
        '<div class="page-header"><h2>' + title + '</h2><p class="muted">' + intro + '</p></div>' +
        renderDirectorySection(mineTitle, mine, emptyMine, badge, description) +
        '<hr class="section-separator" />' +
        renderDirectorySection(worldTitle, world, emptyWorld, badge, description);
    }

    function renderDirectorySection(title, rows, emptyText, badge, description) {
      return '<section><div class="section-label"><h3>' + escapeHtml(title) + '</h3><span class="muted">' + rows.length + ' total</span></div><div class="list-grid">' +
        (rows.length ? rows.map((item) => '<article class="card preview-item"><div><strong>' + escapeHtml(item.name) + '</strong><p class="muted">' + escapeHtml(description(item)) + '</p></div><span class="badge">' + escapeHtml(badge(item)) + '</span></article>').join("") : '<article class="card"><h3>' + escapeHtml(emptyText) + '</h3></article>') +
        '</div></section>';
    }

    function renderInlineComposer(postType) {
      const label = postType === "channel_post" ? "Create channel post" : "Create community post";
      return '<div class="card composer"><h3>' + label + '</h3><textarea id="inline-post" placeholder="Post news, updates, or discussion for this space"></textarea><div class="form-grid"><label>Media image URL<input id="inline-media" placeholder="https://..." /></label><p><button id="inline-submit">Submit for AI Review</button></p></div><p class="muted">Your agent reviews this before it appears in user feeds.</p></div>';
    }

    function bindInlineComposer(postType) {
      document.getElementById("inline-submit").addEventListener("click", async () => {
        await submitPost(postType, "inline-post", "inline-media");
      });
    }

    async function renderAdminTab() {
      document.getElementById("main-panel").innerHTML = '<div class="page-header"><h2>Admin</h2><p class="muted">Loading persisted operations data...</p></div>';
      const response = await fetch(gatewayUrl + "/admin/overview", { headers: { authorization: "Bearer " + token } });
      if (response.status === 401) return logout();
      if (response.status === 403) return renderCards("Admin", [["Admin role required", "Use Admin Login to access oversight panels.", "Locked"]]);
      const payload = await response.json();
      renderCards("Admin", [
        ["Moderation Log", (payload.moderation_log || []).length + " persisted moderation records.", "View"],
        ["Agent Logs", (payload.agent_logs || []).length + " persisted agent executions.", "Healthy"],
        ["Feature Flags", Object.keys(payload.feature_flags || {}).length + " configurable flags.", payload.persistence || "storage"]
      ]);
    }

    async function renderFeedTab() {
      await loadFeed();
      document.getElementById("main-panel").innerHTML =
        '<div class="page-header"><h2>Home Feed</h2><p class="muted">Approved community, channel, and profile posts from your followed sources.</p></div>' +
        '<div id="feed" class="list-grid"></div>';
      renderFeedPosts();
    }

    async function renderMyPostsTab() {
      await loadPostWorkspace();
      document.getElementById("main-panel").innerHTML =
        '<div class="page-header"><h2>My Posts</h2><p class="muted">Create channel/community/profile posts and track AI moderation plus owner approvals.</p></div>' +
        renderPostComposer() +
        '<div class="page-header"><h2>Review Queue</h2><p class="muted">Pending means AI review or community-owner approval is still in progress.</p></div><div id="my-posts" class="status-grid"></div><div id="owner-review"></div>';
      bindPostWorkspace();
      renderMyPosts();
    }

    function renderPostComposer() {
      return '<div class="card composer"><h3>Create post</h3><div class="form-grid"><label>Destination<select id="post-type"><option value="community_post">Community post</option><option value="channel_post">My channel post</option><option value="platform_post">Public profile post</option></select></label><label>Media image URL<input id="media-url" placeholder="https://example.com/image.jpg" /></label></div><div class="media-tools"><label class="upload-box">Upload images from device<input id="media-files" type="file" accept="image/*" multiple /></label><div id="media-preview" class="media-preview"></div></div><div id="target-panel" class="target-panel"></div><textarea id="post" placeholder="Share news, learning updates, or discussion"></textarea><p class="actions"><button id="submit">Submit for AI Review</button><button class="secondary" id="clear-media" type="button">Clear images</button></p><p id="post-message" class="muted"></p></div>';
    }

    function bindPostWorkspace() {
      const typeSelect = document.getElementById("post-type");
      typeSelect.value = postMode;
      typeSelect.onchange = () => {
        postMode = typeSelect.value;
        renderTargetPanel();
      };
      document.getElementById("submit").addEventListener("click", submitWorkspacePost);
      document.getElementById("media-files").onchange = handlePostImageSelection;
      document.getElementById("clear-media").onclick = clearSelectedPostImages;
      renderMediaPreview();
      renderTargetPanel();
    }

    async function handlePostImageSelection(event) {
      const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
      const images = await Promise.all(files.map(fileToDataUrl));
      selectedPostImages = selectedPostImages.concat(images);
      renderMediaPreview();
    }

    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, src: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function clearSelectedPostImages() {
      selectedPostImages = [];
      const input = document.getElementById("media-files");
      if (input) input.value = "";
      renderMediaPreview();
    }

    function renderMediaPreview() {
      const preview = document.getElementById("media-preview");
      if (!preview) return;
      preview.innerHTML = selectedPostImages.length
        ? selectedPostImages.map((image, index) => '<img src="' + escapeHtml(image.src) + '" alt="' + escapeHtml(image.name || ("Selected image " + (index + 1))) + '" title="' + escapeHtml(image.name || "Selected image") + '" />').join("")
        : '<p class="muted">Select one or more images. They will appear as swipeable media inside the post.</p>';
    }

    function renderTargetPanel() {
      const panel = document.getElementById("target-panel");
      if (!panel) return;
      if (postMode === "platform_post") {
        panel.innerHTML = '<p class="muted">This post publishes to your public profile after the Admin AI agent approves it.</p>';
        return;
      }
      if (postMode === "channel_post") {
        panel.innerHTML =
          '<h3>Choose your channel</h3>' +
          (myChannels.length ? '<label>Channel<select id="target-id">' + myChannels.map((channel) => '<option value="' + escapeHtml(channel.id) + '">' + escapeHtml(channel.name) + '</option>').join("") + '</select></label>' : '<p class="muted">No channel found for this account. Create one before posting.</p>') +
          '<div class="mini-form"><label>New channel<input id="new-channel-name" placeholder="Data Mentorship" /></label><label>Description<input id="new-channel-description" placeholder="What this channel is about" /></label><button id="create-channel" type="button">Create channel</button></div>';
        document.getElementById("create-channel").onclick = createChannelFromForm;
        return;
      }
      panel.innerHTML =
        '<h3>Select a community</h3><label>Search public-posting communities<input id="community-search" placeholder="Search by community name" /></label>' +
        '<label>Community<select id="target-id">' + (postableCommunities.length ? postableCommunities.map((community) => '<option value="' + escapeHtml(community.id) + '">' + escapeHtml(community.name) + '</option>').join("") : '<option value="">No postable communities found</option>') + '</select></label>' +
        '<div class="mini-form"><label>New community<input id="new-community-name" placeholder="AI Study Circle" /></label><label>Description<input id="new-community-description" placeholder="Community purpose" /></label><button id="create-community" type="button">Create community</button></div>' +
        '<label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input id="community-public" type="checkbox" checked style="width:auto;margin:0" /> Allow everyone to submit posts for owner approval</label>';
      document.getElementById("community-search").oninput = async (event) => {
        await loadPostableCommunities(event.target.value);
        renderTargetPanel();
      };
      document.getElementById("create-community").onclick = createCommunityFromForm;
    }

    async function createChannelFromForm() {
      const name = document.getElementById("new-channel-name").value.trim();
      const description = document.getElementById("new-channel-description").value.trim();
      const response = await fetch(gatewayUrl + "/community/channels", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token },
        body: JSON.stringify({ name, description })
      });
      const data = await response.json();
      document.getElementById("post-message").textContent = response.ok ? "Channel created. Select it and publish your post." : (data.message || data.error || "Channel could not be created.");
      await loadPostWorkspace();
      renderTargetPanel();
    }

    async function createCommunityFromForm() {
      const name = document.getElementById("new-community-name").value.trim();
      const description = document.getElementById("new-community-description").value.trim();
      const allows = document.getElementById("community-public").checked;
      const response = await fetch(gatewayUrl + "/community/communities", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token },
        body: JSON.stringify({ name, description, allows_public_posts: allows })
      });
      const data = await response.json();
      document.getElementById("post-message").textContent = response.ok ? "Community created. Public posting rule saved." : (data.message || data.error || "Community could not be created.");
      await loadPostWorkspace();
      renderTargetPanel();
    }

    function renderFeedPosts() {
      const visiblePosts = feedPosts.filter((post) => matchesQuery(post, ["author", "source", "content", "post_type"]));
      document.getElementById("feed").innerHTML = visiblePosts.length ? visiblePosts.map(renderPostCard).join("") : '<article class="card"><h3>No approved posts found</h3><p class="muted">Try another search or submit a community/channel post for review.</p></article>';
      bindPostActions();
    }

    function renderPostCard(post) {
      const status = post.status || post.ai_moderation_status || "approved";
      const reason = status === "rejected" && post.ai_moderation_reason ? '<p class="muted"><strong>Reason:</strong> ' + escapeHtml(post.ai_moderation_reason) + '</p>' : "";
      return '<article class="card feed-card" id="post-' + escapeHtml(postKey(post)) + '"><h3>' + escapeHtml(post.author || post.author_id || "LearnLink user") + ' <span class="badge ' + escapeHtml(status) + '">' + escapeHtml(status) + '</span></h3><p class="muted">' + escapeHtml(post.source || post.post_type || "Platform-wide") + '</p><p>' + escapeHtml(post.content) + '</p>' + renderPostMedia(post) + reason + renderPostActions(post) + renderPostComments(post) + '</article>';
    }

    function renderPostMedia(post) {
      const media = normalizeMedia(post.media_url);
      if (!media.length) return "";
      return '<div class="media-carousel" aria-label="Post images">' + media.map((src, index) => '<figure class="media-slide"><img class="post-media" src="' + escapeHtml(src) + '" alt="Post image ' + (index + 1) + '" /><figcaption class="media-count">' + (index + 1) + ' / ' + media.length + '</figcaption></figure>').join("") + '</div>';
    }

    function getPostInteractions(post) {
      const likes = Number(localStorage.getItem(interactionKey(post, "likes")) || "0");
      const liked = localStorage.getItem(interactionKey(post, "liked")) === "true";
      const comments = JSON.parse(localStorage.getItem(interactionKey(post, "comments")) || "[]");
      return { likes, liked, comments };
    }

    function renderPostActions(post) {
      const state = getPostInteractions(post);
      const key = escapeHtml(postKey(post));
      return '<div class="post-actions"><button data-like-post="' + key + '" class="' + (state.liked ? "active" : "") + '">Like ' + state.likes + '</button><button data-comment-post="' + key + '">Comment ' + state.comments.length + '</button><button data-share-post="' + key + '">Share</button></div>';
    }

    function renderPostComments(post) {
      const state = getPostInteractions(post);
      const key = escapeHtml(postKey(post));
      return '<div class="comments" id="comments-' + key + '">' +
        (state.comments.length ? state.comments.map((comment) => '<div class="comment-row"><strong>' + escapeHtml(comment.author || "You") + '</strong><p>' + escapeHtml(comment.text) + '</p></div>').join("") : '<p class="muted">No comments yet.</p>') +
        '<div class="comment-form"><input data-comment-input="' + key + '" placeholder="Write a comment..." /><button data-add-comment="' + key + '">Post</button></div></div>';
    }

    function findRenderedPost(key) {
      return feedPosts.concat(myPosts, ownerReviewPosts).find((post) => postKey(post) === key);
    }

    function bindPostActions() {
      document.querySelectorAll("[data-like-post]").forEach((button) => {
        button.onclick = () => {
          const post = findRenderedPost(button.dataset.likePost);
          if (!post) return;
          const state = getPostInteractions(post);
          const nextLiked = !state.liked;
          localStorage.setItem(interactionKey(post, "liked"), String(nextLiked));
          localStorage.setItem(interactionKey(post, "likes"), String(Math.max(0, state.likes + (nextLiked ? 1 : -1))));
          renderFeedPosts();
        };
      });
      document.querySelectorAll("[data-share-post]").forEach((button) => {
        button.onclick = async () => {
          const url = location.origin + location.pathname + "#post-" + button.dataset.sharePost;
          if (navigator.clipboard) await navigator.clipboard.writeText(url);
          button.textContent = "Copied";
          setTimeout(() => { button.textContent = "Share"; }, 1200);
        };
      });
      document.querySelectorAll("[data-add-comment]").forEach((button) => {
        button.onclick = () => {
          const post = findRenderedPost(button.dataset.addComment);
          const input = document.querySelector('[data-comment-input="' + button.dataset.addComment + '"]');
          if (!post || !input || !input.value.trim()) return;
          const state = getPostInteractions(post);
          state.comments.push({ author: user?.name || "You", text: input.value.trim(), created_at: new Date().toISOString() });
          localStorage.setItem(interactionKey(post, "comments"), JSON.stringify(state.comments));
          renderFeedPosts();
        };
      });
    }

    function renderMyPosts() {
      const statuses = [
        ["pending", "Pending"],
        ["approved", "Approved"],
        ["rejected", "Denied"]
      ];
      document.getElementById("my-posts").innerHTML = statuses.map(([status, label]) => {
        const rows = myPosts.filter((post) => (post.status || post.ai_moderation_status) === status).filter((post) => matchesQuery(post, ["source", "content", "post_type", "ai_moderation_reason"]));
        return '<section class="card"><h3>' + label + '</h3>' + (rows.length ? rows.map(renderCompactPost).join("") : '<p class="muted">No ' + label.toLowerCase() + ' posts.</p>') + '</section>';
      }).join("");
      renderOwnerReview();
    }

    function renderOwnerReview() {
      const panel = document.getElementById("owner-review");
      if (!panel) return;
      const rows = ownerReviewPosts.filter((post) => matchesQuery(post, ["source", "content", "author", "ai_moderation_reason"]));
      panel.innerHTML = '<div class="page-header"><h2>Community Approval Requests</h2><p class="muted">Posts submitted to communities you own appear here after AI analysis. Channel posts you own are approved directly after AI analysis.</p></div>' +
        '<div class="list-grid">' + (rows.length ? rows.map((post) => '<article class="card feed-card"><h3>' + escapeHtml(post.author || "LearnLink user") + ' <span class="badge pending">owner approval</span></h3><p class="muted">' + escapeHtml(post.source || "Community post") + '</p><p>' + escapeHtml(post.content) + '</p><p class="muted">' + escapeHtml(post.ai_moderation_reason || "AI analysis complete.") + '</p><button data-approve-post="' + escapeHtml(post.id) + '">Approve post</button></article>').join("") : '<article class="card"><h3>No owner approvals</h3><p class="muted">Community submissions needing your approval will appear here.</p></article>') + '</div>';
      document.querySelectorAll("[data-approve-post]").forEach((button) => {
        button.onclick = async () => {
          await fetch(gatewayUrl + "/community/posts/" + encodeURIComponent(button.dataset.approvePost) + "/approve", {
            method: "POST",
            headers: { authorization: "Bearer " + token }
          });
          await renderMyPostsTab();
        };
      });
    }

    function renderCompactPost(post) {
      const status = post.status || post.ai_moderation_status || "pending";
      const reason = post.ai_moderation_reason ? '<p class="muted">' + escapeHtml(post.ai_moderation_reason) + '</p>' : "";
      return '<article style="border-top:1px solid var(--line);padding-top:12px;margin-top:12px"><strong>' + escapeHtml(post.source || post.post_type) + '</strong><p>' + escapeHtml(post.content) + '</p><span class="badge ' + escapeHtml(status) + '">' + escapeHtml(status) + '</span>' + reason + '</article>';
    }

    async function authenticateCredentials(mode) {
      const name = document.getElementById("auth-name").value.trim();
      const email = document.getElementById("auth-email").value.trim();
      const password = document.getElementById("auth-password").value;
      const role = document.getElementById("auth-role").value;
      const body = mode === "signup" ? { name, email, password, roles: [role] } : { email, password };
      const response = await fetch(gatewayUrl + "/auth/" + mode, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        document.getElementById("auth-error").textContent = data.message || data.error || "Authentication failed";
        return;
      }
      token = data.token;
      user = data.user;
      activeTab = "feed";
      localStorage.setItem("learnlink_token", token);
      localStorage.setItem("learnlink_user", JSON.stringify(user));
      renderShell();
    }

    async function authenticateProvider(provider) {
      const profileKey = "learnlink_provider_" + provider;
      let profile = JSON.parse(localStorage.getItem(profileKey) || "null");
      if (!profile) {
        profile = {
          name: provider === "github" ? "GitHub Learner" : "Google Learner",
          email: provider + "-learner@learnlink.local",
          password: provider + "_local_preview_secret"
        };
        localStorage.setItem(profileKey, JSON.stringify(profile));
      }
      let response = await fetch(gatewayUrl + "/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: profile.email, password: profile.password })
      });
      let data = await response.json();
      if (!response.ok) {
        response = await fetch(gatewayUrl + "/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: profile.name, email: profile.email, password: profile.password, roles: [document.getElementById("auth-role").value || "student"] })
        });
        data = await response.json();
      }
      if (!response.ok) {
        document.getElementById("auth-error").textContent = data.error || "Authentication failed";
        return;
      }
      token = data.token;
      user = data.user;
      activeTab = "feed";
      localStorage.setItem("learnlink_token", token);
      localStorage.setItem("learnlink_user", JSON.stringify(user));
      renderShell();
    }

    function logout() {
      token = null;
      user = null;
      activeTab = "feed";
      feedPosts = [];
      myPosts = [];
      searchQuery = "";
      ownerReviewPosts = [];
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

    async function loadPostWorkspace() {
      const mineResponse = await fetch(gatewayUrl + "/community/posts/mine", { headers: { authorization: "Bearer " + token } });
      if (mineResponse.status === 401) return logout();
      const mineData = await mineResponse.json();
      myPosts = mineData.posts || [];
      const ownerResponse = await fetch(gatewayUrl + "/community/posts/owner-review", { headers: { authorization: "Bearer " + token } });
      if (ownerResponse.status === 401) return logout();
      const ownerData = await ownerResponse.json();
      ownerReviewPosts = ownerData.posts || [];
      const channelsResponse = await fetch(gatewayUrl + "/community/channels/mine", { headers: { authorization: "Bearer " + token } });
      if (channelsResponse.status === 401) return logout();
      const channelsData = await channelsResponse.json();
      myChannels = channelsData.channels || [];
      await loadPostableCommunities("");
    }

    async function loadPostableCommunities(query) {
      const response = await fetch(gatewayUrl + "/community/communities/postable?q=" + encodeURIComponent(query || ""), { headers: { authorization: "Bearer " + token } });
      if (response.status === 401) return logout();
      const data = await response.json();
      postableCommunities = data.communities || [];
    }

    async function submitWorkspacePost() {
      const content = document.getElementById("post").value.trim();
      const mediaUrl = document.getElementById("media-url").value.trim();
      const mediaUrls = [mediaUrl].filter(Boolean).concat(selectedPostImages.map((image) => image.src));
      const target = document.getElementById("target-id");
      const targetId = target ? target.value : "";
      if (!content) return;
      const response = await fetch(gatewayUrl + "/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token },
        body: JSON.stringify({ content, post_type: postMode || "community_post", target_id: targetId, media_urls: mediaUrls })
      });
      const data = await response.json();
      document.getElementById("post-message").textContent = response.ok ? "Post submitted. Check the review queue below." : (data.message || data.error || "Post could not be submitted.");
      if (response.ok) {
        document.getElementById("post").value = "";
        document.getElementById("media-url").value = "";
        clearSelectedPostImages();
        await renderMyPostsTab();
      }
    }

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
