import http from "node:http";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LearnLink Local Preview</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #f7f9fc; color: #17202a; }
    header { background: white; border-bottom: 1px solid #d8e0ea; padding: 16px 24px; }
    nav { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    main { max-width: 1120px; margin: 0 auto; padding: 28px 24px; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .app-grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; }
    .card { background: white; border: 1px solid #d8e0ea; border-radius: 8px; padding: 18px; margin-bottom: 16px; }
    .hero { padding: 34px 0; }
    .hero h1 { font-size: 44px; margin: 0 0 10px; }
    .hero p { max-width: 720px; line-height: 1.6; color: #475569; }
    .badge { display: inline-block; border-radius: 999px; background: #ecfdf5; color: #0f766e; padding: 4px 10px; font-size: 12px; }
    input, textarea, select { width: 100%; border: 1px solid #d8e0ea; border-radius: 6px; padding: 10px; margin-top: 6px; }
    textarea { min-height: 90px; }
    button { border: 0; border-radius: 6px; background: #2563eb; color: white; padding: 10px 14px; cursor: pointer; }
    button.secondary { background: white; border: 1px solid #d8e0ea; color: #17202a; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .muted { color: #64748b; }
    .hidden { display: none; }
    @media (max-width: 850px) { .grid, .app-grid { grid-template-columns: 1fr; } .hero h1 { font-size: 34px; } }
  </style>
</head>
<body>
  <header>
    <nav>
      <div>
        <strong>LearnLink</strong>
        <div class="muted">AI-operated education, community, and jobs</div>
      </div>
      <div class="actions" id="nav-actions">
        <button class="secondary" data-auth-mode="login">Login</button>
        <button data-auth-mode="signup">Sign up</button>
      </div>
    </nav>
  </header>

  <main>
    <section id="landing">
      <div class="hero">
        <h1>LearnLink</h1>
        <p>Build skills, join AI-moderated communities, attend live classes, and find career opportunities from one connected learning platform.</p>
        <div class="actions">
          <button data-auth-mode="signup">Create account</button>
          <button class="secondary" data-auth-mode="login">Login</button>
        </div>
      </div>

      <div class="grid">
        <article class="card">
          <h2>Personalized Learning</h2>
          <p>Resume and onboarding-aware course recommendations, teacher uploads, quizzes, roadmaps, and live classes.</p>
        </article>
        <article class="card">
          <h2>Community and Channels</h2>
          <p>Public communities, creator channels, paid subscriptions, follows, and autonomous AI moderation before posts go live.</p>
        </article>
        <article class="card">
          <h2>Jobs and Growth</h2>
          <p>Recruiter job posts, job search, one-click apply, premium profile boosts, and role-matched learning paths.</p>
        </article>
      </div>
    </section>

    <section id="auth-panel" class="card hidden">
      <h2 id="auth-title">Login</h2>
      <p class="muted">A local dev account is enough to unlock the preview feed.</p>
      <label>Name<input id="name" placeholder="Your name" /></label>
      <label>Email<input id="email" placeholder="you@example.com" /></label>
      <label>Role
        <select id="role">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="recruiter">Recruiter</option>
        </select>
      </label>
      <p class="actions">
        <button id="auth-submit">Continue</button>
        <button class="secondary" id="auth-cancel">Back</button>
      </p>
      <p id="auth-error" class="muted"></p>
    </section>

    <section id="app" class="app-grid hidden">
      <section>
        <div class="card">
          <h2>Create platform post</h2>
          <p class="muted">Only logged-in users can create or view posts.</p>
          <textarea id="post" placeholder="Write a local test post"></textarea>
          <p><button id="submit">Submit for AI Review</button></p>
        </div>
        <div id="feed"></div>
      </section>
      <aside>
        <div class="card"><strong>Signed in</strong><p id="signed-in-user">-</p></div>
        <div class="card"><strong>Gateway</strong><p id="gateway">Checking...</p></div>
        <div class="card"><strong>Feed source</strong><p>Local backend</p></div>
      </aside>
    </section>
  </main>

  <script>
    const gatewayUrl = "http://localhost:4000";
    let authMode = "login";
    let token = localStorage.getItem("learnlink_token");
    let user = JSON.parse(localStorage.getItem("learnlink_user") || "null");

    const show = (id) => document.getElementById(id).classList.remove("hidden");
    const hide = (id) => document.getElementById(id).classList.add("hidden");

    function renderShell() {
      if (token && user) {
        hide("landing");
        hide("auth-panel");
        show("app");
        document.getElementById("signed-in-user").textContent = user.name + " (" + user.roles.join(", ") + ")";
        document.getElementById("nav-actions").innerHTML = '<button class="secondary" id="logout">Logout</button>';
        document.getElementById("logout").addEventListener("click", logout);
        loadFeed();
      } else {
        show("landing");
        hide("auth-panel");
        hide("app");
        document.getElementById("nav-actions").innerHTML = '<button class="secondary" data-auth-mode="login">Login</button><button data-auth-mode="signup">Sign up</button>';
        bindAuthButtons();
      }
    }

    function bindAuthButtons() {
      document.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          authMode = button.dataset.authMode;
          document.getElementById("auth-title").textContent = authMode === "signup" ? "Create account" : "Login";
          hide("landing");
          show("auth-panel");
        });
      });
    }

    async function authenticate() {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const role = document.getElementById("role").value;
      const path = authMode === "signup" ? "/auth/signup" : "/auth/login";

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
      localStorage.setItem("learnlink_token", token);
      localStorage.setItem("learnlink_user", JSON.stringify(user));
      renderShell();
    }

    function logout() {
      token = null;
      user = null;
      localStorage.removeItem("learnlink_token");
      localStorage.removeItem("learnlink_user");
      renderShell();
    }

    async function loadFeed() {
      const response = await fetch(gatewayUrl + "/community/feed/demo-user", {
        headers: { authorization: "Bearer " + token }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      const data = await response.json();
      document.getElementById("gateway").textContent = "Online";
      document.getElementById("feed").innerHTML = data.posts.map((post) => \`
        <article class="card">
          <h2>\${post.author || post.author_id || "LearnLink user"} <span class="badge">\${post.status || post.ai_moderation_status || "approved"}</span></h2>
          <p><small>\${post.source || post.post_type || "Platform-wide"}</small></p>
          <p>\${post.content}</p>
          <p><small>\${post.metrics || "Live API item"}</small></p>
        </article>\`).join("");
    }

    document.getElementById("auth-submit").addEventListener("click", authenticate);
    document.getElementById("auth-cancel").addEventListener("click", renderShell);
    document.getElementById("submit").addEventListener("click", async () => {
      const content = document.getElementById("post").value.trim();
      if (!content) return;
      await fetch(gatewayUrl + "/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token },
        body: JSON.stringify({ content, post_type: "platform_post" })
      });
      document.getElementById("post").value = "";
      await loadFeed();
    });

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
